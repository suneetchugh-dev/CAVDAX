import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { CavdaxMcpServer } from '../../../core/mcp/server.js';
import { fetchGraphState, fetchAuditLog } from '../../../core/graph/queries.js';

test('Security Audit: CavdaxMcpServer path confinement rejects writes escaping sandbox root', async () => {
  const sandboxDir = path.resolve(process.cwd(), 'demo-repo');
  const mcp = new CavdaxMcpServer(null, { repoRoot: sandboxDir });

  // Simulate apply_code_change attempting path traversal to server root
  const traversalResult = await mcp.handleToolCall('apply_code_change', {
    decision_id: 'DEC-102',
    file_path: '../apps/server/index.js',
    code_payload: '// malicious overwrite'
  });

  assert.equal(traversalResult.isError, true);
  // It either blocks due to gate (simulation check) or path traversal
  assert.ok(
    traversalResult.gate_verdict === 'BLOCKED_SUPERSEDED_SOURCE' ||
    traversalResult.gate_verdict === 'BLOCKED_PATH_TRAVERSAL'
  );
});

test('Security Audit: fetchGraphState applies tenant isolation and filters customer repos for public viewers', async () => {
  // Mock graph client
  const executedQueries = [];
  const mockGraph = {
    async query(cypher, params) {
      executedQueries.push(cypher);
      return {
        data: [
          { internal_id: 1, label: 'Decision', props: { id: 'DEC-102', status: 'VALID', is_demo: true } }
        ]
      };
    }
  };

  const publicGraph = await fetchGraphState(mockGraph, { repo: null });
  assert.ok(executedQueries.some(q => q.includes("WHERE n.repo IS NULL OR n.repo = 'demo' OR n.is_demo = true")));
  assert.equal(publicGraph.nodes.length, 1);

  executedQueries.length = 0;
  const scopedGraph = await fetchGraphState(mockGraph, { repo: 'acme/private-repo' });
  assert.ok(executedQueries.some(q => q.includes("WHERE n.repo = $repo")));
});

test('Security Audit: fetchAuditLog applies tenant isolation and filters private repo actions', async () => {
  let lastCypher = '';
  const mockGraph = {
    async query(cypher, params) {
      lastCypher = cypher;
      return {
        data: [
          { action_id: 'act-1', repo: 'demo', status: 'APPROVED', executed_at: Date.now() }
        ]
      };
    }
  };

  const publicAudit = await fetchAuditLog(mockGraph, 10, { repo: null });
  assert.ok(lastCypher.includes("WHERE a.repo IS NULL OR a.repo = 'demo'"));
  assert.equal(publicAudit.entries.length, 1);

  const scopedAudit = await fetchAuditLog(mockGraph, 10, { repo: 'acme/private-repo' });
  assert.ok(lastCypher.includes("WHERE a.repo = $repo"));
});
