/**
 * CAVDAX Deterministic ADR / Git Ingestion Engine
 * Parses real Markdown files with YAML frontmatter without relying on probabilistic LLMs.
 */

import fs from 'fs';
import path from 'path';
import { cascadeInvalidation } from '../graph/queries.js';

/**
 * Lightweight deterministic YAML frontmatter extractor (Zero-dependency fallback)
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
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      let value = trimmed.slice(colonIdx + 1).trim();

      // Clean quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
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

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`ADR file not found at path: ${absolutePath}`);
  }

  const fileContent = fs.readFileSync(absolutePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(fileContent);

  const adrId = frontmatter.id || path.basename(filePath, path.extname(filePath));
  const supersedesId = frontmatter.supersedes;
  const title = frontmatter.title || adrId;
  const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');

  console.log(`[Ingestion] Ingested ADR ID: '${adrId}', Supersedes: '${supersedesId || 'None'}'`);

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

  // 3. TRIGGER CASCADING INVALIDATION (Source node is now guaranteed to exist)
  let invalidationResult = null;

  if (supersedesId) {
    console.log(`[Ingestion] ⚡ Mutation detected! '${adrId}' supersedes '${supersedesId}'. Triggering Query 2 cascade...`);
    invalidationResult = await cascadeInvalidation(graph, adrId, supersedesId);
    console.log(`[Ingestion] Cascade complete in ${invalidationResult.latency_ms}ms. Affected decisions: ${invalidationResult.affected_decisions}`);
  }

  return {
    adr_id: adrId,
    supersedes: supersedesId || null,
    frontmatter,
    invalidation: invalidationResult
  };
}
