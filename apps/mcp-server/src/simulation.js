/**
 * CAVDAX simulation engine (no FalkorDB required).
 *
 * Mirrors the hosted dashboard's in-memory fallback so people can try the gate
 * with `npx @cavdax/mcp-server` and no Docker. It is NOT a substitute for the
 * live graph and every response says so (`simulated: true`).
 *
 * Seeded state = the dashboard's Act II outcome:
 *   ADR-002 (ACTIVE) supersedes ADR-001  ->  F-Auth-v1 stale  ->  DEC-102 invalidated
 * Anything not in this in-memory graph is rejected (fail-closed), so a made-up
 * decision id can never be approved.
 */

import fs from 'fs';
import path from 'path';

const SIM_NOTE =
  'SIMULATED: FalkorDB is not connected, so this verdict comes from an in-memory demo graph, not your repo. ' +
  'Start FalkorDB and run "npx cavdax ingest" for real enforcement.';

export class SimulationEngine {
  constructor({ repoRoot }) {
    this.repoRoot = path.resolve(repoRoot);
    this.decisions = new Map([
      ['DEC-102', { title: 'Generate Checkout Service with TokenAuth v1', status: 'INVALIDATED_NEEDS_REVALIDATION', fact: 'F-Auth-v1' }]
    ]);
    this.nodes = [
      { id: 'ADR-001', label: 'Source', status: 'SUPERSEDED' },
      { id: 'ADR-002', label: 'Source', status: 'ACTIVE' },
      { id: 'F-Auth-v1', label: 'Fact', is_stale: true },
      { id: 'F-OAuth2', label: 'Fact', is_stale: false },
      { id: 'DEC-102', label: 'Decision', status: 'INVALIDATED_NEEDS_REVALIDATION' }
    ];
    this.edges = [
      { source: 'ADR-002', target: 'ADR-001', type: 'SUPERSEDES' },
      { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
      { source: 'F-OAuth2', target: 'ADR-002', type: 'EXTRACTED_FROM' },
      { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' }
    ];
  }

  applyCodeChange({ decision_id, file_path, code_payload }) {
    const base = { simulated: true, simulated_warning: SIM_NOTE, decision_id };
    const decision = this.decisions.get(decision_id);

    if (!decision) {
      return {
        ...base,
        isError: true,
        gate_verdict: 'BLOCKED_DECISION_NOT_FOUND',
        violation_paths: [],
        message: `CAVDAX GATE BLOCKED (SIMULATION): Decision '${decision_id}' does not exist. No file was written.`
      };
    }

    if (decision.status === 'INVALIDATED_NEEDS_REVALIDATION') {
      return {
        ...base,
        isError: true,
        gate_verdict: 'BLOCKED_SUPERSEDED_SOURCE',
        violation_paths: [[`Decision:${decision_id}`, `Fact:${decision.fact}`, 'Source:ADR-001 (SUPERSEDED by ADR-002)']],
        message: `CAVDAX GATE BLOCKED (SIMULATION): '${decision_id}' is grounded in superseded source ADR-001. No file was written.`,
        instructions_for_agent: "Call 'revalidate_decision' (new_source_id ADR-002, new_fact_id F-OAuth2) and re-submit with the new decision id."
      };
    }

    if (decision.status !== 'VALID') {
      return {
        ...base,
        isError: true,
        gate_verdict: 'BLOCKED_DECISION_INVALIDATED',
        violation_paths: [],
        message: `CAVDAX GATE BLOCKED (SIMULATION): '${decision_id}' has status ${decision.status}. No file was written.`
      };
    }

    const root = this.repoRoot;
    const target = path.resolve(root, file_path);
    if (!target.startsWith(root + path.sep)) {
      return {
        ...base,
        isError: true,
        gate_verdict: 'BLOCKED_PATH_TRAVERSAL',
        message: 'Access denied: target file path must reside within the repository root.'
      };
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, code_payload, 'utf-8');

    return {
      ...base,
      isError: false,
      gate_verdict: 'APPROVED',
      file_path: target,
      message: `CAVDAX GATE APPROVED (SIMULATION): '${decision_id}' is valid. File written to ${target}.`
    };
  }

  revalidateDecision({ new_source_id, old_decision_id, new_decision_id, new_fact_id, title }) {
    const base = { simulated: true, simulated_warning: SIM_NOTE };
    const old = this.decisions.get(old_decision_id);
    if (!old) {
      return { ...base, isError: true, message: `Cannot revalidate: old decision '${old_decision_id}' does not exist.` };
    }
    old.status = 'REPLACED_ARCHIVED';
    this.decisions.set(new_decision_id, { title, status: 'VALID', fact: new_fact_id });
    this.nodes.push({ id: new_decision_id, label: 'Decision', title, status: 'VALID' });
    this.edges.push(
      { source: new_decision_id, target: new_fact_id, type: 'DEPENDS_ON' },
      { source: new_decision_id, target: old_decision_id, type: 'REPLACES' }
    );
    return {
      ...base,
      isError: false,
      message: `REVALIDATION COMPLETE (SIMULATION): '${new_decision_id}' is ACTIVE (grounded in '${new_fact_id}' from '${new_source_id}') and replaces '${old_decision_id}'.`,
      result: { active_decision_id: new_decision_id, archived_decision_id: old_decision_id }
    };
  }

  queryGraph({ node_id } = {}) {
    const nodes = node_id ? this.nodes.filter((n) => n.id === node_id) : this.nodes;
    if (node_id && nodes.length === 0) {
      return { isError: true, message: `Node '${node_id}' not found in the simulated graph.` };
    }
    const edges = node_id ? this.edges.filter((e) => e.source === node_id || e.target === node_id) : this.edges;
    return { simulated: true, simulated_warning: SIM_NOTE, nodes, edges };
  }
}
