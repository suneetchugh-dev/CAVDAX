/**
 * Shared runtime helpers for every CAVDAX CLI command and the stdio MCP server.
 *
 *  - loadCore(): resolves the graph / ingestion / mcp engine modules whether the
 *    package runs from the published tarball (./core is bundled by `prepack`)
 *    or from inside the monorepo (../../../core).
 *  - connectGraph(): ONE place that knows how to talk to FalkorDB, so doctor,
 *    ingest, check and the MCP server can never disagree about the client API,
 *    graph name or timeouts again.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';

export const DEFAULT_GRAPH_NAME = 'cavdax_core_graph';

export function falkorConfig(overrides = {}) {
  return {
    host: overrides.host || process.env.FALKORDB_HOST || 'localhost',
    port: parseInt(overrides.port || process.env.FALKORDB_PORT || '6379', 10),
    password: process.env.FALKORDB_PASSWORD || undefined,
    graphName: process.env.FALKORDB_GRAPH_NAME || DEFAULT_GRAPH_NAME
  };
}

export async function loadCore(relativePath) {
  const candidates = [
    new URL(`../core/${relativePath}`, import.meta.url), // published tarball
    new URL(`../../../core/${relativePath}`, import.meta.url) // monorepo checkout
  ];
  for (const url of candidates) {
    if (fs.existsSync(fileURLToPath(url))) return import(url.href);
  }
  throw new Error(`CAVDAX engine module not found: core/${relativePath}`);
}

/**
 * Connects to FalkorDB. Rejects (never hangs, never retries forever) when the
 * server is unreachable so callers can report a precise error.
 */
export async function connectGraph(overrides = {}) {
  const cfg = falkorConfig(overrides);
  const { FalkorDB } = await import('falkordb');

  const client = await FalkorDB.connect({
    socket: {
      host: cfg.host,
      port: cfg.port,
      connectTimeout: 3000,
      reconnectStrategy: false
    },
    ...(cfg.password ? { password: cfg.password } : {})
  });

  return { client, graph: client.selectGraph(cfg.graphName), ...cfg };
}

export async function closeQuietly(client) {
  if (!client) return;
  try {
    await client.close();
  } catch {
    /* already closed */
  }
}

export function describeConnectError(err, cfg) {
  const detail = err?.message || err?.errors?.map((e) => e.message).join('; ') || err?.code || 'connection refused';
  return `FalkorDB unreachable at ${cfg.host}:${cfg.port} (${detail})`;
}
