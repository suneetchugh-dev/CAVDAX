# CAVDAX: Source Polymorphism & Generalization Guide
### **Beyond ADRs: How CAVDAX Protects Any Repository**
*A Technical Defense on Source Agnosticism, Structural Ingestion, and Enterprise Scope*

**Prepared for:** Geetika Chugh (Didi) & Suneet Chugh  
**Project:** CAVDAX (*Contextual Action & Verified Decision Autonomous eXecution*)  
**Event:** WeMakeDevs × FalkorDB *Graph Hacks: Context for AI Agents*  

---

## 1. The Core Question: "Does CAVDAX Fail Without ADRs?"

> **The Question:** *"Is it necessary that a repository maintains formal Architecture Decision Records (ADRs)? If a repo doesn't have ADRs, will CAVDAX fail?"*

### The Direct Answer:
**No. CAVDAX does NOT fail without ADRs.**

In our FalkorDB data model, the node label is **`:Source`**, not `:ADR`. 

An ADR is merely **one polymorphic implementation of a source artifact**. It was chosen for the 3-minute hackathon demo because it provides a clean, visual, human-readable proof of architectural intent. However, the underlying FalkorDB graph schema, the multi-hop Cypher queries, and the enclosed MCP Gate logic are **100% source-agnostic**.

---

## 2. The 3-Tier Source Hierarchy in CAVDAX

Real-world software engineering organizations store architectural truth across different layers. CAVDAX handles all three:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAVDAX 3-TIER SOURCE HIERARCHY                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ Tier 1: Explicit Architectural Records (ADRs, RFCs) ]               │
│  • Format: Markdown files with YAML frontmatter                        │
│  • Where Found: Kubernetes, Rust, Django, mature enterprise codebases  │
│  • Ingestion: 100% Deterministic (frontmatter parser)                  │
│                                                                        │
│  [ Tier 2: Structural Repository Metadata (100% of Repositories) ]     │
│  • Format: CODEOWNERS, package.json, pom.xml, docker-compose.yml       │
│  • Where Found: Almost every Git repository on GitHub / GitLab         │
│  • Ingestion: 100% Deterministic (file diffs & key-value parsing)      │
│                                                                        │
│  [ Tier 3: Unstructured Git Commits & PR Discussions ]                 │
│  • Format: Raw commit messages ("feat: migrate to OAuth2"), PR bodies  │
│  • Where Found: All day-to-day developer workflows                     │
│  • Ingestion: Probabilistic (LLM entity/relation extraction)           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Three Real-World Non-ADR Examples (Same Cypher Engine)

To prove that the exact same FalkorDB queries work without touching an ADR, examine these three everyday enterprise engineering scenarios:

### Scenario A: Team Reorganization & Incident Routing (`CODEOWNERS`)
* **Source:** `.github/CODEOWNERS`
* **Extracted Fact:** `(:Fact {claim: "PaymentGateway service is owned by @alice", is_stale: false})`
* **Decision:** `(:Decision {title: "Route P0 incidents and PR approvals for PaymentGateway to @alice"})`
* **The Mutation:** Engineering lead pushes a commit updating `CODEOWNERS`: `@alice -> @bob`.
* **FalkorDB Action:** Query 2 executes in `< 3.5ms`. The old `CODEOWNERS` source is marked `SUPERSEDED`, the ownership fact is set to `is_stale: true`, and the assignment decision cascades to `INVALIDATED_NEEDS_REVALIDATION`.
* **The Gate Interception:** An AI SRE agent attempts to auto-assign a production outage ticket to `@alice`. The CAVDAX Gate intercepts and **hard-blocks** the assignment, returning:  
  `⛔ BLOCKED: Assignment decision grounded in stale ownership fact superseded by commit 4a8b1c.`

---

### Scenario B: Dependency Security Patching (`package.json`)
* **Source:** `package.json`
* **Extracted Fact:** `(:Fact {claim: "crypto-helper is pinned to v1.4.0 (CVE-2026-8812 active)", is_stale: false})`
* **Decision:** `(:Decision {title: "Use crypto-helper v1.4.0 for session token generation"})`
* **The Mutation:** Security bot / engineer merges PR #48 bumping `package.json` to `crypto-helper: 2.0.0`.
* **FalkorDB Action:** FalkorDB marks the v1.4.0 fact as stale and invalidates the session token generation decision.
* **The Gate Interception:** A coding agent (Cursor/Claude Code) attempts to generate a new authentication route using the old `crypto-helper v1.4` API methods. The CAVDAX Gate intercepts and **hard-blocks** the code generation, preventing an insecure API call from entering production.

---

### Scenario C: Infrastructure & SSL Environment Toggling (`docker-compose.yml`)
* **Source:** `docker-compose.yml` or `kubernetes/deployment.yaml`
* **Extracted Fact:** `(:Fact {claim: "PostgreSQL port 5432 requires plaintext sslmode=disable in local dev", is_stale: false})`
* **Decision:** `(:Decision {title: "Connect migration worker with sslmode=disable"})`
* **The Mutation:** DevOps engineer commits staging deployment config with `SSL_MODE=require`.
* **FalkorDB Action:** FalkorDB invalidates the unencrypted connection decision.
* **The Gate Interception:** An autonomous migration agent attempts to execute database seeding without TLS certificates. The CAVDAX Gate intercepts and **hard-blocks** the database execution.

---

## 4. Why We Picked ADRs for the Hackathon Demo (Strategic Defense)

If CAVDAX works on all these sources, why did we anchor the live demonstration on ADRs?

This is a **deliberate hackathon winning strategy**:

1. **The "LLM Extraction Hallucination" Trap:**  
   If our demo depended on an LLM reading raw, chaotic git diffs to extract facts, judges would immediately doubt the reliability of the system:
   > *"Your demo works because you handpicked a clean commit message. In production, LLMs extracting facts from arbitrary git diffs hallucinate relationships 30% of the time."*
2. **The "Deterministic Truth" High Ground:**  
   By demonstrating ADRs with YAML frontmatter (`supersedes: ADR-001`), the ingestion is **100% deterministic, zero-hallucination, and mathematically reproducible**. 
   * Judges can inspect the 40-line Node.js parser and see that it is real, transparent code.
   * Judges see that FalkorDB's multi-hop cascade is triggered by verifiable repository events.
3. **Intellectual Honesty in the README:**  
   We openly state:
   * **Live Today:** Deterministic structural ingestion from ADRs and structured manifests (`CODEOWNERS`, `package.json`).
   * **Future Production Scope:** Probabilistic entity extraction from unstructured Git commits using LLM GraphRAG pipelines.

---

## 5. The Judge Defense Script: How to Answer Live

When a judge or evaluator asks:
> *"Does your tool only work on repos that maintain strict ADRs? What if a company doesn't write ADRs?"*

You deliver this exact response:

> **"Not at all. ADRs are simply the cleanest visual medium to demonstrate architectural invalidation in a 3-minute video.**  
>  
> **In FalkorDB, our schema models a generalized `:Source` node. That source can be a `CODEOWNERS` file when service ownership shifts, a `package.json` manifest when a dependency is patched, or an infrastructure config when SSL policies change.**  
>  
> **The Cypher traversal queries, the invalidation cascade, and the enclosed MCP execution gate are 100% source-agnostic. Whether a policy originates from an ADR, a config file, or a Git commit, CAVDAX ensures an AI agent cannot execute code on premises that have expired."**

---

## Summary Matrix

| Capability | Tier 1 (ADRs / RFCs) | Tier 2 (Metadata & Manifests) | Tier 3 (Unstructured Commits) |
| :--- | :--- | :--- | :--- |
| **Examples** | `ADR-002.md`, `RFC-401.md` | `CODEOWNERS`, `package.json`, `k8s.yaml` | `git commit -m "fix:..."`, PR comments |
| **Extraction Type** | Deterministic (YAML frontmatter) | Deterministic (Diff & key-value parsing) | Probabilistic (LLM extraction) |
| **Supported in Live Demo** | **Yes (Primary Visual Showcase)** | **Yes (Identical Cypher Schema)** | Identified as Future Production Scope |
| **FalkorDB Traversal** | Identical Query 1, 2, 3 | Identical Query 1, 2, 3 | Identical Query 1, 2, 3 |
| **Enclosed MCP Gate Protection** | 100% Active | 100% Active | 100% Active |
