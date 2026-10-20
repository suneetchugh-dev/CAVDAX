# CAVDAX Future Roadmap
### Tiered Distribution, Dev Console & Long-Term Source Ingestion

**Document Status**: Internal Planning Reference  
**Branch**: `feature/medium-long-term-improvements`  
**Last Updated**: October 2026  
**Authors**: Geetika Chugh, Suneet Chugh

---

## Table of Contents

1. [Tiered Distribution Model](#1-tiered-distribution-model)
2. [What Is Already Built Per Tier](#2-what-is-already-built-per-tier)
3. [Internal Dev Console Architecture](#3-internal-dev-console-architecture)
4. [Long-Term Source Ingestion Roadmap](#4-long-term-source-ingestion-roadmap)
5. [Implementation Priority Order](#5-implementation-priority-order)
6. [Technical Debt to Resolve Before Launch](#6-technical-debt-to-resolve-before-launch)

---

## 1. Tiered Distribution Model

CAVDAX's core value scales directly with FalkorDB graph richness — more sources ingested, more decisions tracked, more powerful the gate. This maps naturally to a three-tier commercial model.

### Tier 1 — Free (Individual Developer)

**Target**: Solo developers, open source projects, hackathon participants.

| Capability | Limit |
|---|---|
| FalkorDB graph nodes | 500 max |
| Source types supported | ADR Markdown files only |
| MCP transport | Local stdio only (`npx @cavdax/mcp-server`) |
| `npx cavdax ingest` | Manual trigger only |
| `npx cavdax check` | Git staged files (`--staged`) |
| Audit log (`GET /api/audit`) | Last 10 entries |
| API rate limit | 30 req/min (implemented) |
| Auth | No token required |
| FalkorDB hosting | Self-hosted via Docker |
| Support | Community / GitHub Issues |

**Conversion trigger**: Developer hits the 500-node limit or needs hosted SSE for team sharing.

---

### Tier 2 — Pro ($29/month, Small Team)

**Target**: Startup engineering teams, 2–10 developers sharing a causal graph.

| Capability | Limit |
|---|---|
| FalkorDB graph nodes | 10,000 max |
| Source types supported | ADR + Git commits + `package.json` |
| MCP transport | Stdio + Hosted SSE (`cavdax.sahnirmaan.live/api/mcp/sse`) |
| `npx cavdax ingest` | Auto-ingest via GitHub webhook |
| `npx cavdax check` | PR gate via `cavdax-gate.yml` |
| Audit log | Last 1,000 entries + CSV export |
| API rate limit | 300 req/min |
| Auth | `MCP_API_TOKEN` Bearer token (implemented) |
| FalkorDB hosting | Shared hosted instance on `cavdax.sahnirmaan.live` |
| Support | Email |

**Key differentiator**: Entire team shares one graph. When one engineer ingests a new ADR, every teammate's agent is blocked from stale decisions instantly.

---

### Tier 3 — Enterprise (Custom Pricing)

**Target**: Large engineering orgs, compliance-heavy industries (fintech, healthcare, government).

| Capability | Limit |
|---|---|
| FalkorDB graph nodes | Unlimited |
| Source types supported | ADR + Git commits + `package.json` + `CODEOWNERS` + GitHub Issues + custom webhooks |
| MCP transport | Stdio + SSE + self-hosted Docker Compose |
| `npx cavdax ingest` | Real-time GitHub App webhook + CI/CD integration |
| Audit log | Unlimited + SIEM export (Splunk / Datadog / CloudWatch) |
| API rate limit | Custom per-org |
| Auth | SSO / SAML + per-team scoped tokens |
| FalkorDB hosting | Dedicated instance or self-hosted with SLA |
| `npx cavdax doctor` | Full health dashboard in Web HUD `/dev` console |
| Support | Dedicated Slack channel + SLA |

---

## 2. What Is Already Built Per Tier

```
Tier 1 (Free)
  ✅ npx @cavdax/mcp-server (published on npm)
  ✅ stdio MCP server (stdioServer.js)
  ✅ Rate limiting — 30 req/min on /api/mcp/* (express-rate-limit)
  ✅ FalkorDB simulation fallback mode (no Docker needed to evaluate)
  ✅ npx cavdax check --staged
  ✅ npx cavdax ingest --repo .
  ✅ ADR TEMPLATE.md + ADR-001/002/003 examples

Tier 2 (Pro)
  ✅ Hosted SSE transport — GET /api/mcp/sse + POST /api/mcp/messages
  ✅ MCP_API_TOKEN Bearer auth middleware (requireAuth)
  ✅ GET /api/audit endpoint (fetchAuditLog Cypher query)
  ✅ Audit tab in Web HUD (AuditPage.jsx, /audit route)
  ✅ cavdax-gate.yml GitHub Action PR gate
  ✅ Multi-supersedes YAML support in parser.js
  ✅ Real latency measurement (FalkorDB internal execution time)

Tier 3 (Enterprise)
  ✅ Docker Compose production stack (infra/docker-compose.prod.yml)
  ✅ Caddy HTTPS reverse proxy with security headers
  ✅ SSE session TTL cleanup (mcpSessions memory management)
  ⏳ CODEOWNERS ingestion (planned — sources.js)
  ⏳ Git commit ingestion (planned — sources.js)
  ⏳ package.json dep change ingestion (planned — sources.js)
  ⏳ GitHub Issues as superseded sources (planned — sources.js)
  ⏳ Node count enforcement middleware
  ⏳ SIEM export from /api/audit
  ⏳ Dev Console (/dev internal route)
```

---

## 3. Internal Dev Console Architecture

### Purpose

The dev console (`/dev`) is an internal-only route for the CAVDAX team to:

- Switch between tiers and observe exactly what each tier can and cannot do
- Test rate limits, auth enforcement, node count caps, and source type restrictions
- Validate new ingestion source types before shipping to production
- Simulate agent behaviour across all three tiers in one browser session

### Access Control

The `/dev` route must never be publicly accessible on production.

**Caddy rule to add in `infra/Caddyfile`**:
```caddy
@dev_block {
    path /dev*
    not remote_ip 127.0.0.1 ::1 10.0.0.0/8
}
respond @dev_block 403
```

Locally (`localhost:5173`) the route is always accessible without restriction.

---

### Dev Console UI Layout

Route: `/dev`  
Design: follows `docs/UI_DESIGN_SYSTEM.md` — no emojis, Lucide icons, monospace telemetry, no eyebrow pills.

```
┌──────────────────────────────────────────────────────────────────┐
│  CAVDAX Dev Console                          Internal Use Only    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Active Tier    ┌──────┐ ┌─────┐ ┌───────────┐                  │
│                 │ Free │ │ Pro │ │ Enterprise │  ← sliding pill  │
│                 └──────┘ └─────┘ └───────────┘                  │
│                                                                  │
│  API Token      [________________________________]  Set          │
│                  Clears to empty = Free tier (no auth)           │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Graph Telemetry                                                  │
│  ─────────────────────────────────────────────                   │
│  Node Count     147 / 500     ██████░░░░░░░░  29%               │
│  Edge Count     203                                              │
│  Gate Latency   1.84ms        FalkorDB Live                      │
├──────────────────────────────────────────────────────────────────┤
│  Tier Feature Checks                                             │
│  ─────────────────────────────────────────────                   │
│  Rate limit     30 req/min    Run 31x  →  [Trigger]             │
│  Auth           Bearer token  Wrong token → [Trigger 401]       │
│  Audit log      10 entries    Open /audit →  [Navigate]         │
│  Node cap       500 max       Seed 600 → [Trigger 429]         │
│  SSE transport  localhost     Connect → [Test SSE]             │
├──────────────────────────────────────────────────────────────────┤
│  Source Ingestion Tester                                         │
│  ─────────────────────────────────────────────                   │
│  Source Type   [ ADR ] [ COMMIT ] [ PACKAGE_JSON ] [ CODEOWNERS ]│
│  Input         [________________________________]               │
│                [Ingest →]                                        │
│                                                                  │
│  Result        SUPERSEDES edge created in 2.1ms                 │
│                Affected decisions: DEC-102, DEC-104              │
└──────────────────────────────────────────────────────────────────┘
```

### Dev Console Implementation Plan

**File to create**: `apps/client/src/components/DevConsolePage.jsx`

**Server endpoint to add**: `GET /api/dev/tier-check` — returns current tier config, node count, rate limit status. Protected: only responds to `127.0.0.1` or when `NODE_ENV !== 'production'`.

**App.jsx changes needed**:
```javascript
// Add to TAB_TO_PATH
dev: '/dev',

// Add to resolveTabFromUrl
if (rawPath === '/dev') return 'dev';

// Add to render
} : activeTab === 'dev' ? (
  <DevConsolePage />
)
```

**Header.jsx**: Do NOT add `/dev` to the main nav. Access it directly via URL — it should not appear in the public navigation bar.

---

## 4. Long-Term Source Ingestion Roadmap

All four new source types will live in a new file `core/ingestion/sources.js`. The existing `core/ingestion/parser.js` handles ADR Markdown only and will not be modified.

Each source type creates a `(:Source)` node in FalkorDB, then optionally triggers `cascadeInvalidation` if a superseding relationship is detected.

---

### Source Type 1 — Git Commit

**When to use**: Track commits that change architectural decisions — e.g. a commit that bumps a dependency version or renames a service endpoint.

**How CAVDAX detects superseding**:
```
Commit message pattern:  "supersedes: ADR-001"  or  "breaks: DEC-102"
Conventional commit:     "feat!: ..."  (breaking change flag)
```

**FalkorDB node created**:
```cypher
CREATE (s:Source {
  id: 'commit-9f8a2b',
  type: 'COMMIT',
  ref: '9f8a2b3',
  title: 'feat!: migrate payment endpoint to /api/v2',
  status: 'ACTIVE',
  author: 'alice@example.com',
  created_at: timestamp()
})
```

**Function signature**:
```javascript
// core/ingestion/sources.js
export async function ingestGitCommit(graph, { sha, message, author, repoRoot })
```

**CLI trigger**:
```bash
npx cavdax ingest --type commit --sha 9f8a2b3
```

---

### Source Type 2 — `package.json` Dependency Change

**When to use**: When a dependency is upgraded to a breaking version or a banned package is removed — agents should not generate code using the old API.

**How CAVDAX detects superseding**:
- `package.json` diff: if a dependency version changes (e.g. `"express": "^4"` → `"^5"`), old version's Source node is superseded
- If a package is removed entirely, its Source node is marked `SUPERSEDED`

**FalkorDB node created**:
```cypher
CREATE (s:Source {
  id: 'pkg-express-v5',
  type: 'PACKAGE_JSON',
  ref: 'package.json',
  title: 'express upgraded from ^4 to ^5 (breaking API change)',
  status: 'ACTIVE',
  created_at: timestamp()
})
```

**Function signature**:
```javascript
export async function ingestPackageJsonChange(graph, { filePath, oldVersion, newVersion, packageName })
```

**CLI trigger**:
```bash
npx cavdax ingest --type package --repo .
# Scans package.json, diffs against graph's known pkg Sources
```

---

### Source Type 3 — CODEOWNERS Change

**When to use**: When team ownership of a path changes, agents generating PR assignments or routing code must use the current owner, not a cached stale one.

**How CAVDAX detects superseding**:
- Line-by-line diff of `CODEOWNERS` file
- If `/services/payment.js @alice` → `/services/payment.js @bob`, old owner fact is superseded

**FalkorDB node created**:
```cypher
CREATE (s:Source {
  id: 'codeowners-payment-bob',
  type: 'CODEOWNERS',
  ref: '.github/CODEOWNERS',
  title: '/services/payment.js ownership transferred to @bob',
  status: 'ACTIVE',
  created_at: timestamp()
})
```

**Function signature**:
```javascript
export async function ingestCodeownersChange(graph, { filePath, path, oldOwner, newOwner })
```

**CLI trigger**:
```bash
npx cavdax ingest --type codeowners --repo .
```

---

### Source Type 4 — GitHub Issues (Closed as Superseded)

**When to use**: When a GitHub Issue is closed as "won't fix" or "superseded by", any decisions grounded in that Issue's requirements should be invalidated.

**How CAVDAX detects superseding**:
- GitHub webhook: `issues.closed` event with label `superseded` or closing comment containing `supersedes: ADR-XXX`
- GitHub API poll (for teams without webhook): `GET /repos/:owner/:repo/issues?state=closed&labels=superseded`

**FalkorDB node created**:
```cypher
CREATE (s:Source {
  id: 'issue-142',
  type: 'GITHUB_ISSUE',
  ref: 'https://github.com/org/repo/issues/142',
  title: 'Issue #142 closed: Abandon rate-limit v1 approach',
  status: 'ACTIVE',
  created_at: timestamp()
})
```

**Function signature**:
```javascript
export async function ingestGitHubIssue(graph, { issueNumber, title, htmlUrl, supersedesIds })
```

**New server endpoint needed**:
```javascript
// POST /api/webhook/github
// Receives GitHub App webhook events, routes to correct ingestor
app.post('/api/webhook/github', verifyGitHubWebhookSignature, async (req, res) => { ... })
```

---

### Unified Ingestor Entry Point

Once all four sources are implemented, `ingestCommand.js` will route to the correct function:

```javascript
// apps/mcp-server/src/ingestCommand.js (updated)
import {
  ingestGitCommit,
  ingestPackageJsonChange,
  ingestCodeownersChange,
  ingestGitHubIssue
} from '../../../core/ingestion/sources.js';

// npx cavdax ingest --type commit|package|codeowners|issue|adr
```

---

## 5. Implementation Priority Order

```
Phase 1 — Already Done
  ✅ NPM package (@cavdax/mcp-server@1.0.0)
  ✅ Hosted SSE transport
  ✅ Auth middleware + rate limiting
  ✅ Audit endpoint + Audit UI tab
  ✅ Multi-supersedes YAML support
  ✅ ADR templates + TEMPLATE.md

Phase 2 — Next (sources.js + Dev Console)
  [ ] core/ingestion/sources.js scaffold
  [ ] ingestGitCommit()
  [ ] ingestPackageJsonChange()
  [ ] ingestCodeownersChange()
  [ ] ingestGitHubIssue() + GitHub webhook endpoint
  [ ] DevConsolePage.jsx
  [ ] GET /api/dev/tier-check endpoint
  [ ] Caddy /dev block rule for production

Phase 3 — Tier Enforcement
  [ ] CAVDAX_TIER env var (free | pro | enterprise)
  [ ] Node count enforcement middleware
  [ ] Audit log entry limit per tier
  [ ] Rate limit values read from tier config
  [ ] Tier badge in Web HUD header

Phase 4 — Enterprise
  [ ] SIEM export from /api/audit (Splunk/Datadog JSON format)
  [ ] GitHub App setup for real-time webhook ingestion
  [ ] SSO / SAML token scoping
  [ ] Dedicated FalkorDB instance provisioning docs
```

---

## 6. Technical Debt to Resolve Before Launch

| Item | File | Priority |
|------|------|----------|
| `README.md` still references `core/mcp/stdio.js` path | `README.md` | High |
| `README.md` simulation mode note still says DEC-102 = stale | `apps/mcp-server/README.md` | High |
| Benchmark `evaluate.js` uses hardcoded latency numbers | `benchmark/evaluate.js` | Medium |
| `fetchGraphState` has no pagination — unbounded query on large graphs | `core/graph/queries.js` | Medium |
| No `.env.example` file — devs don't know what env vars exist | root | High |
| `apps/server` has no `package-lock.json` committed — CI uses `npm install` | `apps/server/` | Medium |
| `CAVDAX_TIER` env var not yet read anywhere — tier logic not wired | `apps/server/index.js` | Phase 3 |

---

*This document is the single source of truth for CAVDAX product roadmap decisions.*  
*Update this file when any planned item is completed or reprioritised.*
