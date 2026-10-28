import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../../../core/ingestion/parser.js';
import { SimulationEngine } from '../../mcp-server/src/simulation.js';

test("Devil's Advocate Audit: Heuristic parser does NOT invert supersession on superseded notes", () => {
  const adr001Text = [
    '# ADR-001: Legacy Monolith Architecture',
    '',
    'Status: Superseded by ADR-002',
    '',
    '> **Note:** This decision has been superseded by [ADR-002].',
    '',
    '## Context',
    'Old architectural baseline.',
    '',
    '## Decision',
    'Use monolithic database.'
  ].join('\n');

  const { frontmatter } = parseFrontmatter(adr001Text, 'docs/adrs/ADR-001.md');

  assert.equal(frontmatter.id, 'ADR-001');
  assert.equal(frontmatter.status, 'SUPERSEDED');
  assert.equal(frontmatter.superseded_by, 'ADR-002');
  // Crucial invariant: ADR-001 must NEVER declare that it supersedes ADR-002!
  assert.equal(frontmatter.supersedes, undefined, 'ADR-001 must not claim to supersede ADR-002');
});

test("Devil's Advocate Audit: Heuristic parser extracts active supersession and handles numeric filenames", () => {
  const adr002Text = [
    '# 0002. Modern Microservices Architecture',
    '',
    'Status: Accepted',
    '',
    'Supersedes: ADR-001',
    '',
    '## Decision',
    'Migrate to microservices.'
  ].join('\n');

  const { frontmatter } = parseFrontmatter(adr002Text, 'docs/adrs/0002-microservices.md');

  assert.equal(frontmatter.id, 'ADR-0002');
  assert.equal(frontmatter.status, 'ACTIVE');
  assert.equal(frontmatter.supersedes, 'ADR-001');
});

test("Devil's Advocate Audit: SimulationEngine.revalidateDecision rejects superseded source and stale facts", () => {
  const sim = new SimulationEngine();

  // Try to revalidate using an invalid or superseded source
  const failResult = sim.revalidateDecision({
    new_source_id: 'ADR-001', // ADR-001 is superseded by ADR-002 in sim data
    old_decision_id: 'DEC-102',
    new_decision_id: 'DEC-103',
    new_fact_id: 'F-Auth-v1', // F-Auth-v1 is stale
    title: 'Migrate to modern auth'
  });

  assert.equal(failResult.isError, true);
  assert.match(failResult.message, /target source 'ADR-001' is itself SUPERSEDED|target fact 'F-Auth-v1' is stale/i);
});

test("Devil's Advocate Audit: SimulationEngine.releaseLock requires matching agent_id lease", () => {
  const sim = new SimulationEngine();

  // Agent 1 acquires lock
  const acq = sim.acquireLock({
    decision_id: 'DEC-102',
    agent_id: 'agent-alice',
    ttl_ms: 10000
  });
  assert.equal(acq.acquired, true);

  // Agent 2 attempts to release Agent 1's lock
  const unauthorizedRelease = sim.releaseLock({
    decision_id: 'DEC-102',
    agent_id: 'agent-bob'
  });

  assert.equal(unauthorizedRelease.released, false);
  assert.equal(unauthorizedRelease.isError, true);
  assert.match(unauthorizedRelease.message, /held by agent 'agent-alice', not 'agent-bob'/);

  // Agent 1 legitimately releases lock
  const validRelease = sim.releaseLock({
    decision_id: 'DEC-102',
    agent_id: 'agent-alice'
  });
  assert.equal(validRelease.released, true);
});
