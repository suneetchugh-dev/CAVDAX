/**
 * CAVDAX Backend Gateway & Enclosed MCP API
 * Exposes REST & SSE endpoints for the Porcelain Dark Web HUD and coding agents.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

import { getFalkorClient } from '../../core/graph/client.js';
import {
  seedDemoGraph,
  fetchGraphState,
  verifyActionGate,
  revalidateDecision,
  fetchAuditLog
} from '../../core/graph/queries.js';
import { ingestAdrFile } from '../../core/ingestion/parser.js';
import { CavdaxMcpServer } from '../../core/mcp/server.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// AUTH MIDDLEWARE
// ---------------------------------------------------------------------------
// Reads MCP_API_TOKEN from environment. If the variable is not set (e.g. local
// dev without a .env), auth is skipped and a warning is printed once on boot.
// When set, every protected write endpoint requires:
//   Authorization: Bearer <token>
const API_TOKEN = process.env.MCP_API_TOKEN || null;

if (!API_TOKEN) {
  console.warn(
    '[CAVDAX Auth] ⚠️  MCP_API_TOKEN is not set — write endpoints are unprotected. ' +
    'Set MCP_API_TOKEN in your .env file before deploying to production.'
  );
}

/**
 * Express middleware that enforces Bearer token auth on write endpoints.
 * Skipped transparently when MCP_API_TOKEN env var is absent (local dev mode).
 */
function requireAuth(req, res, next) {
  if (!API_TOKEN) return next(); // dev mode — no token configured, skip

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== API_TOKEN) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'A valid Bearer token is required. Set Authorization: Bearer <MCP_API_TOKEN>.'
    });
  }

  next();
}

// ---------------------------------------------------------------------------
// SSE CLIENT REGISTRIES
// ---------------------------------------------------------------------------

// In-memory SSE client registry for real-time Web HUD push notifications
const sseClients = new Set();

// In-memory registry of active remote MCP SSE agent sessions (MCP 2024-11-05)
// Each entry: { id, res, createdAt }
const mcpSessions = new Map();

// TTL for idle MCP SSE sessions — clean up sessions whose HTTP connection was
// dropped without a 'close' event (e.g. network failures, proxy crashes).
const MCP_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of mcpSessions) {
    if (now - session.createdAt > MCP_SESSION_TTL_MS) {
      try { session.res.end(); } catch { /* already closed */ }
      mcpSessions.delete(sessionId);
      console.log(`[CAVDAX SSE] Evicted stale MCP session ${sessionId} (TTL exceeded)`);
    }
  }
}, 60 * 1000).unref(); // .unref() so the interval doesn't keep the process alive during tests

function broadcastEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  for (const client of sseClients) {
    try {
      client.write(`event: ${eventType}\ndata: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Global state
let db = null;
let graph = null;
let mcpServer = null;
let isFalkorConnected = false;

// Initialize FalkorDB connection
async function initDb() {
  try {
    const clients = await getFalkorClient();
    db = clients.db;
    graph = clients.graph;
    mcpServer = new CavdaxMcpServer(graph);
    isFalkorConnected = true;
    console.log('[CAVDAX Server] Successfully connected to FalkorDB.');
  } catch (err) {
    console.warn('[CAVDAX Server] FalkorDB connection failed on boot. Will retry on request.', err.message);
    isFalkorConnected = false;
  }
}

// Fallback in-memory mock if FalkorDB container is spinning up
let fallbackGraphState = {
  nodes: [
    { id: 'ADR-001', label: 'Source', title: 'Adopt TokenAuth v1 for Payment Gateway', status: 'ACTIVE', type: 'ADR' },
    { id: 'F-Auth-v1', label: 'Fact', claim: 'Payment services require TokenAuth v1', is_stale: false, verified: true },
    { id: 'DEC-102', label: 'Decision', title: 'Generate Checkout Service with TokenAuth v1', status: 'VALID' },
    { id: 'ADR-002', label: 'Source', title: 'Mandatory Migration to OAuth2; TokenAuth v1 Decommissioned', status: 'ACTIVE', type: 'ADR' },
    { id: 'F-OAuth2', label: 'Fact', claim: 'OAuth2 is strictly enforced; TokenAuth v1 prohibited', is_stale: false, verified: true }
  ],
  edges: [
    { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
    { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' },
    { source: 'F-OAuth2', target: 'ADR-002', type: 'EXTRACTED_FROM' }
  ]
};

// ---------------------------------------------------------------------------
// REST ENDPOINTS
// ---------------------------------------------------------------------------

// 1. Health & Connection Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'CAVDAX',
    expansion: 'Contextual Action & Verified Decision Autonomous eXecution',
    falkordb_connected: isFalkorConnected,
    timestamp: new Date().toISOString()
  });
});

// 2. Real-time Server-Sent Events (SSE)
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'CAVDAX SSE Stream Live' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 3. Seed Demo Graph
app.post('/api/seed', requireAuth, async (req, res) => {
  try {
    if (!isFalkorConnected) await initDb();

    if (graph) {
      await seedDemoGraph(graph);
      const graphState = await fetchGraphState(graph);
      broadcastEvent('GRAPH_UPDATED', graphState);
      return res.json({ success: true, message: 'FalkorDB demo graph seeded successfully.', graph: graphState });
    } else {
      // Return fallback state
      broadcastEvent('GRAPH_UPDATED', fallbackGraphState);
      return res.json({ success: true, message: 'Seeded in fallback simulation mode.', graph: fallbackGraphState });
    }
  } catch (err) {
    console.error('Seed Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Fetch Live Graph State for Visualizer Canvas
app.get('/api/graph', async (req, res) => {
  try {
    if (!isFalkorConnected) await initDb();

    if (graph) {
      const graphState = await fetchGraphState(graph);
      return res.json(graphState);
    } else {
      return res.json(fallbackGraphState);
    }
  } catch (err) {
    console.error('Fetch Graph Error:', err);
    res.json(fallbackGraphState);
  }
});

// 5. Ingest ADR / Commit Mutation (Act II)
app.post('/api/ingest', requireAuth, async (req, res) => {
  try {
    if (!isFalkorConnected) await initDb();
    const filePath = req.body?.filePath || path.join(REPO_ROOT, 'demo-repo/docs/adrs/ADR-002.md');

    if (graph) {
      const ingestResult = await ingestAdrFile(graph, filePath);
      const updatedGraph = await fetchGraphState(graph);
      
      broadcastEvent('MUTATION_INGESTED', { ingestResult, graph: updatedGraph });
      broadcastEvent('GRAPH_UPDATED', updatedGraph);

      return res.json({
        success: true,
        ingestResult,
        graph: updatedGraph
      });
    } else {
      // In fallback simulation mode: mutate fallbackGraphState
      const adr001 = fallbackGraphState.nodes.find(n => n.id === 'ADR-001');
      if (adr001) adr001.status = 'SUPERSEDED';

      const f1 = fallbackGraphState.nodes.find(n => n.id === 'F-Auth-v1');
      if (f1) f1.is_stale = true;

      const d1 = fallbackGraphState.nodes.find(n => n.id === 'DEC-102');
      if (d1) d1.status = 'INVALIDATED_NEEDS_REVALIDATION';

      // Add supersedes edge
      fallbackGraphState.edges.push({ source: 'ADR-002', target: 'ADR-001', type: 'SUPERSEDES' });

      broadcastEvent('MUTATION_INGESTED', { adr_id: 'ADR-002', supersedes: 'ADR-001', graph: fallbackGraphState });
      broadcastEvent('GRAPH_UPDATED', fallbackGraphState);

      return res.json({
        success: true,
        simulated: true,
        ingestResult: {
          adr_id: 'ADR-002',
          supersedes: 'ADR-001',
          invalidation: { affected_decisions: 1, invalidated_decision_ids: ['DEC-102'], latency_ms: 2.1 }
        },
        graph: fallbackGraphState
      });
    }
  } catch (err) {
    console.error('Ingest Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Enclosed MCP Gate Execution (Act III & Safe Execution)
app.post('/api/mcp/call', requireAuth, async (req, res) => {
  const { toolName, args } = req.body || {};

  // --- Input validation: fail fast with a clean 400 before touching the DB ---
  // Without this, undefined args crash mcpServer.handleToolCall with a TypeError
  // and undefined decision_id causes FalkorDB parameter serialisation exceptions,
  // both returning an opaque 500 to the caller.
  if (!toolName || typeof toolName !== 'string') {
    return res.status(400).json({
      isError: true,
      error: "Missing or invalid 'toolName'. Must be 'apply_code_change' or 'revalidate_decision'."
    });
  }

  if (!args || typeof args !== 'object') {
    return res.status(400).json({
      isError: true,
      error: "Missing or invalid 'args' object payload."
    });
  }

  if (toolName === 'apply_code_change') {
    if (!args.decision_id || typeof args.decision_id !== 'string') {
      return res.status(400).json({
        isError: true,
        error: "Missing required parameter 'args.decision_id' for tool 'apply_code_change'."
      });
    }
    if (!args.file_path || !args.code_payload) {
      return res.status(400).json({
        isError: true,
        error: "Missing required parameters 'args.file_path' and/or 'args.code_payload'."
      });
    }
  } else if (toolName === 'revalidate_decision') {
    const required = ['new_source_id', 'old_decision_id', 'new_decision_id', 'new_fact_id', 'title'];
    const missing = required.filter(field => !args[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        isError: true,
        error: `Missing required parameter(s) for 'revalidate_decision': ${missing.join(', ')}`
      });
    }
  } else {
    return res.status(400).json({
      isError: true,
      error: `Unsupported MCP tool: '${toolName}'. Supported tools: 'apply_code_change', 'revalidate_decision'.`
    });
  }
  // --- End validation ---

  try {
    if (!isFalkorConnected) await initDb();

    if (mcpServer) {
      const result = await mcpServer.handleToolCall(toolName, args);
      const updatedGraph = await fetchGraphState(graph);

      broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result });
      broadcastEvent('GRAPH_UPDATED', updatedGraph);

      return res.json(result);
    } else {
      // Fallback simulation mode
      if (toolName === 'apply_code_change') {
        const isDec102 = args.decision_id === 'DEC-102';
        const dNode = fallbackGraphState.nodes.find(n => n.id === args.decision_id);
        const isInvalidated = dNode && dNode.status === 'INVALIDATED_NEEDS_REVALIDATION';

        if (isInvalidated || isDec102) {
          const rejectResponse = {
            isError: true,
            simulated: true, // FalkorDB offline — in-memory simulation
            simulated_warning: 'FalkorDB offline — returned from in-memory simulation',
            gate_verdict: 'BLOCKED_SUPERSEDED_SOURCE',
            decision_id: args.decision_id,
            latency_ms: 0,             // Real query latency is 0 (no DB was queried)
            simulated_latency_ms: 1.84, // Reference value from prior live benchmarks
            violation_paths: [['Source:ADR-001 (SUPERSEDED)', 'Fact:F-Auth-v1 (STALE)', `Decision:${args.decision_id}`]],
            message: `⛔ CAVDAX GATE BLOCKED (SIMULATION): Execution rejected. Decision '${args.decision_id}' is grounded in superseded source 'ADR-001'. No files were written.`,
            instructions_for_agent: `To resolve this, inspect superseding source 'ADR-002', call 'revalidate_decision', and re-submit with the active decision ID.`
          };
          broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result: rejectResponse });
          return res.json(rejectResponse);
        } else {
          // Approved
          const targetPath = path.resolve(REPO_ROOT, args.file_path);
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.writeFileSync(targetPath, args.code_payload, 'utf-8');

          const actionId = `act-${Date.now()}`;
          fallbackGraphState.nodes.push({
            id: actionId,
            label: 'AgentAction',
            target_file: args.file_path,
            status: 'EXECUTED'
          });
          fallbackGraphState.edges.push({
            source: actionId,
            target: args.decision_id,
            type: 'GROUNDED_IN'
          });

          const approveResponse = {
            isError: false,
            simulated: true, // FalkorDB offline — in-memory simulation
            simulated_warning: 'FalkorDB offline — returned from in-memory simulation',
            gate_verdict: 'APPROVED',
            decision_id: args.decision_id,
            latency_ms: 0,             // Real query latency is 0 (no DB was queried)
            simulated_latency_ms: 1.62, // Reference value from prior live benchmarks
            file_path: targetPath,
            message: `✅ CAVDAX GATE APPROVED (SIMULATION): Target file written to disk.`
          };
          broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result: approveResponse });
          broadcastEvent('GRAPH_UPDATED', fallbackGraphState);
          return res.json(approveResponse);
        }
      } else if (toolName === 'revalidate_decision') {
        // Act IV simulation
        const oldD = fallbackGraphState.nodes.find(n => n.id === args.old_decision_id);
        if (oldD) oldD.status = 'REPLACED_ARCHIVED';

        fallbackGraphState.nodes.push({
          id: args.new_decision_id,
          label: 'Decision',
          title: args.title,
          status: 'VALID'
        });
        fallbackGraphState.edges.push({
          source: args.new_decision_id,
          target: args.new_fact_id,
          type: 'DEPENDS_ON'
        });
        fallbackGraphState.edges.push({
          source: args.new_decision_id,
          target: args.old_decision_id,
          type: 'REPLACES'
        });

        const revalResponse = {
          isError: false,
          simulated: true, // FalkorDB offline — in-memory simulation
          simulated_warning: 'FalkorDB offline — returned from in-memory simulation',
          message: `✅ REVALIDATION COMPLETE (SIMULATION): Decision '${args.new_decision_id}' is active and grounded in '${args.new_fact_id}'.`,
          active_decision_id: args.new_decision_id,
          latency_ms: 0,            // Real query latency is 0 (no DB was queried)
          simulated_latency_ms: 2.3 // Reference value from prior live benchmarks
        };
        broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result: revalResponse });
        broadcastEvent('GRAPH_UPDATED', fallbackGraphState);
        return res.json(revalResponse);
      }
    }
  } catch (err) {
    console.error('MCP Call Error:', err);
    res.status(500).json({ isError: true, error: err.message });
  }
});

// 7. Act IV Direct Revalidation Helper
app.post('/api/act-iv-revalidate', requireAuth, async (req, res) => {
  try {
    if (!isFalkorConnected) await initDb();

    const payload = {
      new_source_id: 'ADR-002',
      old_decision_id: 'DEC-102',
      new_decision_id: 'DEC-103',
      new_fact_id: 'F-OAuth2',
      title: 'Scaffold Payment Gateway with OAuth2 (JWT/RS256)'
    };

    if (mcpServer) {
      const result = await mcpServer.handleToolCall('revalidate_decision', payload);
      const updatedGraph = await fetchGraphState(graph);
      broadcastEvent('GRAPH_UPDATED', updatedGraph);
      return res.json({ success: true, result, graph: updatedGraph });
    } else {
      // In fallback simulation
      const oldD = fallbackGraphState.nodes.find(n => n.id === 'DEC-102');
      if (oldD) oldD.status = 'REPLACED_ARCHIVED';

      if (!fallbackGraphState.nodes.some(n => n.id === 'DEC-103')) {
        fallbackGraphState.nodes.push({
          id: 'DEC-103',
          label: 'Decision',
          title: 'Scaffold Payment Gateway with OAuth2 (JWT/RS256)',
          status: 'VALID'
        });
        fallbackGraphState.edges.push({ source: 'DEC-103', target: 'F-OAuth2', type: 'DEPENDS_ON' });
        fallbackGraphState.edges.push({ source: 'DEC-103', target: 'DEC-102', type: 'REPLACES' });
      }

      broadcastEvent('GRAPH_UPDATED', fallbackGraphState);
      return res.json({
        success: true,
        simulated: true,
        result: {
          active_decision_id: 'DEC-103',
          archived_decision_id: 'DEC-102',
          latency_ms: 2.1
        },
        graph: fallbackGraphState
      });
    }
  } catch (err) {
    console.error('Act IV Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Reset Demo Repository & Graph
app.post('/api/reset', requireAuth, async (req, res) => {
  try {
    const paymentServicePath = path.join(REPO_ROOT, 'demo-repo/src/services/payment.js');
    const initialStub = `/**
 * Payment Gateway Service
 * Target file subject to CAVDAX Enclosed MCP Guardrails.
 */

import express from 'express';

const app = express();
app.use(express.json());

// Current initial state: Unimplemented checkout route awaiting agent implementation
app.post('/api/checkout', (req, res) => {
  res.status(501).json({ error: 'Checkout route not implemented yet.' });
});

export default app;
`;
    fs.writeFileSync(paymentServicePath, initialStub, 'utf-8');

    if (!isFalkorConnected) await initDb();
    if (graph) {
      await seedDemoGraph(graph);
      const state = await fetchGraphState(graph);
      broadcastEvent('GRAPH_UPDATED', state);
      return res.json({ success: true, message: 'Reset complete.', graph: state });
    } else {
      fallbackGraphState = {
        nodes: [
          { id: 'ADR-001', label: 'Source', title: 'Adopt TokenAuth v1 for Payment Gateway', status: 'ACTIVE', type: 'ADR' },
          { id: 'F-Auth-v1', label: 'Fact', claim: 'Payment services require TokenAuth v1', is_stale: false, verified: true },
          { id: 'DEC-102', label: 'Decision', title: 'Generate Checkout Service with TokenAuth v1', status: 'VALID' },
          { id: 'ADR-002', label: 'Source', title: 'Mandatory Migration to OAuth2; TokenAuth v1 Decommissioned', status: 'ACTIVE', type: 'ADR' },
          { id: 'F-OAuth2', label: 'Fact', claim: 'OAuth2 is strictly enforced; TokenAuth v1 prohibited', is_stale: false, verified: true }
        ],
        edges: [
          { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
          { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' },
          { source: 'F-OAuth2', target: 'ADR-002', type: 'EXTRACTED_FROM' }
        ]
      };
      broadcastEvent('GRAPH_UPDATED', fallbackGraphState);
      return res.json({ success: true, simulated: true, message: 'Reset to initial state.', graph: fallbackGraphState });
    }
  } catch (err) {
    console.error('Reset Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 9. Audit Log — Agent Action History for Security & Compliance Teams
// ---------------------------------------------------------------------------

/**
 * GET /api/audit[?limit=<n>]
 *
 * Returns a time-ordered list of all AgentAction nodes written to FalkorDB by
 * the MCP gate, enriched with the grounding decision and its status.
 * This endpoint is read-only and does NOT require auth — compliance dashboards
 * and monitoring tools can poll it without a token.
 *
 * Falls back to the in-memory fallbackGraphState when FalkorDB is offline.
 *
 * Query params:
 *   limit  — max entries to return (default: 100, max: 500)
 */
app.get('/api/audit', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);

  try {
    if (!isFalkorConnected) await initDb();

    if (graph) {
      const auditData = await fetchAuditLog(graph, limit);
      return res.json({
        success: true,
        ...auditData
      });
    }

    // Fallback: derive audit entries from in-memory fallbackGraphState
    const fallbackEntries = fallbackGraphState.nodes
      .filter(n => n.label === 'AgentAction')
      .map(n => ({
        action_id:       n.id,
        target_file:     n.target_file || null,
        status:          n.status,
        executed_at:     null,
        decision_id:     fallbackGraphState.edges.find(e => e.source === n.id && e.type === 'GROUNDED_IN')?.target || null,
        decision_status: null,
        decision_title:  null
      }))
      .slice(0, limit);

    return res.json({
      success: true,
      simulated: true,
      entries: fallbackEntries,
      total: fallbackEntries.length,
      latency_ms: 0
    });
  } catch (err) {
    console.error('Audit Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// OFFICIAL MCP SSE TRANSPORT (MCP spec 2024-11-05)
// ---------------------------------------------------------------------------

/**
 * Handles a JSON-RPC 2.0 MCP request against the mcpServer (or fallback simulation).
 * Supports: initialize, notifications/initialized, tools/list, tools/call
 */
async function handleMcpJsonRpc(request) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'cavdax-causal-mcp-gate', version: '1.0.0' }
      }
    };
  }

  if (method === 'notifications/initialized') {
    return null; // notifications require no response
  }

  if (method === 'tools/list') {
    const tools = mcpServer ? mcpServer.getTools() : [];
    return { jsonrpc: '2.0', id, result: { tools } };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    if (!isFalkorConnected) await initDb();

    if (mcpServer) {
      const result = await mcpServer.handleToolCall(name, args);
      const updatedGraph = await fetchGraphState(graph);
      broadcastEvent('MCP_TOOL_EXECUTED', { toolName: name, args, result });
      broadcastEvent('GRAPH_UPDATED', updatedGraph);
      return { jsonrpc: '2.0', id, result };
    }

    // Fallback simulation (mirrors /api/mcp/call logic)
    const isStale = args?.decision_id === 'DEC-102';
    if (name === 'apply_code_change') {
      const verdict = isStale ? 'BLOCKED_SUPERSEDED_SOURCE' : 'VERIFIED_CAUSAL_PROVENANCE';
      return {
        jsonrpc: '2.0',
        id,
        result: {
          isError: isStale,
          content: [{
            type: 'text',
            text: isStale
              ? `HARD REJECT (simulation): Decision ${args.decision_id} is stale/superseded.`
              : `GATE APPROVED (simulation): Decision ${args.decision_id} verified. Verdict: ${verdict}`
          }]
        }
      };
    }

    throw new Error(`Tool not found in simulation mode: ${name}`);
  }

  throw new Error(`Method not supported: ${method}`);
}

/**
 * 10. MCP SSE Discovery & Stream Initiator
 * GET /api/mcp/sse
 *
 * Client connects here first. Server responds with an 'endpoint' event
 * containing the sessionId-scoped URL for subsequent JSON-RPC messages.
 */
app.get('/api/mcp/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx proxy buffering

  const sessionId = randomUUID();
  mcpSessions.set(sessionId, { id: sessionId, res, createdAt: Date.now() });

  // Mandatory MCP 'endpoint' event — tells the client where to POST messages
  res.write(`event: endpoint\ndata: /api/mcp/messages?sessionId=${sessionId}\n\n`);

  req.on('close', () => {
    mcpSessions.delete(sessionId);
  });
});

/**
 * 11. MCP JSON-RPC Message Receiver
 * POST /api/mcp/messages?sessionId=<sessionId>
 *
 * Client POSTs a JSON-RPC 2.0 request here. Server acknowledges with 202,
 * then streams the JSON-RPC response back on the established SSE connection.
 */
app.post('/api/mcp/messages', requireAuth, async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId || !mcpSessions.has(sessionId)) {
    return res.status(404).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -32001, message: 'Session not found or expired' }
    });
  }

  const session = mcpSessions.get(sessionId);
  const request = req.body;

  // Acknowledge receipt immediately per MCP spec
  res.status(202).json({ success: true });

  try {
    const response = await handleMcpJsonRpc(request);
    if (response) {
      session.res.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
    }
  } catch (err) {
    session.res.write(`event: message\ndata: ${JSON.stringify({
      jsonrpc: '2.0',
      id: request?.id || null,
      error: { code: -32603, message: err.message }
    })}\n\n`);
  }
});

// ---------------------------------------------------------------------------
// 9. Static Web HUD Serving & SPA Path Routing Fallback (/overview, /console, /mcp, /project, /team)
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start listening
initDb().finally(() => {
  app.listen(PORT, () => {
    console.log(`[CAVDAX Server] Running at http://localhost:${PORT}`);
    console.log(`[CAVDAX Server] Graph Engine: ${isFalkorConnected ? 'FalkorDB Live' : 'Simulation Fallback Ready'}`);
  });
});
