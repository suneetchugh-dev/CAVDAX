# CAVDAX: Technical Specification & Blueprint
**Contextual Action & Verified Decision Autonomous eXecution**  
*Graph-Grounded Decision Execution for Coding Agents*

---

## 1. Project Identity & Overview

| Attribute | Specification |
| :--- | :--- |
| **Project Name** | **CAVDAX** (Pronounced: *KAV-daks*) |
| **Expansion** | **C**ontextual **A**ction & **V**erified **D**ecision **A**utonomous e**X**ecution |
| **Tagline** | Graph-Grounded Decision Execution for Coding Agents |
| **Hackathon** | WeMakeDevs × FalkorDB: *Graph Hacks — Context for AI Agents* |
| **Primary Track** | **Track 01: Agents That Act on Connected Data** *(Focus: Multi-hop reasoning, Cypher tools, deterministic action gate, traceable paths)* |
| **Eligible Secondary Track** | **Track 02: Agent Memory and Coordination** *(Focus: Temporal validity windows, causal memory, cross-session invalidation)* |
| **Target Submission Deadline** | October 18, 2026 at 11:59 PM IST |

---

## 2. The Problem: The "Silent Cache Rot" Vulnerability

Modern autonomous coding agents (Cursor, Claude Code, Devin, Copilot Workspace) rely on **flat context windows or Vector RAG (embeddings)**. 

### Why Vector Search & Flat Caches Fail:
1. **Zero Causal Awareness:** Vector search measures text similarity, not logical truth or causal dependency. If an Architecture Decision Record (ADR #42) says *"Use TokenAuth v1"*, and a Git commit yesterday deprecated it in favor of *"OAuth2"*, vector search still retrieves ADR #42 with 0.89 similarity score.
2. **The Stale Execution Disaster:** Coding agents happily execute destructive or obsolete actions (generating deprecated auth code, assigning incidents to former owners, applying breaking migrations) because their memory has no invalidation cascades.
3. **Lack of Provenance:** When an agent acts, developers cannot trace the exact multi-hop evidence chain that justified that action.

---

## 3. The CAVDAX Solution

**CAVDAX** turns organizational knowledge and software history into an active, temporal causal graph inside **FalkorDB**.

```
[ Git Commit / PR / ADR ] (Source)
         │
         ▼ [:EXTRACTED_FROM]
   [ Atomic Fact ] (e.g. "Auth v1 Deprecated")
         │
         ▼ [:DEPENDS_ON]
[ Architecture Decision ] (e.g. "Decision #102: Use Auth v1")
         │
         ▼ [:PROPOSES_ACTION]
   [ Agent Action ] (e.g. "Generate Payment Migration Script")
```

### The Three Core Innovations:
1. **Live Causal Invalidation Cascade:** When a source commit or policy changes, a single multi-hop Cypher traversal instantly ripples through all dependent facts and decisions, marking them `INVALIDATED_NEEDS_REVALIDATION`.
2. **The Grounded-Action Gate (MCP Tool):** Before any autonomous agent executes a consequential action, it must pass through the **CAVDAX Gate**. The gate deterministically inspects the FalkorDB causal path. If any supporting fact is stale, unverified, or disconnected, the action is **hard-blocked**.
3. **The "FalkorDB Off, Product Fails" Guarantee:** Removing FalkorDB destroys the product. A flat database or vector search cannot perform multi-hop causal graph validation in <5ms.

---

## 4. FalkorDB Graph Data Model

### Node Schemas:

* **`:Source`**: Physical artifact in the repository.
  * `id`: STRING (e.g., `"src-commit-8f3a"`)
  * `type`: STRING (`"COMMIT"`, `"PR"`, `"ADR"`, `"CODEOWNERS"`)
  * `ref`: STRING (e.g., `"commit:8f3a12b"`, `"adr/004-auth.md"`)
  * `author`: STRING
  * `timestamp`: INTEGER (Epoch ms)
  * `status`: STRING (`"ACTIVE"`, `"SUPERSEDED"`)

* **`:Fact`**: Atomic claim extracted from sources.
  * `id`: STRING (e.g., `"fact-auth-v1"`)
  * `claim`: STRING (e.g., `"Payment API requires TokenAuth v1"`)
  * `is_stale`: BOOLEAN (`false` = active, `true` = invalidated)
  * `verified`: BOOLEAN (`true` = directly extracted from source)
  * `invalidated_at`: INTEGER (nullable)

* **`:Decision`**: Synthesized decision or architectural directive.
  * `id`: STRING (e.g., `"dec-102"`)
  * `title`: STRING (e.g., `"Use TokenAuth for Checkout Gateway"`)
  * `status`: STRING (`"VALID"`, `"INVALIDATED_NEEDS_REVALIDATION"`)
  * `confidence`: FLOAT

* **`:AgentAction`**: Proposed operational or code execution by an AI agent.
  * `id`: STRING (e.g., `"act-901"`)
  * `action_type`: STRING (`"CODE_GEN"`, `"MERGE_PR"`, `"ASSIGN_INCIDENT"`)
  * `payload`: STRING
  * `gate_verdict`: STRING (`"PENDING"`, `"APPROVED"`, `"BLOCKED"`)

### Relationship Schemas:
* `(Fact)-[:EXTRACTED_FROM]->(Source)`
* `(Decision)-[:DEPENDS_ON]->(Fact)`
* `(AgentAction)-[:GROUNDED_IN]->(Decision)`
* `(Source)-[:SUPERSEDES]->(Source)`

---

## 5. Core Cypher Queries (Submission Requirement #5)

### Query 1: The Grounded-Action Gate (Verification Query)
*Executed by the MCP tool before allowing an agent action.*
```cypher
MATCH (a:AgentAction {id: $actionId})-[:GROUNDED_IN]->(d:Decision)
OPTIONAL MATCH path = (d)-[:DEPENDS_ON*1..3]->(f:Fact)-[:EXTRACTED_FROM]->(s:Source)
WITH a, d, f, s, path,
     CASE 
       WHEN path IS NULL THEN 'NO_PROVENANCE_PATH'
       WHEN f.is_stale = true THEN 'STALE_FACT_DETECTED'
       WHEN s.status = 'SUPERSEDED' THEN 'SUPERSEDED_SOURCE'
       ELSE 'HEALTHY'
     END AS path_status
RETURN a.id AS action_id,
       d.id AS decision_id,
       path_status,
       f.claim AS offending_fact,
       s.ref AS source_reference,
       [n IN nodes(path) | labels(n)[0] + ':' + coalesce(n.id, n.ref)] AS causal_chain
```

### Query 2: Cascading Invalidation on Source Mutation
*Triggered when a new commit or documentation change is ingested.*
```cypher
MATCH (newSource:Source {id: $newSourceId})-[:SUPERSEDES]->(oldSource:Source)
MATCH (oldSource)<-[:EXTRACTED_FROM]-(staleFact:Fact)
SET staleFact.is_stale = true, 
    staleFact.invalidated_at = timestamp()
WITH staleFact
MATCH (d:Decision)-[:DEPENDS_ON*1..4]->(staleFact)
SET d.status = 'INVALIDATED_NEEDS_REVALIDATION'
RETURN count(DISTINCT d) AS affected_decisions, 
       collect(d.title) AS invalidated_decision_titles
```

### Query 3: Blast-Radius & Knowledge Centrality
*Computes structural centrality of affected decisions across organizational subsystems.*
```cypher
MATCH (d:Decision)
OPTIONAL MATCH (d)<-[:GROUNDED_IN]-(a:AgentAction)
OPTIONAL MATCH (d)-[:DEPENDS_ON]->(f:Fact)
RETURN d.id AS decision_id,
       d.title AS decision_title,
       d.status AS current_status,
       count(DISTINCT a) AS downstream_actions_count,
       count(DISTINCT f) AS upstream_facts_count
ORDER BY downstream_actions_count DESC
```

---

## 6. The 3-Minute Demo Video Script (The Winning Formula)

* **0:00 - 0:35 [The Fatal Flaw of Vector RAG]:**  
  Show a standard coding agent (Claude Code / Cursor style) with Vector RAG. The agent is asked: *"Write the checkout migration script."* The agent uses vector similarity to find ADR #102 and writes broken code using deprecated Auth v1.
* **0:35 - 1:15 [Enter CAVDAX & FalkorDB]:**  
  Introduce CAVDAX. Show the live porcelain HUD. Show the FalkorDB causal graph: `Source (ADR 102)` $\rightarrow$ `Fact (Auth v1)` $\rightarrow$ `Decision (Dec 102)`. Show the initial status: `HEALTHY`.
* **1:15 - 1:55 [The Live Mutation Event]:**  
  Ingest a new Git commit: `"Commit 9f8a2b: Auth v1 permanently decommissioned; use OAuth2"`.  
  Show FalkorDB run Query 2 in **3 milliseconds**. Watch the HUD live: the edge turns red, `Fact` turns `is_stale: true`, and `Decision 102` cascades to `INVALIDATED`.
* **1:55 - 2:30 [The Grounded-Action Gate in Action]:**  
  The coding agent attempts to execute the same checkout migration script.  
  The CAVDAX MCP Gate intercepts the call, executes Query 1, and **slams the door shut**:  
  `[ ⛔ ACTION BLOCKED: Grounding path broken at Fact-Auth-v1 by Commit 9f8a2b ]`.
* **2:30 - 3:00 [The FalkorDB Proof & Architecture]:**  
  Display the Cypher queries, explain how removing FalkorDB breaks the deterministic gate, and summarize the business utility for enterprise agent safety.

---

## 7. Deliverables & Execution Matrix

1. **Working Source Code:** Monorepo with Express/FastAPI backend, FalkorDB client, and React HUD.
2. **README.md:** High-impact documentation with graph model diagrams and Cypher queries.
3. **FalkorDB Connection:** Cloud instance connected + local `docker-compose.yml` for reproducible judge verification.
4. **Hosted Demo:** Live Vercel deployment of the CAVDAX HUD.
5. **Video Demonstration:** Hosted 3-minute video on YouTube / Loom.
6. **Track Selection:** **Track 01 — Agents That Act on Connected Data** (explicitly named).
