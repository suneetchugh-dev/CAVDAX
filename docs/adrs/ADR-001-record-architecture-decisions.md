---
id: ADR-001
title: Use FalkorDB as the data store for suneetchugh-dev/CAVDAX
status: ACCEPTED
date: 2026-10-27
fact_id: F-FalkorDB
fact_claim: suneetchugh-dev/CAVDAX uses FalkorDB as the primary data store
decision_id: DEC-001
decision_title: Build suneetchugh-dev/CAVDAX on FalkorDB
---
# ADR-001: Use FalkorDB as the data store for suneetchugh-dev/CAVDAX

## Context
CAVDAX read `.env.example`, `package.json`, `apps/client/package.json`, `docker-compose.yml`, `apps/server/package.json` and `apps/mcp-server/package.json` in suneetchugh-dev/CAVDAX (Node.js). `docker-compose.yml` runs FalkorDB as a service; `apps/server/package.json` and `apps/mcp-server/package.json` depend on FalkorDB, alongside Express and React.
This record captures that existing choice so engineers and AI coding agents work against it.

## Decision
suneetchugh-dev/CAVDAX uses **FalkorDB** as its data store. New code follows this choice unless a later ADR supersedes it.

## Consequences
- Agents and engineers scaffold new code against FalkorDB.
- To change this, add a new ADR with `supersedes: ADR-001`. CAVDAX then marks this decision for revalidation.
- This ADR was generated from the files listed above, not from the reasoning behind the choice. Edit it to match your intent before merging.
