/**
 * CAVDAX Deterministic ADR / Git Ingestion Engine
 * Parses real Markdown files with YAML frontmatter without relying on probabilistic LLMs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cascadeInvalidation } from '../graph/queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');

/**
 * Lightweight deterministic YAML frontmatter extractor (Zero-dependency fallback)
 *
 * Supports:
 *   - Scalar values:   key: value
 *   - Quoted strings:  key: "value" or key: 'value'
 *   - Inline arrays:   key: [a, b, c]
 *   - Block sequences: key:\n  - a\n  - b   (indented list items)
 *
 * The 'supersedes' key specifically may be a scalar string OR a list.
 * Both forms are normalised to an array by ingestAdrFile before use.
 */
export function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { frontmatter: {}, body: fileContent };
  }

  const rawYaml = match[1];
  const body = fileContent.slice(match[0].length).trim();
  const frontmatter = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null; // tracks the key whose block-sequence we are collecting

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Block-sequence item (  - value) belonging to the previous key
    if (trimmed.startsWith('- ') && currentKey) {
      const item = trimmed.slice(2).trim().replace(/^['"]|['"]$/g, '');
      if (!Array.isArray(frontmatter[currentKey])) {
        // Convert existing scalar to array on first list item
        frontmatter[currentKey] = frontmatter[currentKey] ? [frontmatter[currentKey]] : [];
      }
      frontmatter[currentKey].push(item);
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      currentKey = trimmed.slice(0, colonIdx).trim();
      let value = trimmed.slice(colonIdx + 1).trim();

      // Inline array: key: [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[currentKey] = value
          .slice(1, -1)
          .split(',')
          .map(v => v.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
        continue;
      }

      // Clean surrounding quotes from scalar values
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Empty value after colon means a block-sequence follows on next lines
      frontmatter[currentKey] = value || null;
    } else {
      // Line has no colon — not a key-value pair, reset currentKey
      currentKey = null;
    }
  }

  return { frontmatter, body };
}

/**
 * Ingests an ADR file and cascades invalidation if a `supersedes` key is detected.
 */
export async function ingestAdrFile(graph, filePath) {
  console.log(`[Ingestion] Reading ADR file: ${filePath}`);
  const absolutePath = path.resolve(filePath);

  // Security Confinement: Prevent path traversal outside repository root (OWASP A01/A03)
  const allowedRoot = path.resolve(REPO_ROOT);
  if (!absolutePath.startsWith(allowedRoot + path.sep) && absolutePath !== allowedRoot) {
    throw new Error(`Security Violation: Path traversal attempt outside project workspace: ${absolutePath}`);
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`ADR file not found at path: ${absolutePath}`);
  }

  const fileContent = fs.readFileSync(absolutePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(fileContent);

  const adrId = frontmatter.id || path.basename(filePath, path.extname(filePath));

  // Normalise 'supersedes' to an array so downstream code handles both:
  //   supersedes: ADR-001          (scalar string  → ['ADR-001'])
  //   supersedes: [ADR-001, ADR-003] (inline array → ['ADR-001', 'ADR-003'])
  //   supersedes:\n  - ADR-001\n  - ADR-003  (block sequence → ['ADR-001', 'ADR-003'])
  const rawSupersedes = frontmatter.supersedes;
  const supersedesIds = rawSupersedes
    ? (Array.isArray(rawSupersedes) ? rawSupersedes : [rawSupersedes]).filter(Boolean)
    : [];

  const title = frontmatter.title || adrId;
  const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');

  console.log(`[Ingestion] ADR ID: '${adrId}', Supersedes: ${supersedesIds.length ? supersedesIds.join(', ') : 'None'}`);

  // 1. ATOMIC GRAPH INGESTION: MERGE Source node so any ADR (not just pre-seeded
  //    ones) exists in the graph before cascadeInvalidation tries to MATCH it.
  //    Without this, MATCH (newSource:Source {id: $adrId}) returns 0 rows and
  //    the entire cascade silently does nothing for novel ADRs like ADR-003.
  const mergeSourceCypher = `
    MERGE (s:Source {id: $adrId})
    ON CREATE SET
      s.ref = $ref,
      s.type = 'ADR',
      s.status = 'ACTIVE',
      s.title = $title,
      s.created_at = timestamp()
    ON MATCH SET
      s.ref = $ref,
      s.title = $title
  `;
  await graph.query(mergeSourceCypher, { params: { adrId, ref: relativePath, title } });

  // 2. OPTIONAL: If frontmatter declares a fact, MERGE Fact + EXTRACTED_FROM edge.
  if (frontmatter.fact_id && frontmatter.fact_claim) {
    const mergeFactCypher = `
      MATCH (s:Source {id: $adrId})
      MERGE (f:Fact {id: $factId})
      ON CREATE SET f.claim = $claim, f.is_stale = false, f.verified = true
      MERGE (f)-[:EXTRACTED_FROM]->(s)
    `;
    await graph.query(mergeFactCypher, {
      params: { adrId, factId: frontmatter.fact_id, claim: frontmatter.fact_claim }
    });
  }

  // 3. TRIGGER CASCADING INVALIDATION for every superseded ADR
  //    Previously only a single supersedesId was handled — now supports
  //    multi-supersedes (e.g. one ADR replacing two legacy ADRs at once).
  const invalidationResults = [];

  for (const oldSourceId of supersedesIds) {
    console.log(`[Ingestion] ⚡ Mutation: '${adrId}' supersedes '${oldSourceId}'. Triggering cascade...`);
    const result = await cascadeInvalidation(graph, adrId, oldSourceId);
    console.log(`[Ingestion] Cascade on '${oldSourceId}' complete in ${result.latency_ms}ms. Affected: ${result.affected_decisions} decision(s)`);
    invalidationResults.push({ supersedes: oldSourceId, ...result });
  }

  return {
    adr_id: adrId,
    supersedes: supersedesIds.length === 1 ? supersedesIds[0] : (supersedesIds.length > 1 ? supersedesIds : null),
    frontmatter,
    invalidation: invalidationResults.length === 1
      ? invalidationResults[0]
      : (invalidationResults.length > 1 ? invalidationResults : null)
  };
}
