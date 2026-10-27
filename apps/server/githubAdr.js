/**
 * GitHub ADR scan + "Initialize ADR" pull request.
 *
 * Everything here talks to the GitHub REST API with the signed-in user's OAuth token.
 * It never writes to the default branch: the only write is a new branch + one file + a pull
 * request, so the repository owner stays in control and merges (or closes) it on GitHub.
 */
import { parseFrontmatter } from '../../core/ingestion/parser.js';
import { isAdrPath } from '../../core/ingestion/adrPaths.js';

const GH_API = 'https://api.github.com';
const MAX_ADR_FILES = 50;
const MAX_ADR_BYTES = 100 * 1024;
const FETCH_BATCH = 10;

export const NEW_ADR_PATH = 'docs/adrs/ADR-001-record-architecture-decisions.md';
const BASE_BRANCH_NAME = 'cavdax/init-adr';

export class GithubAdrError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const NAME_RE = /^[A-Za-z0-9_.-]{1,100}$/;
export function assertRepoName(owner, repo) {
  const ok = [owner, repo].every((s) => typeof s === 'string' && NAME_RE.test(s) && s !== '.' && s !== '..');
  if (!ok) throw new GithubAdrError(400, 'INVALID_REPO', 'Invalid repository name.');
}

async function gh(fetchImpl, token, method, urlPath, body, accept = 'application/vnd.github+json') {
  const res = await fetchImpl(`${GH_API}${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'cavdax',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.ok) {
    return accept.includes('raw') ? res.text() : res.json();
  }
  if (res.status === 401) throw new GithubAdrError(401, 'AUTH_EXPIRED', 'GitHub session expired. Sign in again.');
  if (res.status === 404) throw new GithubAdrError(404, 'NOT_FOUND', 'Repository not found or not accessible with this GitHub account.');
  if (res.status === 403) throw new GithubAdrError(403, 'FORBIDDEN', 'GitHub denied this request. Check repository access and write permission.');
  if (res.status === 409) throw new GithubAdrError(409, 'REPO_EMPTY', 'The repository has no commits yet.');
  if (res.status === 422) throw new GithubAdrError(422, 'UNPROCESSABLE', 'GitHub rejected the request.');
  throw new GithubAdrError(502, 'GITHUB_ERROR', `GitHub returned ${res.status}.`);
}

const enc = (s) => s.split('/').map(encodeURIComponent).join('/');

/**
 * Builds the causal graph the console renders, from parsed ADR frontmatter.
 * Mirrors the engine's cascade: an ADR that supersedes another marks it SUPERSEDED, its facts
 * stale, and the decisions that depend on those facts INVALIDATED_NEEDS_REVALIDATION.
 */
export function buildGraphFromAdrs(adrs) {
  const edges = [];
  const sources = new Map();
  const facts = new Map();
  const decisions = new Map();

  for (const adr of adrs) {
    sources.set(adr.id, { id: adr.id, label: 'Source', title: `${adr.id}: ${adr.title}`, status: 'ACTIVE', file: adr.path });
    if (adr.fact_id && adr.fact_claim) {
      facts.set(adr.fact_id, { id: adr.fact_id, label: 'Fact', title: adr.fact_claim, status: 'VALID', is_stale: false, from: adr.id });
      edges.push({ source: adr.fact_id, target: adr.id, type: 'EXTRACTED_FROM' });
    }
  }

  for (const adr of adrs) {
    if (adr.decision_id && adr.fact_id && facts.has(adr.fact_id)) {
      decisions.set(adr.decision_id, { id: adr.decision_id, label: 'Decision', title: adr.decision_title || adr.decision_id, status: 'VALID', on: adr.fact_id });
      edges.push({ source: adr.decision_id, target: adr.fact_id, type: 'DEPENDS_ON' });
    }
  }

  for (const adr of adrs) {
    for (const oldId of adr.supersedes) {
      const old = sources.get(oldId);
      if (!old || oldId === adr.id) continue;
      old.status = 'SUPERSEDED';
      edges.push({ source: adr.id, target: oldId, type: 'SUPERSEDES' });
      for (const f of facts.values()) {
        if (f.from !== oldId) continue;
        f.is_stale = true;
        for (const d of decisions.values()) {
          if (d.on === f.id) d.status = 'INVALIDATED_NEEDS_REVALIDATION';
        }
      }
    }
  }

  const nodes = [...sources.values(), ...facts.values(), ...decisions.values()].map(({ from, on, ...clean }) => clean);
  return { nodes, edges };
}

function toArray(v) {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).filter(Boolean).map(String);
}

/** Lists the ADRs on the repository's default branch and parses them. */
export async function scanRepoAdrs({ token, owner, repo, fetchImpl = fetch }) {
  assertRepoName(owner, repo);
  const meta = await gh(fetchImpl, token, 'GET', `/repos/${owner}/${repo}`);
  const branch = meta.default_branch;
  const tree = await gh(fetchImpl, token, 'GET', `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`);

  const adrFiles = (tree.tree || [])
    .filter((e) => e.type === 'blob' && isAdrPath(e.path))
    .sort((a, b) => a.path.localeCompare(b.path));
  const capped = adrFiles.length > MAX_ADR_FILES;
  const selected = adrFiles.slice(0, MAX_ADR_FILES);

  const parsed = [];
  for (let i = 0; i < selected.length; i += FETCH_BATCH) {
    const batch = selected.slice(i, i + FETCH_BATCH);
    const results = await Promise.all(batch.map(async (entry) => {
      if (entry.size > MAX_ADR_BYTES) return null;
      const text = await gh(fetchImpl, token, 'GET',
        `/repos/${owner}/${repo}/contents/${enc(entry.path)}?ref=${encodeURIComponent(branch)}`,
        null, 'application/vnd.github.raw+json');
      const { frontmatter } = parseFrontmatter(text, entry.path);
      const base = entry.path.slice(entry.path.lastIndexOf('/') + 1).replace(/\.md$/i, '');
      const id = String(frontmatter.id || base);
      return {
        path: entry.path,
        id,
        title: String(frontmatter.title || id),
        status: frontmatter.status || null,
        supersedes: toArray(frontmatter.supersedes),
        fact_id: frontmatter.fact_id || null,
        fact_claim: frontmatter.fact_claim || null,
        decision_id: frontmatter.decision_id || null,
        decision_title: frontmatter.decision_title || null
      };
    }));
    parsed.push(...results.filter(Boolean));
  }

  return {
    repo: `${owner}/${repo}`,
    branch,
    count: parsed.length,
    truncated: Boolean(tree.truncated) || capped,
    adrs: parsed.map(({ path: p, id, title, status, supersedes }) => ({ path: p, id, title, status, supersedes })),
    graph: buildGraphFromAdrs(parsed)
  };
}

/** The starter ADR committed by the pull request. Parseable by the CAVDAX ingestion engine. */
export function buildStarterAdr(date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  return `---
id: ADR-001
title: Record architecture decisions
status: ACCEPTED
date: ${day}
fact_id: F-001
fact_claim: Architecture decisions for this repository are recorded as ADRs in docs/adrs
decision_id: DEC-001
decision_title: Record significant architecture decisions as ADRs
---
# ADR-001: Record architecture decisions

## Context
Architecture decisions are made continuously and are easy to lose. AI coding agents and new
engineers need one place to read what was decided and why.

## Decision
Significant architecture decisions are recorded as Markdown files in \`docs/adrs/\`.
When a decision changes, add a new ADR that sets \`supersedes: ADR-001\` (using the old ADR id)
instead of editing history.

## Consequences
- CAVDAX reads these files and builds a causal graph of sources, facts and decisions.
- Agents are blocked from acting on a decision whose source ADR has been superseded.
- Replace the placeholder fact and decision above with a real decision from your project.
`;
}

function pullRequestBody() {
  return [
    'This pull request was opened by CAVDAX on behalf of the repository owner.',
    '',
    `It adds one file, \`${NEW_ADR_PATH}\`, a starter Architecture Decision Record in MADR style.`,
    'Nothing else in the repository is changed.',
    '',
    'After you merge, CAVDAX reads ADRs from the default branch and builds the decision graph.',
    'Edit the placeholder fact and decision to describe a real decision before merging, or close this pull request to decline.'
  ].join('\n');
}

/** Opens (or returns the already-open) pull request that adds the starter ADR. */
export async function createAdrPullRequest({ token, owner, repo, fetchImpl = fetch, now = new Date() }) {
  assertRepoName(owner, repo);

  const scan = await scanRepoAdrs({ token, owner, repo, fetchImpl });
  if (scan.count > 0) {
    throw new GithubAdrError(409, 'ADRS_EXIST', 'This repository already has ADRs. Nothing to initialize.');
  }
  const base = scan.branch;

  // Idempotent: a second click returns the pull request that is already open.
  const open = await gh(fetchImpl, token, 'GET', `/repos/${owner}/${repo}/pulls?state=open&per_page=100`);
  const existing = (Array.isArray(open) ? open : []).find((p) => typeof p.head?.ref === 'string' && p.head.ref.startsWith(BASE_BRANCH_NAME));
  if (existing) {
    return { number: existing.number, url: existing.html_url, branch: existing.head.ref, path: NEW_ADR_PATH, base, reused: true };
  }

  const baseRef = await gh(fetchImpl, token, 'GET', `/repos/${owner}/${repo}/git/ref/heads/${enc(base)}`);
  const baseSha = baseRef.object.sha;

  let branch = BASE_BRANCH_NAME;
  try {
    await gh(fetchImpl, token, 'POST', `/repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${branch}`, sha: baseSha });
  } catch (err) {
    if (err.code !== 'UNPROCESSABLE') throw err;
    // Branch name taken by an earlier, closed pull request: use a unique suffix.
    branch = `${BASE_BRANCH_NAME}-${now.getTime().toString(36)}`;
    await gh(fetchImpl, token, 'POST', `/repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${branch}`, sha: baseSha });
  }

  await gh(fetchImpl, token, 'PUT', `/repos/${owner}/${repo}/contents/${enc(NEW_ADR_PATH)}`, {
    message: 'docs: add starter architecture decision record (ADR-001)',
    content: Buffer.from(buildStarterAdr(now), 'utf-8').toString('base64'),
    branch
  });

  const pr = await gh(fetchImpl, token, 'POST', `/repos/${owner}/${repo}/pulls`, {
    title: 'Add starter ADR for CAVDAX (ADR-001)',
    head: branch,
    base,
    body: pullRequestBody()
  });

  return { number: pr.number, url: pr.html_url, branch, path: NEW_ADR_PATH, base, reused: false };
}
