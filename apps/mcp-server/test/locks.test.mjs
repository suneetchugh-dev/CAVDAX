/**
 * Regression test: the holder of a decision lock must be able to identify itself.
 *
 * Bug (1.2.0 draft): apply_code_change and check_intent_clearance did not declare `agent_id`
 * in their tool schemas, so an agent following the schema could not prove it owned the lock
 * and was blocked by its own lock.
 *
 * Runs in simulation mode: no FalkorDB, no extra dependencies.
 *   node --test apps/mcp-server/test/locks.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CavdaxStdioGateway, TOOLS } from '../src/stdioServer.js';

const tool = (name) => TOOLS.find((t) => t.name === name);

test('apply_code_change and check_intent_clearance declare an optional agent_id', () => {
  for (const name of ['apply_code_change', 'check_intent_clearance']) {
    const schema = tool(name).inputSchema;
    assert.equal(schema.properties.agent_id?.type, 'string', `${name} must declare agent_id`);
    assert.ok(!schema.required.includes('agent_id'), `${name}: agent_id must stay optional`);
  }
});

test('lock holder is not blocked by its own lock; everyone else is', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cavdax-lock-'));
  try {
    const gateway = new CavdaxStdioGateway({ repoRoot: root, mode: 'simulation' });
    const call = async (name, args) => JSON.parse((await gateway.callTool(name, args)).content[0].text);

    // A valid decision to lock (the built-in demo graph only ships a stale one).
    await call('revalidate_decision', {
      new_source_id: 'ADR-002',
      old_decision_id: 'DEC-102',
      new_decision_id: 'DEC-103',
      new_fact_id: 'F-OAuth2',
      title: 'OAuth2'
    });

    const lock = await call('acquire_decision_lock', { decision_id: 'DEC-103', agent_id: 'agent-A' });
    assert.equal(lock.acquired, true);

    const own = await call('check_intent_clearance', { decision_id: 'DEC-103', agent_id: 'agent-A' });
    assert.notEqual(own.gate_verdict, 'BLOCKED_CONCURRENT_AGENT_LOCK', 'holder must not be blocked by its own lock');
    assert.equal(own.clearance_granted, true);

    const other = await call('check_intent_clearance', { decision_id: 'DEC-103', agent_id: 'agent-B' });
    assert.equal(other.gate_verdict, 'BLOCKED_CONCURRENT_AGENT_LOCK');

    const anonymous = await call('check_intent_clearance', { decision_id: 'DEC-103' });
    assert.equal(anonymous.gate_verdict, 'BLOCKED_CONCURRENT_AGENT_LOCK');

    await call('release_decision_lock', { decision_id: 'DEC-103', agent_id: 'agent-A' });
    const afterRelease = await call('check_intent_clearance', { decision_id: 'DEC-103', agent_id: 'agent-B' });
    assert.equal(afterRelease.clearance_granted, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
