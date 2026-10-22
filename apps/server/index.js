/**
 * CAVDAX Backend Gateway & Enclosed MCP API
 * Exposes REST & SSE endpoints for the Porcelain Dark Web HUD and coding agents.
 */

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID, randomBytes } from 'crypto';
import { rateLimit } from 'express-rate-limit';

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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---------------------------------------------------------------------------
// SESSION MIDDLEWARE
// ---------------------------------------------------------------------------
// Used by GitHub OAuth flow to carry the authenticated user across requests.
// SESSION_SECRET must be set in .env for production.
// In-memory store is fine for a single-process server; scale to Redis later.
app.use(session({
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// ---------------------------------------------------------------------------
// TIER CONFIG & RATE LIMITING
// ---------------------------------------------------------------------------
// CAVDAX_TIER env var controls rate limits so they are consistent between
// /api/dev/tier-check (which reports them) and the actual limiters applied.
// Previously the limits were hardcoded here and only shown in tier-check —
// now both read from the same source of truth.

const CAVDAX_TIER = (process.env.CAVDAX_TIER || 'free').toLowerCase();

const TIER_CONFIG = {
  free: {
    label: 'Free',
    description: 'Local FalkorDB only. Rate limit: 100 req/min. MCP stdio transport.',
    features: ['stdio MCP', 'ADR ingestion', 'local FalkorDB'],
    rate_limit_per_min: 100,
    mcp_rate_limit_per_min: 30
  },
  pro: {
    label: 'Pro',
    description: 'Cloud FalkorDB + SSE remote MCP. Webhook ingestion enabled.',
    features: ['SSE MCP', 'all source types', 'webhook ingestion', 'audit log'],
    rate_limit_per_min: 300,
    mcp_rate_limit_per_min: 100
  },
  enterprise: {
    label: 'Enterprise',
    description: 'Multi-tenant FalkorDB. Custom rate limits. SLA guarantees.',
    features: ['multi-tenant', 'custom rate limits', 'SLA', 'RBAC'],
    rate_limit_per_min: -1,   // -1 = unlimited
    mcp_rate_limit_per_min: -1
  }
};

const activeTier = TIER_CONFIG[CAVDAX_TIER] || TIER_CONFIG.free;

// -1 means unlimited — pass a very large max so express-rate-limit is effectively off
const apiMax = activeTier.rate_limit_per_min === -1 ? 1_000_000 : activeTier.rate_limit_per_min;
const mcpMax = activeTier.mcp_rate_limit_per_min === -1 ? 1_000_000 : activeTier.mcp_rate_limit_per_min;

console.log(`[CAVDAX] Tier: ${activeTier.label} — API limit: ${activeTier.rate_limit_per_min === -1 ? 'UNLIMITED' : apiMax + ' req/min'}, MCP limit: ${activeTier.mcp_rate_limit_per_min === -1 ? 'UNLIMITED' : mcpMax + ' req/min'}`);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: apiMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests', message: `Rate limit exceeded (${apiMax} req/min). Please retry in 60 seconds.` }
});

// Strict limiter — MCP tool execution endpoints
// Prevents runaway agent loops from hammering FalkorDB with tool calls.
const mcpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: mcpMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many MCP requests', message: `MCP rate limit exceeded (${mcpMax} req/min). Check for agent loops.` }
});

app.use('/api/', apiLimiter);          // applies to all /api/* routes
app.use('/api/mcp/', mcpLimiter);      // tighter limit on MCP routes (overrides above)

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
    { id: 'F-OAuth2', label: 'Fact', claim: 'OAuth2 is strictly enforced; TokenAuth v1 prohibited', is_stale: false, verified: true },
    { id: 'act-hist-001', label: 'AgentAction', target_file: 'src/services/payment.js', status: 'EXECUTED', timestamp: Date.now() - 3600000 },
    { id: 'act-hist-002', label: 'AgentAction', target_file: 'src/services/billing.js', status: 'BLOCKED_SUPERSEDED_SOURCE', timestamp: Date.now() - 1800000 }
  ],
  edges: [
    { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
    { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' },
    { source: 'F-OAuth2', target: 'ADR-002', type: 'EXTRACTED_FROM' },
    { source: 'act-hist-001', target: 'DEC-102', type: 'GROUNDED_IN' },
    { source: 'act-hist-002', target: 'DEC-102', type: 'GROUNDED_IN' }
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
          const actionId = `act-${Date.now()}`;
          fallbackGraphState.nodes.push({
            id: actionId,
            label: 'AgentAction',
            target_file: args.file_path,
            status: 'BLOCKED_SUPERSEDED_SOURCE',
            timestamp: Date.now()
          });
          fallbackGraphState.edges.push({
            source: actionId,
            target: args.decision_id,
            type: 'GROUNDED_IN'
          });

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
            status: 'EXECUTED',
            timestamp: Date.now()
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
      .map(n => {
        const edge = fallbackGraphState.edges.find(e => e.source === n.id && e.type === 'GROUNDED_IN');
        const decisionId = edge ? edge.target : null;
        const decisionNode = decisionId ? fallbackGraphState.nodes.find(d => d.id === decisionId) : null;
        return {
          action_id:       n.id,
          target_file:     n.target_file || null,
          status:          n.status,
          executed_at:     n.timestamp || Date.now(),
          decision_id:     decisionId,
          decision_status: decisionNode ? decisionNode.status : null,
          decision_title:  decisionNode ? decisionNode.title : null
        };
      })
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
// SOURCE INGESTION ENDPOINT (Extended source types via HTTP)
// ---------------------------------------------------------------------------

/**
 * POST /api/ingest-source
 *
 * Ingest any of the 4 extended source types into FalkorDB over HTTP.
 * Useful for GitHub webhooks, CI pipelines, and external automation.
 *
 * Auth: Bearer token required (requireAuth).
 *
 * Request body:
 *   { type: 'commit'|'package'|'codeowners'|'issue', ...typeSpecificFields }
 *
 * Supported types and their required fields:
 *   commit:     { sha, message, author? }
 *   package:    { packageName, newVersion, oldVersion? }
 *   codeowners: { ownedPath, newOwner, oldOwner?, filePath? }
 *   issue:      { issueNumber, title, htmlUrl, body?, supersedesIds?, state? }
 */
app.post('/api/ingest-source', requireAuth, async (req, res) => {
  const { type, ...fields } = req.body || {};

  if (!type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: type',
      valid_types: ['commit', 'package', 'codeowners', 'issue']
    });
  }

  const validTypes = ['commit', 'package', 'codeowners', 'issue'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Unknown type "${type}"`,
      valid_types: validTypes
    });
  }

  try {
    if (!isFalkorConnected) await initDb();

    // Dynamically import sources.js (same relative path used by ingestCommand.js)
    const sources = await import('../../core/ingestion/sources.js');

    if (!graph) {
      // FalkorDB offline — return a dry-run acknowledgement
      return res.json({
        success: true,
        dry_run: true,
        type,
        message: 'FalkorDB is offline — no data written. Fields received:',
        fields
      });
    }

    let result;

    switch (type) {
      case 'commit': {
        const { sha, message, author } = fields;
        if (!sha || !message) {
          return res.status(400).json({ success: false, error: 'commit requires sha and message' });
        }
        result = await sources.ingestGitCommit(graph, { sha, message, author });
        break;
      }
      case 'package': {
        const { packageName, newVersion, oldVersion } = fields;
        if (!packageName || !newVersion) {
          return res.status(400).json({ success: false, error: 'package requires packageName and newVersion' });
        }
        result = await sources.ingestPackageJsonChange(graph, { packageName, newVersion, oldVersion });
        break;
      }
      case 'codeowners': {
        const { ownedPath, newOwner, oldOwner, filePath } = fields;
        if (!ownedPath || !newOwner) {
          return res.status(400).json({ success: false, error: 'codeowners requires ownedPath and newOwner' });
        }
        result = await sources.ingestCodeownersChange(graph, { ownedPath, newOwner, oldOwner, filePath });
        break;
      }
      case 'issue': {
        const { issueNumber, title, htmlUrl, body, supersedesIds, state } = fields;
        if (!issueNumber || !title || !htmlUrl) {
          return res.status(400).json({ success: false, error: 'issue requires issueNumber, title, and htmlUrl' });
        }
        result = await sources.ingestGitHubIssue(graph, {
          issueNumber,
          title,
          htmlUrl,
          body: body || '',
          supersedesIds: supersedesIds || [],
          state: state || 'closed'
        });
        break;
      }
    }

    broadcastEvent('SOURCE_INGESTED', { type, source_id: result.source_id });
    res.json({ success: true, type, result });

  } catch (err) {
    console.error('[CAVDAX] /api/ingest-source error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DEV TIER CHECK (Internal diagnostic endpoint — URL-only, no nav tab)
// ---------------------------------------------------------------------------

/**
 * GET /api/dev/tier-check
 *
 * Returns server tier, FalkorDB connection state, rate-limit config,
 * active session counts, and process uptime. Used by DevConsolePage.
 *
 * No auth required — read-only diagnostic. Restrict at Caddy level in prod
 * (e.g. only allow internal IPs or VPN).
 */
app.get('/api/dev/tier-check', (req, res) => {
  // Use top-level TIER_CONFIG and CAVDAX_TIER — single source of truth
  // so the reported limits match the limits actually enforced by the limiters.
  res.json({
    success: true,
    tier: CAVDAX_TIER,
    tier_meta: activeTier,
    falkordb: {
      connected: isFalkorConnected,
      host: process.env.FALKORDB_HOST || 'localhost',
      port: parseInt(process.env.FALKORDB_PORT || '6379', 10),
      graph_name: process.env.FALKORDB_GRAPH_NAME || 'cavdax_core_graph',
      mode: isFalkorConnected ? 'live' : 'simulation'
    },
    sessions: {
      mcp_active: mcpSessions.size,
      sse_clients: sseClients.size,
      mcp_ttl_ms: MCP_SESSION_TTL_MS
    },
    server: {
      uptime_seconds: Math.floor(process.uptime()),
      node_version: process.version,
      port: PORT,
      auth_enabled: !!API_TOKEN
    }
  });
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
// GITHUB OAUTH (roadmap 5.2 — hosted cloud authentication)
// ---------------------------------------------------------------------------
// Three env vars required (only for hosted deployment — local dev skips OAuth):
//   GITHUB_CLIENT_ID      — from github.com/settings/apps or /settings/developers
//   GITHUB_CLIENT_SECRET  — same OAuth app
//   GITHUB_CALLBACK_URL   — e.g. https://cavdax.sahnirmaan.live/api/auth/github/callback
//                           or    http://localhost:3000/api/auth/github/callback  (local testing)
//
// Flow:
//   1.  GET /api/auth/github       — redirect user to GitHub authorize page
//   2.  GET /api/auth/github/callback — GitHub redirects here with ?code=
//       → exchange code for access_token
//       → fetch user profile from api.github.com/user
//       → store { githubId, login, name, avatarUrl, accessToken } in session
//       → redirect to /mcp (ConnectMcpPage) with ?connected=1
//   3.  GET /api/auth/me           — returns current session user (or 401)
//   4.  POST /api/auth/logout      — destroys session

const GITHUB_CLIENT_ID     = process.env.GITHUB_CLIENT_ID     || null;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || null;
const GITHUB_CALLBACK_URL  = process.env.GITHUB_CALLBACK_URL
  || `http://localhost:${PORT}/api/auth/github/callback`;

// In-memory CSRF state store (keyed by random state param, TTL 10 min)
const oauthStateStore = new Map(); // state → { createdAt }
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [k, v] of oauthStateStore) {
    if (v.createdAt < cutoff) oauthStateStore.delete(k);
  }
}, 60 * 1000).unref();

/**
 * GET /api/auth/github
 * Redirects the browser to GitHub's authorization page.
 * If GITHUB_CLIENT_ID is not configured, returns a clear 503 explanation.
 */
app.get('/api/auth/github', (req, res) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      error: 'GITHUB_OAUTH_NOT_CONFIGURED',
      message: 'GitHub OAuth is not configured on this server. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file.',
      docs: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app'
    });
  }

  // Generate CSRF state token and store it briefly
  const state = randomBytes(20).toString('hex');
  oauthStateStore.set(state, { createdAt: Date.now() });

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: 'read:user read:org',
    state
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

/**
 * GET /api/auth/github/callback
 * GitHub redirects here after the user approves the OAuth app.
 */
app.get('/api/auth/github/callback', async (req, res) => {
  const { code, state, error: ghError } = req.query;

  // User denied access or GitHub returned an error
  if (ghError) {
    return res.redirect(`/mcp?oauth_error=${encodeURIComponent(ghError)}`);
  }

  // CSRF state validation
  if (!state || !oauthStateStore.has(state)) {
    return res.redirect('/mcp?oauth_error=invalid_state');
  }
  oauthStateStore.delete(state);

  if (!code) {
    return res.redirect('/mcp?oauth_error=missing_code');
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL
      })
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('[CAVDAX OAuth] Token exchange failed:', tokenData);
      return res.redirect(`/mcp?oauth_error=${encodeURIComponent(tokenData.error || 'token_exchange_failed')}`);
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    const userData = await userRes.json();

    if (!userData.id) {
      return res.redirect('/mcp?oauth_error=user_fetch_failed');
    }

    // 3. Persist user in session
    req.session.user = {
      githubId:   userData.id,
      login:      userData.login,
      name:       userData.name || userData.login,
      avatarUrl:  userData.avatar_url,
      // Store the token hashed or omit from session in production;
      // here we keep it so the client can make authenticated GitHub API calls
      accessToken
    };

    console.log(`[CAVDAX OAuth] User authenticated: ${userData.login} (id: ${userData.id})`);

    // 4. Redirect back to the MCP page with a success flag
    res.redirect('/mcp?connected=1');

  } catch (err) {
    console.error('[CAVDAX OAuth] Callback error:', err.message);
    res.redirect(`/mcp?oauth_error=${encodeURIComponent('server_error')}`);
  }
});

/**
 * GET /api/auth/me
 * Returns the authenticated GitHub user from the session.
 * Used by ConnectMcpPage to show the connected user badge.
 */
app.get('/api/auth/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ authenticated: false });
  }
  const { githubId, login, name, avatarUrl } = req.session.user;
  res.json({ authenticated: true, user: { githubId, login, name, avatarUrl } });
});

/**
 * POST /api/auth/logout
 * Destroys the session and redirects to /mcp.
 */
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('[CAVDAX OAuth] Session destroy error:', err.message);
    res.json({ success: true });
  });
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
