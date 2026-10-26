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
import { randomUUID, randomBytes, createHmac, createHash, timingSafeEqual } from 'crypto';
// Constant-time string equality helper to defend against timing side-channel attacks (OWASP A02)
function timingSafeStringEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

import { rateLimit } from 'express-rate-limit';
import Razorpay from 'razorpay';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve .env path relative to this file so it works regardless of cwd.
// This means `npm run dev` from repo root and from apps/server/ both work.
dotenv.config({ path: path.resolve(__dirname, '.env') });
const REPO_ROOT = path.resolve(__dirname, '../../');

const app = express();
const PORT = process.env.PORT || 3000;


// Trust reverse proxy (Caddy / Cloudflare) so secure session cookies and proto work properly
app.set('trust proxy', 1);

// Security Headers Middleware (OWASP A05 & Cloudflare Edge Zero-Trust Hardening)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.github.com https://lumberjack.razorpay.com https://api.razorpay.com wss: ws:; " +
    "frame-src https://api.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Explicit CORS Origin Allowlist (Blocks arbitrary cross-site credential theft)
const allowedOrigins = [
  'https://cavdax.sahnirmaan.live',
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, local cURL, MCP stdio clients)
    if (!origin) return callback(null, true);
    // Allow any localhost / 127.0.0.1 development port (Vite 5173, preview 4173, 5174, etc.)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

// ---------------------------------------------------------------------------
// SESSION MIDDLEWARE
// ---------------------------------------------------------------------------
// Used by GitHub OAuth flow to carry the authenticated user across requests.
// SESSION_SECRET must be set in .env for production.
// In-memory store is fine for a single-process server; scale to Redis later.
app.use(session({
  secret: process.env.SESSION_SECRET || 'cavdax_session_secret_vault_fallback_2026',
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
let globalHackathonMode = process.env.HACKATHON_MODE === 'true';

const TIER_CONFIG = {
  free: {
    label: 'Free',
    description: 'Local FalkorDB only. Rate limit: 100 req/min. MCP stdio transport.',
    features: ['stdio MCP', 'ADR ingestion', 'local FalkorDB'],
    rate_limit_per_min: 100,
    mcp_rate_limit_per_min: 30,
    node_limit: 500,         // max graph nodes before writes are rejected
    audit_log_limit: 10      // max entries returned from GET /api/audit
  },
  pro: {
    label: 'Pro',
    description: 'Cloud FalkorDB + SSE remote MCP. Webhook ingestion enabled.',
    features: ['SSE MCP', 'all source types', 'webhook ingestion', 'audit log'],
    rate_limit_per_min: 300,
    mcp_rate_limit_per_min: 100,
    node_limit: 10_000,      // pro tier graph capacity
    audit_log_limit: 1000    // pro tier audit history depth
  },
  enterprise: {
    label: 'Enterprise',
    description: 'Multi-tenant FalkorDB. Custom rate limits. SLA guarantees.',
    features: ['multi-tenant', 'custom rate limits', 'SLA', 'RBAC'],
    rate_limit_per_min: -1,   // -1 = unlimited
    mcp_rate_limit_per_min: -1,
    node_limit: -1,           // -1 = no limit (enterprise)
    audit_log_limit: 500      // enterprise compliance window
  }
};

const activeTier = TIER_CONFIG[CAVDAX_TIER] || TIER_CONFIG.free;

// Helper to extract client IP safely with reverse-proxy trust validation (OWASP A07 Hardening)
function extractClientIp(req) {
  const socketIp = (req.socket?.remoteAddress || '').replace(/^.*:/, '').toLowerCase();
  const isDirectLoopback = socketIp === '127.0.0.1' || socketIp === '1' || socketIp === 'localhost' || socketIp === '::1';

  // Only inspect forwarding headers if request arrives through a reverse proxy or explicit trust proxy mode
  if (isDirectLoopback || process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true') {
    const cfIp = req.headers['cf-connecting-ip'] || req.headers['true-client-ip'];
    if (cfIp) {
      const clean = (typeof cfIp === 'string' ? cfIp.trim() : cfIp[0]).toLowerCase();
      // Forwarded headers must NEVER be trusted to claim loopback/localhost status
      if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') {
        return socketIp || 'unknown';
      }
      return clean;
    }
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const first = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0]).toLowerCase();
      if (first === '127.0.0.1' || first === '::1' || first === 'localhost') {
        return socketIp || 'unknown';
      }
      if (first) return first;
    }
  }
  return req.ip || socketIp || 'unknown';
}

// Global Whitelisted Developer IPs (stored in server state)
let globalWhitelistedIps = Array.from(new Set([
  '127.0.0.1',
  'localhost',
  '::1',
  ...(process.env.VITE_ALLOWED_DEV_IPS || process.env.ALLOWED_DEV_IPS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
]));

// -1 means unlimited — pass a very large max so express-rate-limit is effectively off
const apiMax = activeTier.rate_limit_per_min === -1 ? 1_000_000 : activeTier.rate_limit_per_min;
const mcpMax = activeTier.mcp_rate_limit_per_min === -1 ? 1_000_000 : activeTier.mcp_rate_limit_per_min;

console.log(`[CAVDAX] Tier: ${activeTier.label} — API limit: ${activeTier.rate_limit_per_min === -1 ? 'UNLIMITED' : apiMax + ' req/min'}, MCP limit: ${activeTier.mcp_rate_limit_per_min === -1 ? 'UNLIMITED' : mcpMax + ' req/min'}`);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  // During Hackathon Evaluation Mode, provide an elevated ceiling (1,200 req/min = 20 req/sec)
  // so judges enjoy zero throttling, while still shielding the server from external DoS/bot attacks.
  max: (req) => (globalHackathonMode ? 1200 : apiMax),
  skip: (req) => {
    const clientIp = extractClientIp(req).toLowerCase();
    // Trusted developer IPs skip rate limiting completely
    if (globalWhitelistedIps.includes(clientIp)) return true;
    return false;
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Rate limit exceeded. Please retry in 60 seconds.' }
});

// Strict limiter — MCP tool execution endpoints
// Prevents runaway agent loops from hammering FalkorDB with tool calls.
const mcpLimiter = rateLimit({
  windowMs: 60 * 1000,
  // 600 req/min = 10 tool calls/sec during evaluation mode
  max: (req) => (globalHackathonMode ? 600 : mcpMax),
  skip: (req) => {
    const clientIp = extractClientIp(req).toLowerCase();
    if (globalWhitelistedIps.includes(clientIp)) return true;
    return false;
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many MCP requests', message: 'MCP rate limit exceeded. Check for agent loops.' }
});

app.use('/api/', apiLimiter);          // applies to all /api/* routes
app.use('/api/mcp/', mcpLimiter);      // tighter limit on MCP routes (overrides above)

// ---------------------------------------------------------------------------
// AUTH MIDDLEWARE & CRYPTOGRAPHIC USER KEY REGISTRY
// ---------------------------------------------------------------------------
// Reads MCP_API_TOKEN from environment for root / CI access.
// Also maintains an in-memory SHA-256 hashed registry of user-scoped API keys:
//   keyHashHex -> { userId, login, tier, createdAt, lastUsedAt }
// Raw keys follow format: cvdx_live_<login>_<48-hex-entropy> (192 bits of entropy)
const API_TOKEN = process.env.MCP_API_TOKEN || null;
const userApiKeyRegistry = new Map();
let globalKeyRevocationEpoch = 0;

function hashApiKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return '';
  return createHash('sha256').update(rawKey.trim()).digest('hex');
}

function generateSecureApiKey(login) {
  const sanitizedLogin = (login || 'contributor').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
  const entropy = randomBytes(24).toString('hex'); // 192 bits of cryptographic CSPRNG randomness
  return `cvdx_live_${sanitizedLogin}_${entropy}`;
}

if (!API_TOKEN) {
  console.warn(
    '[CAVDAX Auth] ⚠️  MCP_API_TOKEN is not set — write endpoints fallback to user API key verification.'
  );
}

/**
 * Express middleware that enforces Bearer token auth on write endpoints.
 * Validates against both root MCP_API_TOKEN and user-scoped cryptographic keys.
 * Skipped transparently when no tokens or keys are configured in local dev mode.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  // 1. Root / CI Token Check (Constant-time comparison)
  if (API_TOKEN && timingSafeStringEqual(token, API_TOKEN)) {
    req.authUser = { login: 'system', tier: 'enterprise', role: 'admin' };
    return next();
  }

  // 2. Cryptographic User Key Check
  if (token && token.startsWith('cvdx_live_')) {
    const keyHash = hashApiKey(token);
    const keyRecord = userApiKeyRegistry.get(keyHash);
    if (keyRecord && (keyRecord.createdAt || 0) >= globalKeyRevocationEpoch) {
      keyRecord.lastUsedAt = Date.now();
      req.authUser = {
        userId: keyRecord.userId,
        login: keyRecord.login,
        tier: keyRecord.tier || 'free',
        role: 'user'
      };
      return next();
    }
  }

  // 3. Authenticated Web Session (GitHub OAuth session cookie)
  if (req.session?.user) {
    req.authUser = {
      userId: req.session.user.githubId || req.session.user.login,
      login: req.session.user.login,
      tier: req.session.user.tier || 'free',
      role: 'user'
    };
    return next();
  }

  // 4. Transparent local dev fallback strictly in non-production environments
  if (process.env.NODE_ENV !== 'production' && !API_TOKEN && userApiKeyRegistry.size === 0) {
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'A valid Bearer token is required. Use Authorization: Bearer <API_KEY>.'
  });
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
// NODE COUNT ENFORCEMENT MIDDLEWARE
// ---------------------------------------------------------------------------
// Runs MATCH (n) RETURN count(n) against FalkorDB before any write endpoint.
// Rejects with 429 if the active tier's node_limit is reached.
//
// Only enforced when FalkorDB is live — in simulation/fallback mode writes are
// in-memory only, so storage limits are not meaningful.
// If the count query itself fails, the write is allowed through (fail-open);
// the ingest endpoint has its own error handling for subsequent failures.
// node_limit = -1 means unlimited (Enterprise tier).

async function checkNodeLimit(req, res, next) {
  const limit = activeTier.node_limit;
  if (limit === -1) return next(); // Enterprise — unlimited

  if (!isFalkorConnected || !graph) return next(); // FalkorDB offline — let ingest handle it

  try {
    const result = await graph.query('MATCH (n) RETURN count(n) AS total');
    const total = result.data?.[0]?.total ?? 0;
    if (total >= limit) {
      return res.status(429).json({
        success: false,
        error: 'NODE_LIMIT_EXCEEDED',
        message: `Graph node limit reached for ${activeTier.label} tier (${total}/${limit} nodes). Upgrade tier or delete unused nodes.`,
        current_nodes: total,
        tier_limit: limit,
        tier: CAVDAX_TIER
      });
    }
    next();
  } catch (err) {
    // Count query fail — don't block the write, log it
    console.warn('[CAVDAX NodeLimit] Count query failed, skipping limit check:', err.message);
    next();
  }
}

// ---------------------------------------------------------------------------
// REST ENDPOINTS
// ---------------------------------------------------------------------------

// Global Authorized Developer GitHub Roster (stored in server state)
let globalDevRoster = Array.from(new Set([
  'suneetchugh-dev',
  'geetikachughibm',
  'gkc2406',
  ...(process.env.VITE_AUTHORIZED_DEV_USERS || process.env.AUTHORIZED_DEV_USERS || '')
    .split(',')
    .map(s => s.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean)
]));

// Middleware enforcing developer authorization on administrative endpoints (OWASP A01 Hardening)
function requireDevAuth(req, res, next) {
  // 1. Bearer API token (Constant-time comparison)
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (API_TOKEN && timingSafeStringEqual(token, API_TOKEN)) {
    return next();
  }

  // 2. Authenticated GitHub user on dev roster
  const sessionUser = req.session?.user?.login?.toLowerCase().replace(/^@/, '');
  if (sessionUser && globalDevRoster.includes(sessionUser)) {
    return next();
  }

  // 3. Localhost loopback access or local development environment
  const clientIp = extractClientIp(req).toLowerCase();
  const socketIp = (req.socket?.remoteAddress || '').replace(/^.*:/, '').toLowerCase();
  const isDirectLoopback = socketIp === '127.0.0.1' || socketIp === '1' || socketIp === 'localhost' || socketIp === '::1';

  // Physical socket must be verified loopback AND clientIp must not be spoofed
  if (isDirectLoopback && (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost') && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_DEV_AUTH === 'true')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied: Developer clearance or valid authorization token required.'
  });
}

// GET /api/system/dev-ips
app.get('/api/system/dev-ips', (req, res) => {
  const clientIp = extractClientIp(req).toLowerCase();
  res.json({
    ips: globalWhitelistedIps,
    client_ip: clientIp,
    client_authorized: globalWhitelistedIps.includes(clientIp)
  });
});

// POST /api/system/dev-ips (Protected by requireDevAuth)
app.post('/api/system/dev-ips', requireDevAuth, (req, res) => {
  const { ip, action } = req.body || {};
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid IP address required' });
  }
  const cleanIp = ip.trim().toLowerCase();
  if (action === 'remove') {
    globalWhitelistedIps = globalWhitelistedIps.filter(item => item !== cleanIp);
    console.log(`[CAVDAX] Revoked global IP authorization: ${cleanIp}`);
  } else {
    if (!globalWhitelistedIps.includes(cleanIp)) {
      globalWhitelistedIps.push(cleanIp);
      console.log(`[CAVDAX] Granted global IP authorization: ${cleanIp}`);
    }
  }

  broadcastEvent('DEV_IPS_UPDATED', { ips: globalWhitelistedIps });
  res.json({
    success: true,
    ips: globalWhitelistedIps
  });
});

// GET /api/system/dev-roster
app.get('/api/system/dev-roster', (req, res) => {
  res.json({
    roster: globalDevRoster
  });
});

// POST /api/system/dev-roster (Protected by requireDevAuth)
app.post('/api/system/dev-roster', requireDevAuth, (req, res) => {
  const { username, action } = req.body || {};
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid username required' });
  }
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  if (action === 'remove') {
    if (!['suneetchugh-dev', 'geetikachughibm', 'gkc2406'].includes(clean)) {
      globalDevRoster = globalDevRoster.filter(u => u !== clean);
      console.log(`[CAVDAX] Revoked dev roster authorization: @${clean}`);
    }
  } else {
    if (!globalDevRoster.includes(clean)) {
      globalDevRoster.push(clean);
      console.log(`[CAVDAX] Granted dev roster authorization: @${clean}`);
    }
  }

  broadcastEvent('DEV_ROSTER_UPDATED', { roster: globalDevRoster });
  res.json({
    success: true,
    roster: globalDevRoster
  });
});

// Global Hackathon Evaluation Mode REST Endpoints
app.get('/api/system/hackathon-mode', (req, res) => {
  res.json({
    enabled: globalHackathonMode,
    active_tier: globalHackathonMode ? 'enterprise' : CAVDAX_TIER,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/system/hackathon-mode', requireDevAuth, (req, res) => {
  const { enabled } = req.body || {};
  globalHackathonMode = Boolean(enabled);
  console.log(`[CAVDAX] Global Hackathon Evaluation Mode updated: ${globalHackathonMode ? 'ENABLED (ENTERPRISE UNLOCKED GLOBALLY)' : 'DISABLED'}`);
  broadcastEvent('HACKATHON_MODE_CHANGED', {
    enabled: globalHackathonMode,
    tier: globalHackathonMode ? 'enterprise' : CAVDAX_TIER
  });
  res.json({
    success: true,
    enabled: globalHackathonMode,
    active_tier: globalHackathonMode ? 'enterprise' : CAVDAX_TIER
  });
});

/**
 * POST /api/system/revoke-all-keys
 * Emergency Credential Invalidation & Kill Switch (Protected by requireDevAuth)
 * Instantly invalidates all active user-scoped API keys across all tiers.
 */
app.post('/api/system/revoke-all-keys', requireDevAuth, (req, res) => {
  const actor = req.session?.user?.login || req.authUser?.login || 'dev_administrator';
  const reason = (typeof req.body?.reason === 'string' && req.body.reason.trim())
    ? req.body.reason.trim().slice(0, 200)
    : 'Emergency security revocation: credential exposure containment';

  const revokedCount = userApiKeyRegistry.size;
  globalKeyRevocationEpoch = Date.now();
  userApiKeyRegistry.clear();

  const auditRecord = {
    action: 'EMERGENCY_GLOBAL_KEY_REVOCATION',
    actor: `@${actor.replace(/^@/, '')}`,
    reason,
    keys_revoked: revokedCount,
    revocation_epoch: globalKeyRevocationEpoch,
    timestamp: new Date().toISOString(),
    severity: 'CRITICAL'
  };

  const actionId = `act-revocation-${Date.now()}`;
  fallbackGraphState.nodes.push({
    id: actionId,
    label: 'AgentAction',
    target_file: 'SECURITY_CREDENTIAL_PURGE',
    status: 'GLOBAL_KEYS_REVOKED',
    timestamp: Date.now()
  });

  console.warn(`[CAVDAX Security] 🚨 EMERGENCY GLOBAL KEY REVOCATION: ${revokedCount} keys invalidated by @${actor}`);

  broadcastEvent('GLOBAL_KEYS_REVOKED', auditRecord);

  res.json({
    success: true,
    keys_revoked: revokedCount,
    epoch: globalKeyRevocationEpoch,
    message: `Emergency revocation complete. ${revokedCount} API key(s) purged from active memory.`,
    audit: auditRecord
  });
});

app.get('/api/client-ip', (req, res) => {
  res.json({ ip: extractClientIp(req) });
});

// 1. Health & Connection Status
app.get('/api/health', (req, res) => {
  // Exposes tier and tier_label so the Web HUD header badge can read the active
  // tier on the existing health poll — no extra /api/dev/tier-check round-trip needed.
  res.json({
    status: 'online',
    product: 'CAVDAX',
    expansion: 'Contextual Action & Verified Decision Autonomous eXecution',
    falkordb_connected: isFalkorConnected,
    tier: globalHackathonMode ? 'enterprise' : CAVDAX_TIER,
    tier_label: globalHackathonMode ? 'Enterprise' : activeTier.label,
    hackathon_mode: globalHackathonMode,
    client_ip: extractClientIp(req),
    timestamp: new Date().toISOString()
  });
});

// 2. Real-time Server-Sent Events (SSE)
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'CAVDAX SSE Stream Live' })}\n\n`);

  // 15s keepalive heartbeat ping to prevent Cloudflare HTTP/3 (QUIC) idle stream termination
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
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
// checkNodeLimit runs before the handler — rejects if tier node_limit is reached
app.post('/api/ingest', requireAuth, checkNodeLimit, async (req, res) => {
  try {
    if (!isFalkorConnected) await initDb();

    // Security Confinement: Prevent path traversal (OWASP A01/A03 Hardening)
    const resolvedRepo = path.resolve(REPO_ROOT);
    let targetAdrPath = path.join(resolvedRepo, 'demo-repo/docs/adrs/ADR-002.md');
    if (req.body?.filePath && typeof req.body.filePath === 'string') {
      const candidate = path.resolve(resolvedRepo, req.body.filePath);
      if (!candidate.startsWith(resolvedRepo + path.sep) && candidate !== resolvedRepo) {
        return res.status(403).json({ success: false, error: 'Access denied: Path traversal attempt outside repository root.' });
      }
      targetAdrPath = candidate;
    }

    if (graph) {
      const ingestResult = await ingestAdrFile(graph, targetAdrPath);
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
  } else if (toolName === 'check_intent_clearance') {
    if (!args.decision_id || typeof args.decision_id !== 'string' || args.decision_id.trim().length === 0) {
      return res.status(400).json({
        isError: true,
        error: "Missing or empty required parameter 'args.decision_id' for tool 'check_intent_clearance'."
      });
    }
    if (args.decision_id.length > 128) {
      return res.status(400).json({
        isError: true,
        error: "Parameter 'args.decision_id' exceeds maximum length limit of 128 characters."
      });
    }
    if (args.target_file && (typeof args.target_file !== 'string' || args.target_file.length > 256)) {
      return res.status(400).json({
        isError: true,
        error: "Optional parameter 'args.target_file' must be a string with maximum length of 256 characters."
      });
    }
    if (args.proposed_action && (typeof args.proposed_action !== 'string' || args.proposed_action.length > 500)) {
      return res.status(400).json({
        isError: true,
        error: "Optional parameter 'args.proposed_action' must be a string with maximum length of 500 characters."
      });
    }
    args.decision_id = args.decision_id.trim();
  } else if (toolName === 'acquire_decision_lock') {
    if (!args.decision_id || !args.agent_id) {
      return res.status(400).json({
        isError: true,
        error: "Missing required parameters 'args.decision_id' and/or 'args.agent_id' for 'acquire_decision_lock'."
      });
    }
  } else if (toolName === 'release_decision_lock') {
    if (!args.decision_id || !args.agent_id) {
      return res.status(400).json({
        isError: true,
        error: "Missing required parameters 'args.decision_id' and/or 'args.agent_id' for 'release_decision_lock'."
      });
    }
  } else {
    return res.status(400).json({
      isError: true,
      error: `Unsupported MCP tool: '${toolName}'. Supported tools: 'apply_code_change', 'revalidate_decision', 'check_intent_clearance', 'acquire_decision_lock', 'release_decision_lock'.`
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
          // Approved — Security Confinement: verify file target resides within repository root
          const resolvedRepo = path.resolve(REPO_ROOT);
          const targetPath = path.resolve(resolvedRepo, args.file_path);
          if (!targetPath.startsWith(resolvedRepo + path.sep) && targetPath !== resolvedRepo) {
            return res.status(403).json({
              isError: true,
              gate_verdict: 'BLOCKED_PATH_TRAVERSAL',
              error: 'Access denied: Target file path must reside within the repository root.'
            });
          }
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
      } else if (toolName === 'check_intent_clearance') {
        const isDec102 = args.decision_id === 'DEC-102';
        const dNode = fallbackGraphState.nodes.find(n => n.id === args.decision_id);
        const isInvalidated = (dNode && dNode.status === 'INVALIDATED_NEEDS_REVALIDATION') || isDec102;

        if (isInvalidated) {
          const denialResponse = {
            isError: true,
            clearance_granted: false,
            simulated: true,
            simulated_warning: 'FalkorDB offline — returned from in-memory simulation',
            gate_verdict: 'BLOCKED_SUPERSEDED_SOURCE',
            decision_id: args.decision_id,
            target_file: args.target_file || null,
            proposed_action: args.proposed_action || null,
            latency_ms: 0,
            simulated_latency_ms: 1.84,
            violation_paths: [['Source:ADR-001 (SUPERSEDED)', 'Fact:F-Auth-v1 (STALE)', `Decision:${args.decision_id}`]],
            message: `⛔ CLEARANCE DENIED (SIMULATION): Decision '${args.decision_id}' is grounded in superseded source 'ADR-001'. Pre-flight check failed.`,
            instructions_for_agent: `Do NOT generate code grounded in '${args.decision_id}'. Inspect superseding source 'ADR-002', call 'revalidate_decision', and re-check clearance.`
          };
          broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result: denialResponse });
          return res.json(denialResponse);
        } else {
          const grantResponse = {
            isError: false,
            clearance_granted: true,
            simulated: true,
            simulated_warning: 'FalkorDB offline — returned from in-memory simulation',
            gate_verdict: 'APPROVED',
            decision_id: args.decision_id,
            target_file: args.target_file || null,
            proposed_action: args.proposed_action || null,
            latency_ms: 0,
            simulated_latency_ms: 1.62,
            message: `✅ CLEARANCE GRANTED (SIMULATION): Decision '${args.decision_id}' is valid and active. Safe to proceed with code generation.`
          };
          broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result: grantResponse });
          return res.json(grantResponse);
        }
      } else if (toolName === 'acquire_decision_lock') {
        const lockResp = {
          acquired: true,
          simulated: true,
          decision_id: args.decision_id,
          agent_id: args.agent_id,
          expires_at: new Date(Date.now() + (args.ttl_ms || 60000)).toISOString(),
          message: `✅ LOCK ACQUIRED (SIMULATION): Agent '${args.agent_id}' holds exclusive lease on '${args.decision_id}'.`
        };
        broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result: lockResp });
        return res.json(lockResp);
      } else if (toolName === 'release_decision_lock') {
        const unlockResp = {
          released: true,
          simulated: true,
          decision_id: args.decision_id,
          message: `✅ LOCK RELEASED (SIMULATION): Decision '${args.decision_id}' is available for other agents.`
        };
        broadcastEvent('MCP_TOOL_EXECUTED', { toolName, args, result: unlockResp });
        return res.json(unlockResp);
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
  // Cap is tier-aware: free=10, pro=1000, enterprise=500.
  // Reads from activeTier.audit_log_limit — same TIER_CONFIG object that drives rate limits.
  const tierCap = activeTier.audit_log_limit;
  const limit = Math.min(parseInt(req.query.limit || '100', 10), tierCap);

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
// checkNodeLimit runs before the handler — rejects if tier node_limit is reached
app.post('/api/ingest-source', requireAuth, checkNodeLimit, async (req, res) => {
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

/**
 * GET /api/user/quota
 * Real plan tier limits, active graph node counts, and billing cycle calculations.
 */
app.get('/api/user/quota', async (req, res) => {
  const effectiveTier = globalHackathonMode ? 'enterprise' : (req.query.tier || CAVDAX_TIER || 'free').toLowerCase();
  const tier = effectiveTier;
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free;

  let activeNodes = fallbackGraphState.nodes.length;
  let userDecisions = 0;
  try {
    if (graph) {
      const qRes = await graph.query('MATCH (n) RETURN count(n) AS cnt');
      if (qRes && qRes.data && qRes.data.length > 0) {
        const val = qRes.data[0].cnt;
        activeNodes = typeof val === 'number' ? val : parseInt(val, 10) || fallbackGraphState.nodes.length;
      }
      // Count only real user-created decisions (strictly excluding the canonical 4-Act demo decisions)
      const dRes = await graph.query("MATCH (d:Decision) WHERE NOT d.id IN ['DEC-101', 'DEC-102', 'DEC-103'] RETURN count(d) AS cnt");
      if (dRes && dRes.data && dRes.data.length > 0) {
        userDecisions = typeof dRes.data[0].cnt === 'number' ? dRes.data[0].cnt : parseInt(dRes.data[0].cnt, 10) || 0;
      }
    }
  } catch {
    // fallback in-memory count
  }

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.max(1, endOfMonth.getDate() - now.getDate());

  res.json({
    success: true,
    tier,
    tier_label: config.label,
    limits: {
      repositories: tier === 'free' ? 1 : (tier === 'pro' ? 10 : -1),
      decisions: tier === 'free' ? 50 : (tier === 'pro' ? 1000 : -1),
      nodes: config.node_limit,
      rate_limit_per_min: config.rate_limit_per_min,
      mcp_rate_limit_per_min: config.mcp_rate_limit_per_min
    },
    usage: {
      user_decisions: userDecisions,
      active_nodes: activeNodes,
      mcp_sessions: mcpSessions.size,
      sse_clients: sseClients.size
    },
    cycle: {
      days_remaining: daysRemaining,
      resets_on: new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
const CLIENT_URL           = process.env.CLIENT_URL           || null;
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

  // Generate CSRF state token and store it briefly.
  // Also persist the returnTo path so the callback can redirect back to the
  // originating page (e.g. /profile) rather than always landing on /mcp.
  const state = randomBytes(20).toString('hex');
  const VALID_RETURN_ROUTES = ['/overview', '/console', '/mcp', '/walkthrough', '/audit', '/team', '/profile', '/support', '/devteam'];
  const candidatePath = (typeof req.query.returnTo === 'string' ? req.query.returnTo.split('?')[0] : '/mcp');
  const safeReturnTo = VALID_RETURN_ROUTES.includes(candidatePath) ? req.query.returnTo : '/mcp';
  oauthStateStore.set(state, { createdAt: Date.now(), returnTo: safeReturnTo });

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

  // Recover the returnTo path stored at OAuth initiation (defaults to /mcp)
  const stateEntry = oauthStateStore.get(state);
  const returnTo = stateEntry?.returnTo || '/mcp';

  // User denied access or GitHub returned an error
  if (ghError) {
    const sep = returnTo.includes("?") ? "&" : "?";
    return res.redirect(`${returnTo}${sep}oauth_error=${encodeURIComponent(ghError)}`);
  }

  // CSRF state validation
  if (!state || !stateEntry) {
    return res.redirect('/mcp?oauth_error=invalid_state');
  }
  oauthStateStore.delete(state);

  if (!code) {
    const sep = returnTo.includes("?") ? "&" : "?";
    return res.redirect(`${returnTo}${sep}oauth_error=missing_code`);
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
      const frontendBase = CLIENT_URL || '';
      return res.redirect(`${frontendBase}${returnTo}?oauth_error=${encodeURIComponent(tokenData.error || 'token_exchange_failed')}`);
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

    const frontendBase = CLIENT_URL || '';

    if (!userData.id) {
      const sep = returnTo.includes("?") ? "&" : "?";
      return res.redirect(`${frontendBase}${returnTo}${sep}oauth_error=user_fetch_failed`);
    }

    // 3. Persist user in session
    req.session.user = {
      githubId:   userData.id,
      login:      userData.login,
      name:       userData.name || userData.login,
      avatarUrl:  userData.avatar_url,
      accessToken
    };

    console.log(`[CAVDAX OAuth] User authenticated: ${userData.login} (id: ${userData.id})`);

    // 4. Redirect back to the originating page with user info & success flag
    const sep = returnTo.includes("?") ? "&" : "?";
    const redirectUrl = `${frontendBase}${returnTo}${sep}connected=1&login=${encodeURIComponent(userData.login)}&name=${encodeURIComponent(userData.name || userData.login)}&avatar=${encodeURIComponent(userData.avatar_url || '')}&githubId=${userData.id}`;
    req.session.save((err) => {
      if (err) console.error('[CAVDAX OAuth] Session save error:', err);
      res.redirect(redirectUrl);
    });

  } catch (err) {
    const frontendBase = CLIENT_URL || '';
    console.error('[CAVDAX OAuth] Callback error:', err.message);
    const sep = returnTo.includes("?") ? "&" : "?";
    res.redirect(`${frontendBase}${returnTo}${sep}oauth_error=${encodeURIComponent('server_error')}`);
  }
});

/**
 * GET /api/auth/me
 * Returns the authenticated GitHub user from the session.
 * Used by ConnectMcpPage to show the connected user badge.
 */
app.get('/api/auth/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(200).json({ authenticated: false });
  }
  const { githubId, login, name, avatarUrl } = req.session.user;
  res.json({ authenticated: true, user: { githubId, login, name, avatarUrl } });
});

// Test-only session bootstrap (Strictly disabled in production)
if (process.env.NODE_ENV === 'test') {
  app.post('/api/auth/test-session', (req, res) => {
    req.session.user = {
      githubId: req.body?.githubId || 12345,
      login: req.body?.login || 'test-dev',
      name: 'Test Dev',
      avatarUrl: ''
    };
    res.json({ success: true, user: req.session.user });
  });
}

/**
 * GET /api/user/api-key
 * Returns the active cryptographic API key for the authenticated user or session.
 */
app.get('/api/user/api-key', (req, res) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Authentication required: Sign in with GitHub to generate and manage API keys'
    });
  }
  const login = sessionUser.login;
  const userId = sessionUser.githubId;
  const tier = sessionUser.tier || req.session?.tier || 'free';

  // If user already has an active key in session
  if (req.session?.apiKey && req.session?.keyHash) {
    const sessionKeyCreatedAt = req.session.keyCreatedAt || 0;
    if (sessionKeyCreatedAt < globalKeyRevocationEpoch) {
      console.log(`[CAVDAX Auth] Purging revoked session key for ${login} (issued before revocation epoch)`);
      req.session.apiKey = null;
      req.session.keyHash = null;
      req.session.keyCreatedAt = null;
      return res.status(401).json({
        success: false,
        authenticated: true,
        revoked: true,
        error: 'Security Notice: Your previous API key was invalidated during an emergency credential revocation. Please rotate your key to issue a fresh credential.'
      });
    }
    // SEC-KEY-03: Re-hydrate in-memory registry if server restarted or worker scaled
    if (!userApiKeyRegistry.has(req.session.keyHash)) {
      userApiKeyRegistry.set(req.session.keyHash, {
        userId,
        login,
        tier,
        createdAt: Date.now(),
        lastUsedAt: null
      });
      console.log(`[CAVDAX Auth] Re-registered active session key in registry for: ${login}`);
    } else {
      // Sync user profile if user authenticated with GitHub after key was initially issued
      const existingRecord = userApiKeyRegistry.get(req.session.keyHash);
      if (sessionUser && existingRecord && existingRecord.userId !== sessionUser.githubId) {
        existingRecord.userId = sessionUser.githubId;
        existingRecord.login = sessionUser.login;
        existingRecord.tier = sessionUser.tier || tier;
      }
    }

    return res.json({
      success: true,
      authenticated: Boolean(sessionUser),
      apiKey: req.session.apiKey,
      masked: `${req.session.apiKey.slice(0, 16)}...${req.session.apiKey.slice(-4)}`
    });
  }

  // Generate initial cryptographic key with 192-bit CSPRNG entropy
  const now = Date.now();
  const newKey = generateSecureApiKey(login);
  const keyHash = hashApiKey(newKey);

  userApiKeyRegistry.set(keyHash, {
    userId,
    login,
    tier,
    createdAt: now,
    lastUsedAt: null
  });

  if (req.session) {
    req.session.apiKey = newKey;
    req.session.keyHash = keyHash;
    req.session.keyCreatedAt = now;
  }

  res.json({
    success: true,
    authenticated: Boolean(sessionUser),
    apiKey: newKey,
    masked: `${newKey.slice(0, 16)}...${newKey.slice(-4)}`
  });
});

/**
 * POST /api/user/rotate-api-key
 * Cryptographically rotates the user's API key, invalidating the previous hash.
 */

// Strict limiter — Cryptographic API Key Rotation (OWASP API4 Resource Exhaustion Defense)
const keyRotateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,                  // max 5 key rotations per 5 minutes per IP/session
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many key rotation requests. Limit is 5 rotations per 5 minutes.' }
});

app.post('/api/user/rotate-api-key', keyRotateLimiter, (req, res) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Authentication required: Sign in with GitHub to rotate API keys'
    });
  }
  const login = sessionUser.login;
  const userId = sessionUser.githubId;
  const tier = sessionUser.tier || req.session?.tier || 'free';

  // Invalidate old key hash if present
  if (req.session?.keyHash) {
    userApiKeyRegistry.delete(req.session.keyHash);
  }

  // Generate new cryptographic key with 192 bits of entropy
  const now = Date.now();
  const newKey = generateSecureApiKey(login);
  const newHash = hashApiKey(newKey);

  userApiKeyRegistry.set(newHash, {
    userId,
    login,
    tier,
    createdAt: now,
    lastUsedAt: null
  });

  if (req.session) {
    req.session.apiKey = newKey;
    req.session.keyHash = newHash;
    req.session.keyCreatedAt = now;
  }

  console.log(`[CAVDAX Auth] Cryptographic API key rotated for: ${login}`);

  res.json({
    success: true,
    apiKey: newKey,
    masked: `${newKey.slice(0, 16)}...${newKey.slice(-4)}`
  });
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

/**
 * GET /api/github/repos
 * Returns repositories accessible to the authenticated GitHub session.
 */
app.get('/api/github/repos', async (req, res) => {
  if (!req.session?.user?.accessToken) {
    return res.status(401).json({
      authenticated: false,
      repos: [],
      message: 'GitHub authentication required to list repositories.'
    });
  }

  try {
    const ghRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member', {
      headers: {
        Authorization: `Bearer ${req.session.user.accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      console.warn('[CAVDAX Repos] GitHub API error:', ghRes.status, errText);
      return res.status(ghRes.status).json({
        authenticated: true,
        repos: [],
        error: 'Failed to fetch repositories from GitHub.'
      });
    }

    const repos = await ghRes.json();
    const cleanRepos = (Array.isArray(repos) ? repos : []).map(r => ({
      id: String(r.id),
      name: r.name,
      full_name: r.full_name,
      owner: r.owner?.login,
      private: Boolean(r.private),
      default_branch: r.default_branch || 'main',
      html_url: r.html_url,
      description: r.description,
      updated_at: r.updated_at
    }));

    res.json({ authenticated: true, repos: cleanRepos });
  } catch (err) {
    console.error('[CAVDAX Repos] Fetch error:', err.message);
    res.status(500).json({ authenticated: true, repos: [], error: err.message });
  }
});

// ---------------------------------------------------------------------------
// RAZORPAY PAYMENT GATEWAY
// ---------------------------------------------------------------------------
// Three endpoints power the sponsor page and (future) Pro subscription flow:
//
//   POST /api/billing/create-order    — create a Razorpay order, return order_id
//   POST /api/billing/verify-payment  — HMAC-SHA256 signature verification
//   POST /api/billing/webhook         — Razorpay webhook (async payment events)
//
// Credentials are read from environment variables only — never hardcoded.
// KEY_SECRET never leaves the server.
//
// Razorpay amounts are in the smallest currency unit (paise for INR).
// ₹1 = 100 paise. Minimum order: 100 paise (₹1).

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     || null;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || null;

// Lazily initialise the Razorpay SDK only when credentials are present.
// If env vars are missing the endpoints return a clear 503 (not a crash).
let razorpayClient = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id:     RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
  console.log('[CAVDAX Razorpay] Payment gateway initialised.');
} else {
  console.warn('[CAVDAX Razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — billing endpoints disabled.');
}

/**
 * POST /api/billing/create-order
 * Creates a Razorpay order and returns the order_id to the frontend.
 *
 * Body: { amount_paise: number, receipt?: string }
 *   amount_paise — integer, minimum 100 (₹1)
 *   receipt      — optional idempotency label (defaults to a UUID)
 *
 * Returns: { order_id, amount, currency, receipt }
 */
// In-memory order tracking to prevent tier tampering (OWASP A04 Hardening)
const pendingBillingOrders = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [orderId, data] of pendingBillingOrders) {
    if (now - data.createdAt > 2 * 60 * 60 * 1000) {
      pendingBillingOrders.delete(orderId);
    }
  }
}, 15 * 60 * 1000).unref();

app.get('/api/billing/config', (req, res) => {
  res.json({
    configured: Boolean(razorpayClient),
    key_id: RAZORPAY_KEY_ID || null
  });
});

app.post('/api/billing/create-order', async (req, res) => {
  if (!razorpayClient) {
    return res.status(503).json({
      success: false,
      error: { code: 'RAZORPAY_NOT_CONFIGURED', message: 'Payment gateway is not configured on this server.' }
    });
  }

  const { amount_paise, receipt, tier } = req.body;

  // Validate amount
  const amount = parseInt(amount_paise, 10);
  if (!amount || amount < 100) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_AMOUNT', message: 'amount_paise must be an integer >= 100 (₹1 minimum).' }
    });
  }

  try {
    const order = await razorpayClient.orders.create({
      amount,
      currency: 'INR',
      receipt:  receipt || `cavdax_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
      payment_capture: 1  // auto-capture
    });

    const targetTier = (tier || 'pro').toLowerCase();
    pendingBillingOrders.set(order.id, {
      amount,
      tier: targetTier,
      createdAt: Date.now()
    });

    console.log(`[CAVDAX Razorpay] Order created: ${order.id} | ₹${(amount / 100).toFixed(2)} [Tier: ${targetTier}]`);

    res.json({
      success: true,
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      receipt:  order.receipt,
      key_id:   RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[CAVDAX Razorpay] create-order error:', err.message);
    res.status(500).json({
      success: false,
      error: { code: 'ORDER_CREATION_FAILED', message: err.message }
    });
  }
});

/**
 * POST /api/billing/verify-payment
 * Verifies the Razorpay payment signature after the frontend checkout completes.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Returns { success: true } only if signatures match.
 * Returns 400 if signature is missing or invalid — NEVER mark as paid in this case.
 */
app.post('/api/billing/verify-payment', (req, res) => {
  if (!razorpayClient) {
    return res.status(503).json({
      success: false,
      error: { code: 'RAZORPAY_NOT_CONFIGURED', message: 'Payment gateway is not configured on this server.' }
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body;

  // Guard: all three fields are required
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required.' }
    });
  }

  // HMAC-SHA256 verification (Razorpay standard)
  const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  if (!timingSafeStringEqual(expected, razorpay_signature)) {
    console.warn(`[CAVDAX Razorpay] Signature mismatch for order ${razorpay_order_id}`);
    return res.status(400).json({
      success: false,
      error: { code: 'SIGNATURE_MISMATCH', message: 'Payment signature verification failed. Do not grant access.' }
    });
  }

  console.log(`[CAVDAX Razorpay] Payment verified: ${razorpay_payment_id} for order ${razorpay_order_id}`);

  // Signature is valid — payment is genuine.
  // Secure Tier Assignment: use server-recorded order tier; if expired/purged, default to 'pro' and never trust client input
  const recordedOrder = pendingBillingOrders.get(razorpay_order_id);
  const authorizedTier = recordedOrder?.tier || 'pro';
  if (recordedOrder) {
    pendingBillingOrders.delete(razorpay_order_id);
  }

  if (req.session) {
    req.session.tier = authorizedTier;
    if (req.session.user) {
      req.session.user.tier = authorizedTier;
    }
  }

  res.json({
    success: true,
    payment_id: razorpay_payment_id,
    order_id:   razorpay_order_id,
    tier:       authorizedTier
  });
});

/**
 * POST /api/billing/webhook
 * Receives asynchronous Razorpay events (payment.captured, payment.failed, etc.).
 * Validates the X-Razorpay-Signature header before trusting the payload.
 *
 * Register this URL in the Razorpay Dashboard → Webhooks:
 *   https://cavdax.sahnirmaan.live/api/billing/webhook
 *
 * Webhook secret: set RAZORPAY_WEBHOOK_SECRET in .env (separate from KEY_SECRET).
 * If RAZORPAY_WEBHOOK_SECRET is not set, the endpoint logs but does not validate.
 */
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature     = req.headers['x-razorpay-signature'];

  // Validate webhook signature if secret is configured
  if (webhookSecret && signature) {
    const body      = req.body;    // raw Buffer (express.raw middleware)
    const expected  = createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (!timingSafeStringEqual(expected, signature)) {
      console.warn('[CAVDAX Razorpay Webhook] Signature mismatch — ignoring.');
      return res.status(400).json({ success: false, error: 'WEBHOOK_SIGNATURE_MISMATCH' });
    }
  } else if (!webhookSecret) {
    console.warn('[CAVDAX Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature validation.');
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ success: false, error: 'INVALID_JSON' });
  }

  const eventType  = event?.event;
  const paymentId  = event?.payload?.payment?.entity?.id;
  const orderId    = event?.payload?.payment?.entity?.order_id;
  const amountPaise = event?.payload?.payment?.entity?.amount;

  console.log(`[CAVDAX Razorpay Webhook] Event: ${eventType} | payment: ${paymentId} | order: ${orderId}`);

  switch (eventType) {
    case 'payment.captured':
      // TODO (feature/payment-gateway): activate Pro tier for the user linked to orderId
      console.log(`[CAVDAX Razorpay Webhook] Payment captured ₹${(amountPaise / 100).toFixed(2)} — order ${orderId}`);
      break;
    case 'payment.failed':
      console.warn(`[CAVDAX Razorpay Webhook] Payment failed for order ${orderId}`);
      break;
    case 'subscription.activated':
      console.log(`[CAVDAX Razorpay Webhook] Subscription activated — ${event?.payload?.subscription?.entity?.id}`);
      break;
    case 'subscription.cancelled':
      console.log(`[CAVDAX Razorpay Webhook] Subscription cancelled — ${event?.payload?.subscription?.entity?.id}`);
      break;
    default:
      // Unhandled event — acknowledge and move on
      break;
  }

  // Always return 200 quickly so Razorpay stops retrying
  res.status(200).json({ success: true });
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

// ---------------------------------------------------------------------------
// GLOBAL RFC-7807 ERROR ENVELOPE MIDDLEWARE
// ---------------------------------------------------------------------------
// Catches any unhandled Express errors (4-argument signature required by Express).
// Returns a uniform JSON shape so both the Web HUD and coding agents always get a
// predictable error structure rather than raw stack traces or HTML error pages.
//
// Shape: { success: false, error: { code, message, subsystem, remediable } }
//   code        — machine-readable string (e.g. "NODE_LIMIT_EXCEEDED", "HTTP_500")
//   subsystem   — which API area the error originated from (inferred from req.path)
//   remediable  — true for 4xx (caller can fix it), false for 5xx (server-side)
//
// Must be registered AFTER all route handlers and static file middleware.
// Express identifies error handlers by their 4-parameter signature (err, req, res, next).

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  // Infer which subsystem produced the error from the request path
  let subsystem = 'server';
  if (req.path.startsWith('/api/mcp')) subsystem = 'mcp_gate';
  else if (req.path.startsWith('/api/ingest')) subsystem = 'ingestion';
  else if (req.path.startsWith('/api/auth')) subsystem = 'oauth';
  else if (req.path.startsWith('/api/audit')) subsystem = 'audit';
  else if (req.path.startsWith('/api/graph')) subsystem = 'graph';

  // Include stack trace in non-production only — never leak internals to clients
  const detail = process.env.NODE_ENV !== 'production' ? err.stack : undefined;

  console.error(`[CAVDAX Error] ${subsystem} — ${status} — ${err.message}`);

  res.status(status).json({
    success: false,
    error: {
      code: err.code || `HTTP_${status}`,
      message: err.message || 'An unexpected error occurred.',
      subsystem,
      remediable: status < 500, // 4xx = client can fix it; 5xx = server-side
      ...(detail ? { detail } : {})
    }
  });
});

// ---------------------------------------------------------------------------
// FALKORDB BACKGROUND AUTO-RECONNECT
// ---------------------------------------------------------------------------
// If FalkorDB was unreachable at boot, the server previously had no mechanism
// to reconnect without a restart. This loop polls continuously in the background.
//
// Reconnect schedule: starts at 5 s, doubles on each consecutive failure,
// caps at 5 minutes. Resets to 5 s the moment a connection succeeds.
//
// When already connected, a cheap `RETURN 1` ping validates the link each cycle;
// if it throws, isFalkorConnected is set to false and the next cycle retries.
//
// setTimeout(...).unref() ensures the timer does not keep the Node process alive
// during graceful shutdown or test teardown.

let _falkorReconnectDelay = 5_000; // starts at 5s
const FALKOR_RECONNECT_MIN = 5_000;
const FALKOR_RECONNECT_MAX = 5 * 60 * 1000; // 5 min ceiling

function _scheduleFalkorReconnect() {
  setTimeout(async () => {
    if (isFalkorConnected) {
      // Already connected — silently verify with a cheap ping
      try {
        await graph.query('RETURN 1');
        // Still alive — reset backoff and schedule next check at base interval
        _falkorReconnectDelay = FALKOR_RECONNECT_MIN;
      } catch {
        isFalkorConnected = false;
        console.warn('[CAVDAX Reconnect] FalkorDB ping failed — marking disconnected.');
      }
    } else {
      console.log(`[CAVDAX Reconnect] Retrying FalkorDB connection (next in ${_falkorReconnectDelay / 1000}s)...`);
      await initDb();
      if (isFalkorConnected) {
        console.log('[CAVDAX Reconnect] FalkorDB reconnected successfully. Backoff reset.');
        _falkorReconnectDelay = FALKOR_RECONNECT_MIN; // success — reset to base
      } else {
        // Exponential backoff: double the delay, cap at max
        _falkorReconnectDelay = Math.min(_falkorReconnectDelay * 2, FALKOR_RECONNECT_MAX);
      }
    }
    _scheduleFalkorReconnect(); // always reschedule
  }, _falkorReconnectDelay).unref();
}

// Start listening
initDb().finally(() => {
  app.listen(PORT, () => {
    console.log(`[CAVDAX Server] Running at http://localhost:${PORT}`);
    console.log(`[CAVDAX Server] Graph Engine: ${isFalkorConnected ? 'FalkorDB Live' : 'Simulation Fallback Ready'}`);
  });
  _scheduleFalkorReconnect(); // start background reconnect loop after first boot attempt
});
