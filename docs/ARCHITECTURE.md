# System Architecture Specification — CAVDAX

**Project**: CAVDAX (**C**ontextual **A**ction & **V**erified **D**ecision **A**utonomous e**X**ecution)  
**System Class**: Causal Knowledge Graph & Enclosed MCP Execution Gate  
**Version**: 1.0.0-PRODUCTION  

---

## 1. System Topology & Technology Stack Justification

CAVDAX is architected as a high-performance, low-latency polyglot monorepo engineered to provide autonomous AI coding agents with verifiable causal provenance before any code mutation reaches disk.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION & HUD TIER                                │
│   React 18 + Vite + Tailwind CSS + Lucide + Framer Motion Kinetic Physics       │
│   - Interactive Temporal DAG Canvas with dynamic column layout auto-scaling    │
│   - Draggable & Responsive Node Inspector with container boundary physics       │
│   - Live What-If Blast Radius Simulation & Downstream Dependency Traversal      │
│   - Monochromatic Design System, Sound Engine, and Audit Trail Quick-Filters    │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ HTTP REST & SSE (/api/events, /api/graph)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MCP INTERCEPTOR & GATEWAY TIER                           │
│   Node.js (v20+) + Express Gateway + MCP Protocol Standard Server               │
│   - GitHub ADR Scanner & Smart Stack Detector (apps/server/githubAdr.js)        │
│   - Non-Destructive Pull Request Engine (cavdax/init-adr, cavdax/sync-*)        │
│   - Standalone SVG & Vision OCR Generator (core/graph/renderSvg.js)             │
│   - Atomic System State & Session Store (apps/server/systemState.js)            │
│   - Enclosed Tool Handlers: apply_code_change, export_graph_image, check_intent │
│   - Out-of-Band Divergence Radar: Resend API Dispatcher + VAPID Web Push Broker │
│   - GitHub Webhook Ingestion Engine: POST /api/github/webhook with HMAC-SHA256   │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ FalkorDB Client (Redis Protocol / Parameterized Cypher)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CAUSAL GRAPHBLAS STORAGE & KERNEL                          │
│   FalkorDB 0.4+ Container (GraphBLAS Sparse Matrix Linear Algebra Engine)       │
│   Causal Directed Acyclic Graph (DAG): Sources ──► Facts ──► Decisions ──► Actions│
│   Sub-2ms matrix invalidation traversal via ANY() path reachability             │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ Atomic Write-Through on Approved Verdict
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    TARGET CODEBASES & REPOSITORY ECOSYSTEM                      │
│   - Local Protected Disk: Sandboxed target files (demo-repo/src/services/...)  │
│   - External GitHub Repos: Zero-touch default branches; dedicated review PRs    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Stack Selection Rationale
- **Out-of-Band Divergence Radar (Resend API + RFC 8292 VAPID Web Push)**: Real-time enclosed gating protects in-flight tool calls, but human engineers operate asynchronously. The divergence radar monitors repository mutations via webhooks and dispatches blast-radius bound alerts via Resend (`no-reply@sahnirmaan.live`) and background Service Worker push (`/sw.js`), eliminating silent architectural decay.

- **Client (React 18 + Vite)**: Instant HMR, minimal bundle footprint (<200kB), hardware-accelerated pure CSS animations for brand assets with zero external heavy canvas dependencies.
- **MCP Gateway (Node.js Express + MCP Protocol)**: Native compatibility with Claude Code, Cursor, and standard LLM tool-calling conventions. Complete protocol specification and enterprise deployment architecture are detailed in [MCP_SPECIFICATION.md](MCP_SPECIFICATION.md).
- **Graph Storage (FalkorDB + GraphBLAS)**: Traditional relational databases cannot perform multi-hop recursive dependency traversals under 10ms. Vector databases cannot perform causal graph invalidation. FalkorDB leverages GraphBLAS sparse matrix linear algebra to execute multi-hop Cypher queries in **<2ms**, making pre-execution gating imperceptible to developer workflows.

---

## 2. End-to-End Multi-Tier Data Flow

### 2.1 The 4-Act Causal Invalidation & Execution Loop

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Git Webhook
    actor Agent as Autonomous AI Agent
    participant MCP as Enclosed MCP Gate
    participant Falkor as FalkorDB (GraphBLAS)
    participant Disk as Protected Codebase Disk

    Note over Dev, Falkor: ACT I: Baseline State (ADR-001 accepted, DEC-102 valid)
    Dev->>Falkor: Seed Baseline ADR-001 & DEC-102
    Falkor-->>MCP: Causal Chain Active

    Note over Dev, Falkor: ACT II: Ingestion of Superseding Commit
    Dev->>MCP: POST /api/ingest (Commit containing ADR-002)
    MCP->>Falkor: Cypher: CREATE (new:Source {id:'ADR-002'})-[:SUPERSEDES] to (old:Source {id:'ADR-001'})
    Falkor->>Falkor: GraphBLAS Invalidation Cascade (ADR-001 is SUPERSEDED, DEC-102 is INVALIDATED)
    Falkor-->>MCP: Invalidation Complete in 2.14ms

    Note over Agent, Disk: ACT III: Agent Attempts Stale Code Execution
    Agent->>MCP: POST /api/mcp/call (apply_code_change, decision: 'DEC-102')
    MCP->>Falkor: Cypher: Check Decision DEC-102 dependency provenance
    Falkor-->>MCP: Return: Source=SUPERSEDED, Fact=STALE
    MCP-->>Agent: 403 FORBIDDEN: BLOCKED_SUPERSEDED_SOURCE (Zero bytes written to disk)

    Note over Agent, Disk: ACT IV: Revalidation & Grounded Write
    Agent->>Falkor: Query Active Sources (Returns ADR-002: OAuth2)
    Agent->>Falkor: Create Decision DEC-103 grounded in ADR-002
    Agent->>MCP: POST /api/mcp/call (apply_code_change, decision: 'DEC-103')
    MCP->>Falkor: Verify Provenance Path for DEC-103
    Falkor-->>MCP: Return: Source=ACTIVE, Fact=VERIFIED
    MCP->>Disk: Atomic Write Verified OAuth2 Code to payment.js
    MCP-->>Agent: 200 OK: GATE APPROVED in 1.62ms
```

---

## 3. Causal Graph Schema & Data Contracts

### 3.1 Node Entity Declarations
```cypher
// 1. Source Node (Architectural Decision Records / Commits)
(:Source {
  id: STRING,         // e.g. "ADR-001", "ADR-002"
  title: STRING,      // e.g. "Adopt TokenAuth v1", "Migrate to OAuth2"
  status: STRING,     // "ACTIVE" | "SUPERSEDED" | "DEPRECATED"
  timestamp: INTEGER, // Epoch ms
  commit_hash: STRING // Git SHA-1 hash
})

// 2. Fact Node (Atomic Claims extracted from Sources)
(:Fact {
  id: STRING,         // e.g. "F-Auth-v1", "F-OAuth2"
  claim: STRING,      // e.g. "Payment services require TokenAuth v1"
  is_stale: BOOLEAN,  // true | false
  verified: BOOLEAN   // true | false
})

// 3. Decision Node (Agent Reasoning & Architectural Intent)
(:Decision {
  id: STRING,         // e.g. "DEC-102", "DEC-103"
  title: STRING,      // e.g. "Generate Checkout with TokenAuth v1"
  status: STRING,     // "VALID" | "INVALIDATED_NEEDS_REVALIDATION" | "ARCHIVED"
  rationale: STRING   // Architectural justification
})
```

### 3.2 Relational Edge Contracts
- `(:Fact)-[:EXTRACTED_FROM]->(:Source)`: Identifies the foundational documentation origin of a factual premise.
- `(:Decision)-[:DEPENDS_ON]->(:Fact)`: Encapsulates agent reasoning upon factual premises.
- `(:Source)-[:SUPERSEDES]->(:Source)`: Causal temporal precedence. When `A SUPERSEDES B`, all downstream facts and decisions of `B` are instantly poisoned.

---

## 4. Model Context Protocol (MCP) Interface Declarations

CAVDAX implements the official Anthropic Model Context Protocol specification:

### 4.1 Tool: `apply_code_change`
```json
{
  "name": "apply_code_change",
  "description": "Applies verified code modifications to the repository, strictly gated by causal provenance in FalkorDB.",
  "parameters": {
    "type": "object",
    "properties": {
      "decision_id": {
        "type": "string",
        "description": "The unique identifier of the Decision node justifying this change (e.g. 'DEC-103')."
      },
      "file_path": {
        "type": "string",
        "description": "Relative target file path in the repository (e.g. 'demo-repo/src/services/payment.js')."
      },
      "code_payload": {
        "type": "string",
        "description": "The exact source code to write upon provenance verification."
      }
    },
    "required": ["decision_id", "file_path", "code_payload"]
  }
}
```

### 4.2 Tool: `verify_provenance`
```json
{
  "name": "verify_provenance",
  "description": "Performs an asynchronous dry-run traversal on FalkorDB to audit whether a candidate Decision node is unblemished.",
  "parameters": {
    "type": "object",
    "properties": {
      "decision_id": { "type": "string" }
    },
    "required": ["decision_id"]
  }
}
```

---

## 5. Security & Invalidation Gates (Cypher Traversal Queries)

### 5.1 Pre-Execution Provenance Verification Query
```cypher
MATCH (d:Decision {id: $decision_id})
OPTIONAL MATCH (d)-[:DEPENDS_ON]->(f:Fact)-[:EXTRACTED_FROM]->(s:Source)
OPTIONAL MATCH (new_s:Source)-[:SUPERSEDES]->(s)
RETURN 
  d.id AS decision_id,
  d.status AS decision_status,
  f.id AS fact_id,
  f.is_stale AS fact_stale,
  s.id AS source_id,
  s.status AS source_status,
  new_s.id AS superseding_source_id
```

### 5.2 Real-Time Gate Evaluation Logic
1. If `d` does not exist $\rightarrow$ **REJECT** (`UNREGISTERED_DECISION`).
2. If `s.status == 'SUPERSEDED'` or `new_s != null` $\rightarrow$ **REJECT** (`BLOCKED_SUPERSEDED_SOURCE`).
3. If `f.is_stale == true` $\rightarrow$ **REJECT** (`BLOCKED_STALE_FACT`).
4. If `d.status == 'VALID'` and all upstream sources are `ACTIVE` $\rightarrow$ **APPROVE** (`APPROVED`).

---

## 6. Infrastructure, Containerization & Fail-Open Resilience

### 6.1 Docker Compose Mesh (`infra/docker-compose.yml`)
```yaml
version: '3.8'

services:
  falkordb:
    image: falkordb/falkordb:latest
    container_name: cavdax-falkordb
    ports:
      - "6379:6379"
    volumes:
      - falkordb_data:/data
    restart: unless-stopped

  cavdax-server:
    build:
      context: ..
      dockerfile: apps/server/Dockerfile
    container_name: cavdax-server
    environment:
      - PORT=3000
      - FALKORDB_HOST=falkordb
      - FALKORDB_PORT=6379
    ports:
      - "3000:3000"
    depends_on:
      - falkordb

volumes:
  falkordb_data:
```

### 6.2 Zero-Blocker Simulation Fallback
If the FalkorDB Docker container is offline during a local developer evaluation or live demo:
- `apps/server/falkor_driver.js` automatically catches connection timeouts.
- Switches instantaneously to the internal `InMemGraphBLAS` engine.
- Emulates the exact GraphBLAS matrix invalidation and gate returns with identical Cypher responses, guaranteeing **zero runtime crashes or demo blockers**.


---

## 7. Enterprise Security Perimeter & Web HUD Multi-Route Topology

### 7.1 Multi-Layer Defense-in-Depth Security
CAVDAX implements layered security across client, gateway, and kernel boundaries:
1. **Administrative IP Whitelisting & Dev Authentication (`requireDevAuth`)**:
   - Administrative endpoints (`POST /api/system/dev-ips`, `/api/system/dev-roster`, `/api/system/hackathon-mode`) are guarded by SHA-256 token verification and IP allowlists.
2. **Path Traversal Confinement**:
   - Gated file operations (`apply_code_change`, `/api/ingest`) resolve target paths with `path.resolve` and verify that the target starts with `PROJECT_ROOT`, preventing arbitrary directory access.
3. **Client IP Spoofing Mitigation**:
   - Uses remote socket address inspection to prevent proxy header tampering.
4. **Transport Security Headers**:
   - Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Strict-Transport-Security`.
5. **Cryptographic Order Tier Binding**:
   - Razorpay order creation binds subscription tier attributes in server memory (`pendingBillingOrders`), rejecting mismatched confirmation payloads with canonical server-side pricing (`CANONICAL_TIER_PRICES_PAISE`).
6. **Tool Sandbox Confinement (`demo-repo/`)**:
   - Tool execution (`apply_code_change`) is confined to `demo-repo/` root; path traversal attempts outside the sandbox trigger immediate 403 blocks with zero byte writes.
7. **Multi-Tenant Scoped Graph Query Isolation**:
   - Graph queries (`/api/graph`, `/api/audit`) enforce parameterized tenant scoping (`WHERE coalesce(d.repo, 'demo') = $repoScope`); unauthenticated callers strictly see canonical demo data.
8. **Section 37 Truth-in-Data Standard (Zero Hardcoded Benchmark Strings or Fake Latency Fallbacks)**:
   - Absolute ban on synthetic numerical constants or logical OR fallbacks for elapsed times (e.g. `parseFloat(...) || 0.42` eliminated); pure execution time is measured dynamically with nanosecond precision (`process.hrtime.bigint()`). Benchmark evaluation suites run real dynamic vector similarity and DAG traversals rather than hardcoded mock strings.



### 7.2 Web HUD Route Topology (9 Operational Surfaces)
The client application provides 9 dedicated routes:
- `/` or `/overview`: Architectural Overview, Causal Invalidation Radar, Cytoscape DAG.
- `/console`: Connected Repository Workspace, git branch mutations, baseline initialization.
- `/mcp`: Live Model Context Protocol Action Playground and sub-millisecond Cypher query simulator.
- `/walkthrough`: 4-Act Storyline Stepper guiding evaluators through baseline, commit mutation, enclosed MCP rejection, and revalidation.
- `/audit`: Immutable compliance ledger displaying all tool execution events.
- `/team`: Engineering credits and research attribution.
- `/profile`: Developer quota tracking, plan capability matrix, and active MCP key provisioning.
- `/support`: Community sponsorship tiers and transparent operational backing breakdown.
- Zero-Trust Administrative Enclave: Diagnostic console, dev IP roster, and node state inspection.
