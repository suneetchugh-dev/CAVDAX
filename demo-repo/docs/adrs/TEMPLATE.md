---
# ─────────────────────────────────────────────────────────────────────────────
# CAVDAX ADR FRONTMATTER — COMPLETE FIELD REFERENCE
# ─────────────────────────────────────────────────────────────────────────────
#
# REQUIRED FIELDS
# ───────────────
id: ADR-XXX
# ^ Unique identifier for this ADR. Must match the filename prefix.
#   Used as the primary key of the Source node in FalkorDB.
#   Format: ADR-<number> (e.g. ADR-001, ADR-042)

title: "Short imperative title describing the decision"
# ^ Human-readable title stored on the Source node.
#   Keep under 80 characters. Use imperative mood: "Adopt X", "Migrate to Y".

status: ACCEPTED
# ^ Lifecycle status. CAVDAX uses this for display only — graph status is
#   managed internally. Allowed values: PROPOSED | ACCEPTED | DEPRECATED

date: 2026-01-01
# ^ ISO 8601 date when this ADR was accepted.

author: team-or-person-slug
# ^ Author identifier (GitHub username, team slug, or email).

# ─────────────────────────────────────────────────────────────────────────────
# CAVDAX GRAPH FIELDS (optional but strongly recommended)
# ─────────────────────────────────────────────────────────────────────────────

fact_id: F-UNIQUE-SLUG
# ^ ID for the Fact node extracted from this ADR.
#   CAVDAX creates a (:Fact {id: fact_id})-[:EXTRACTED_FROM]->(:Source {id}) edge.
#   Use a stable slug: F-<topic> (e.g. F-Auth-v1, F-OAuth2, F-mTLS-PKCE)
#   Omit if this ADR does not introduce a new verifiable fact.

fact_claim: "Atomic, present-tense statement of what this ADR establishes"
# ^ The claim stored on the Fact node. Must be:
#   - A single atomic statement (no conjunctions)
#   - Present tense: "Service X requires Y" not "We decided to use Y"
#   - Specific enough to be verifiable: avoid vague language
#   Required if fact_id is set.

# SUPERSEDES — single value (scalar):
supersedes: ADR-XXX
# ^ ID of the ADR this one replaces. CAVDAX will:
#   1. Create a [:SUPERSEDES] edge from this Source to the old Source
#   2. Mark the old Source status = 'SUPERSEDED'
#   3. Mark all Facts extracted from the old Source as is_stale = true
#   4. Mark all Decisions depending on those Facts as INVALIDATED_NEEDS_REVALIDATION
#
# SUPERSEDES — multiple values (block sequence):
# supersedes:
#   - ADR-001
#   - ADR-003
# ^ Use this form when one ADR replaces multiple prior ADRs simultaneously.
#   CAVDAX cascades invalidation for each entry in a single GraphBLAS pass.

# ─────────────────────────────────────────────────────────────────────────────
# EXAMPLE — Fully populated ADR frontmatter
# ─────────────────────────────────────────────────────────────────────────────
# ---
# id: ADR-005
# title: Migrate Payment Ledger from MongoDB to PostgreSQL
# status: ACCEPTED
# date: 2026-09-10
# author: data-platform-team
# fact_id: F-PostgreSQL-Ledger
# fact_claim: Payment ledger records must be stored in PostgreSQL with ACID isolation
# supersedes: ADR-003
# ---
---

# ADR-XXX: [Title]

## Context
<!-- Why does this decision need to be made? What forces are at play? -->

## Decision
<!-- What is the decision? Be specific. -->

## Consequences
<!-- What are the positive and negative consequences of this decision? -->
<!-- What does CAVDAX need to know? Which decisions or code paths does this affect? -->
