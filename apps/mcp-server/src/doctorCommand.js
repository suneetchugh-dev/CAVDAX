/**
 * CAVDAX Doctor Command
 *
 * npx cavdax doctor
 *
 *   1. Node.js version (>= 18)
 *   2. Docker availability (informational)
 *   3. FalkorDB connectivity + graph health, using the same client path as the MCP server
 *   4. Engine bundle present (core/graph, core/mcp, core/ingestion)
 *   5. MCP server module loads and exposes its tools
 *
 * FalkorDB being down is reported as a failure (exit 1) because real enforcement
 * needs it, but the message states that the MCP server still starts in SIMULATION mode.
 */

import { execSync } from 'child_process';
import { connectGraph, closeQuietly, describeConnectError, falkorConfig, loadCore } from './runtime.js';

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️ ';

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  if (major >= 18) {
    console.log(`${PASS} Node.js version: ${version} (>= 18 required)`);
    return true;
  }
  console.error(`${FAIL} Node.js version: ${version} — upgrade to >= 18.0.0`);
  return false;
}

async function checkFalkorConnection() {
  const cfg = falkorConfig();
  let client;
  try {
    const conn = await connectGraph();
    client = conn.client;
    const result = await conn.graph.query('MATCH (n) RETURN count(n) AS count');
    const count = result.data?.[0]?.count ?? 0;
    console.log(`${PASS} FalkorDB connected at ${cfg.host}:${cfg.port}`);
    console.log(`${PASS} Graph '${cfg.graphName}' query OK: ${count} node(s)${count === 0 ? ' (run "npx cavdax ingest" in your repo)' : ''}`);
    return true;
  } catch (err) {
    console.error(`${FAIL} ${describeConnectError(err, cfg)}`);
    console.error(`   Tip: docker run -d -p 6379:6379 falkordb/falkordb:latest`);
    console.error(`   Until then the MCP server runs in SIMULATION mode (in-memory demo graph, not your repo).`);
    return false;
  } finally {
    await closeQuietly(client);
  }
}

async function checkEngine() {
  try {
    await Promise.all([loadCore('graph/queries.js'), loadCore('mcp/server.js'), loadCore('ingestion/parser.js'), loadCore('ingestion/sources.js')]);
    console.log(`${PASS} CAVDAX engine modules found (graph, mcp, ingestion)`);
    return true;
  } catch (err) {
    console.error(`${FAIL} ${err.message}`);
    return false;
  }
}

async function checkMcpReadiness() {
  try {
    const mod = await import('./stdioServer.js');
    if (typeof mod.startStdioServer !== 'function' || !Array.isArray(mod.TOOLS) || mod.TOOLS.length === 0) {
      throw new Error('stdio server does not export startStdioServer/TOOLS');
    }
    console.log(`${PASS} MCP stdio server loads (${mod.TOOLS.length} tools: ${mod.TOOLS.map((t) => t.name).join(', ')})`);
    return true;
  } catch (err) {
    console.error(`${FAIL} MCP stdio server failed to load: ${err.message}`);
    return false;
  }
}

function checkDockerAvailability() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log(`${PASS} Docker is available (needed to run FalkorDB locally)`);
  } catch {
    console.warn(`${WARN} Docker not found — install Docker to run FalkorDB locally`);
  }
}

export async function runDoctor() {
  const cfg = falkorConfig();

  console.log('\n🩺 CAVDAX Doctor — running diagnostics\n');
  console.log(`   FalkorDB target: ${cfg.host}:${cfg.port}  graph: ${cfg.graphName}`);
  console.log(`   Node.js: ${process.version}`);
  console.log('');

  const results = [];
  results.push(checkNodeVersion());
  checkDockerAvailability();
  results.push(await checkFalkorConnection());
  results.push(await checkEngine());
  results.push(await checkMcpReadiness());

  console.log('');
  if (results.every(Boolean)) {
    console.log('✅ All checks passed — CAVDAX is ready for live enforcement!\n');
  } else {
    console.error('⛔ Some checks failed — resolve the issues above for live enforcement.\n');
    process.exit(1);
  }
}
