import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGraphToSvg, computeBlastRadius } from '../../../core/graph/renderSvg.js';
import { isAdrPath } from '../../../core/ingestion/adrPaths.js';
import { CavdaxMcpServer } from '../../../core/mcp/server.js';
import { CavdaxStdioGateway } from '../../mcp-server/src/stdioServer.js';

test('isAdrPath accepts root and docs/ root ADR formats', () => {
  assert.equal(isAdrPath('ADR-001.md'), true);
  assert.equal(isAdrPath('docs/ADR-001.md'), true);
  assert.equal(isAdrPath('0001-setup.md'), true);
  assert.equal(isAdrPath('design/adr/0001.md'), true);
  assert.equal(isAdrPath('wiki/adrs/0001.md'), true);
  assert.equal(isAdrPath('README.md'), false);
  assert.equal(isAdrPath('docs/guide.md'), false);
});

test('computeBlastRadius correctly traverses downstream causal reachability', () => {
  const nodes = [
    { id: 'ADR-001', label: 'Source' },
    { id: 'F-Auth-v1', label: 'Fact' },
    { id: 'DEC-102', label: 'Decision' },
    { id: 'act-001', label: 'AgentAction', target_file: 'src/payment.js' },
    { id: 'ADR-002', label: 'Source' }
  ];

  const edges = [
    { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
    { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' },
    { source: 'act-001', target: 'DEC-102', type: 'GROUNDED_IN' },
    { source: 'ADR-002', target: 'ADR-001', type: 'SUPERSEDES' }
  ];

  const { blastNodeIds, summary } = computeBlastRadius(nodes, edges, 'ADR-001');

  assert.equal(blastNodeIds.has('F-Auth-v1'), true);
  assert.equal(blastNodeIds.has('DEC-102'), true);
  assert.equal(blastNodeIds.has('act-001'), true);
  assert.equal(summary.facts, 1);
  assert.equal(summary.decisions, 1);
  assert.equal(summary.actions, 1);
  assert.deepEqual(summary.files, ['src/payment.js']);
});

test('renderGraphToSvg generates valid, standalone SVG with blast radius annotation', () => {
  const nodes = [
    { id: 'ADR-001', label: 'Source', status: 'SUPERSEDED' },
    { id: 'F-Auth-v1', label: 'Fact', is_stale: true },
    { id: 'DEC-102', label: 'Decision', status: 'INVALIDATED_NEEDS_REVALIDATION' }
  ];

  const edges = [
    { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
    { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' }
  ];

  const svg = renderGraphToSvg({ nodes, edges }, {
    nodeId: 'ADR-001',
    highlightBlastRadius: true,
    isDarkTheme: true
  });

  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svg.includes('WHAT-IF BLAST RADIUS'));
  assert.ok(svg.includes('ADR-001'));
  assert.ok(svg.includes('DEC-102'));
  assert.ok(svg.includes('</svg>'));
});

test('CavdaxMcpServer executes export_graph_image tool', async () => {
  const mcp = new CavdaxMcpServer(null);
  const result = await mcp.handleToolCall('export_graph_image', {
    node_id: 'DEC-102',
    highlight_blast_radius: true,
    format: 'svg'
  });

  assert.equal(result.format, 'svg');
  assert.ok(typeof result.svg === 'string');
  assert.ok(result.svg.includes('<svg'));
});

test('CavdaxStdioGateway executes export_graph_image tool in simulation mode', async () => {
  const gateway = new CavdaxStdioGateway({ mode: 'simulation' });
  const result = await gateway.callTool('export_graph_image', {
    node_id: 'ADR-001',
    highlight_blast_radius: true
  });

  assert.equal(result.isError, undefined);
  const parsed = JSON.parse(result.content[0].text);
  assert.equal(parsed.mode, 'simulation');
  assert.ok(parsed.svg.includes('<svg'));
});
