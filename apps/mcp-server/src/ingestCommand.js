/**
 * CAVDAX Ingest Command
 *
 * npx cavdax ingest [--repo <path>] [--host <host>] [--port <port>]
 *
 * Scans a repository for Architecture Decision Records (ADRs) in standard
 * locations (.adr/, docs/adr/, docs/adrs/) and ingests them into FalkorDB.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Discovers all .md files in common ADR directories within the given repo root.
 * @param {string} repoRoot - Absolute path to the repository root.
 * @returns {string[]} List of absolute ADR file paths.
 */
async function discoverAdrFiles(repoRoot) {
  const patterns = [
    '.adr/**/*.md',
    'docs/adr/**/*.md',
    'docs/adrs/**/*.md',
    'architecture/**/*.md'
  ];

  const found = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: repoRoot, absolute: true });
    found.push(...matches);
  }

  return [...new Set(found)]; // deduplicate
}

/**
 * Attempts to connect to FalkorDB and run the ingest pipeline.
 * Falls back to a dry-run summary if FalkorDB is unavailable.
 */
export async function runIngest(options) {
  const repoRoot = path.resolve(options.repo);
  const host = options.host;
  const port = parseInt(options.port, 10);

  console.log(`\n🔍 CAVDAX Ingest — scanning: ${repoRoot}`);
  console.log(`   FalkorDB: ${host}:${port}\n`);

  if (!fs.existsSync(repoRoot)) {
    console.error(`❌ Repository path does not exist: ${repoRoot}`);
    process.exit(1);
  }

  const adrFiles = await discoverAdrFiles(repoRoot);

  if (adrFiles.length === 0) {
    console.warn('⚠️  No ADR files found in .adr/, docs/adr/, or docs/adrs/');
    console.warn('   Create Markdown files in one of those directories and re-run.');
    return;
  }

  console.log(`📄 Found ${adrFiles.length} ADR file(s):`);
  for (const f of adrFiles) {
    console.log(`   • ${path.relative(repoRoot, f)}`);
  }

  // Attempt live FalkorDB ingestion
  let graph = null;
  try {
    const { createClient } = await import('falkordb');
    const client = createClient({ socket: { host, port } });
    await client.connect();
    graph = client.graph('CAVDAX');
    console.log('\n✅ Connected to FalkorDB');
  } catch {
    console.warn('\n⚠️  FalkorDB unavailable — running in dry-run mode (no data written)');
  }

  let ingested = 0;
  for (const filePath of adrFiles) {
    try {
      if (graph) {
        // Attempt to use the core ingest parser if available in a monorepo context
        const { ingestAdrFile } = await import(
          new URL('../../../core/ingestion/parser.js', import.meta.url).href
        ).catch(() => ({ ingestAdrFile: null }));

        if (ingestAdrFile) {
          await ingestAdrFile(graph, filePath);
        } else {
          // Minimal inline ingestion: create a Source node from the file name
          const adrId = path.basename(filePath, '.md').toUpperCase();
          const title = adrId;
          await graph.query(
            `MERGE (s:Source {id: $id}) SET s.title = $title, s.status = 'ACTIVE', s.type = 'ADR'`,
            { params: { id: adrId, title } }
          );
        }
        console.log(`   ✅ Ingested: ${path.relative(repoRoot, filePath)}`);
      } else {
        console.log(`   📋 Dry-run: ${path.relative(repoRoot, filePath)}`);
      }
      ingested++;
    } catch (err) {
      console.error(`   ❌ Failed to ingest ${path.relative(repoRoot, filePath)}: ${err.message}`);
    }
  }

  console.log(`\n🏁 Ingest complete: ${ingested}/${adrFiles.length} file(s) processed.`);
}
