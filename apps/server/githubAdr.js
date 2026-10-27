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
export async function scanRepoAdrs(args) {
  const { tree: _tree, ...result } = await scanWithTree(args);
  return result;
}

async function scanWithTree({ token, owner, repo, fetchImpl = fetch }) {
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
    tree: tree.tree || [],
    repo: `${owner}/${repo}`,
    branch,
    count: parsed.length,
    truncated: Boolean(tree.truncated) || capped,
    adrs: parsed.map(({ path: p, id, title, status, supersedes }) => ({ path: p, id, title, status, supersedes })),
    graph: buildGraphFromAdrs(parsed)
  };
}

// ---------------------------------------------------------------------------
// Stack detection: the starter ADR describes what the repository actually uses.
// Only facts that are literally present in a manifest file are claimed.
// ---------------------------------------------------------------------------

const MANIFESTS = {
  'package.json': 'Node.js',
  'requirements.txt': 'Python',
  'pyproject.toml': 'Python',
  'go.mod': 'Go',
  'Cargo.toml': 'Rust',
  'pom.xml': 'Java',
  'build.gradle': 'Java',
  'Gemfile': 'Ruby',
  'composer.json': 'PHP'
};
const MAX_MANIFEST_BYTES = 200 * 1024;

// Ordered by architectural weight: a primary database outranks a cache.
const DATASTORES = [
  { name: 'PostgreSQL', slug: 'Postgres', tokens: ['pg', 'pg-promise', 'postgres', 'psycopg2', 'psycopg2-binary', 'psycopg', 'asyncpg', 'github.com/lib/pq', 'github.com/jackc/pgx', 'postgresql'] },
  { name: 'MySQL', slug: 'MySQL', tokens: ['mysql', 'mysql2', 'mysqlclient', 'pymysql', 'github.com/go-sql-driver/mysql', 'mysql-connector-j', 'mysql-connector-java'] },
  { name: 'MongoDB', slug: 'Mongo', tokens: ['mongodb', 'mongoose', 'pymongo', 'motor', 'mongoengine', 'go.mongodb.org/mongo-driver', 'mongodb-driver-sync'] },
  { name: 'SQLite', slug: 'SQLite', tokens: ['sqlite3', 'better-sqlite3', 'sqlite-jdbc'] },
  { name: 'DynamoDB', slug: 'DynamoDB', tokens: ['@aws-sdk/client-dynamodb', 'aws-sdk-dynamodb'] },
  { name: 'FalkorDB', slug: 'FalkorDB', tokens: ['falkordb'] },
  { name: 'Redis', slug: 'Redis', tokens: ['redis', 'ioredis', 'github.com/redis/go-redis', 'jedis', 'spring-boot-starter-data-redis'] }
];

const FRAMEWORKS = [
  { name: 'Express', slug: 'Express', tokens: ['express'] },
  { name: 'Fastify', slug: 'Fastify', tokens: ['fastify'] },
  { name: 'NestJS', slug: 'NestJS', tokens: ['@nestjs/core'] },
  { name: 'Next.js', slug: 'Next', tokens: ['next'] },
  { name: 'React', slug: 'React', tokens: ['react'] },
  { name: 'Vue', slug: 'Vue', tokens: ['vue'] },
  { name: 'Django', slug: 'Django', tokens: ['django'] },
  { name: 'Flask', slug: 'Flask', tokens: ['flask'] },
  { name: 'FastAPI', slug: 'FastAPI', tokens: ['fastapi'] },
  { name: 'Spring Boot', slug: 'SpringBoot', tokens: ['spring-boot-starter-web', 'spring-boot-starter'] },
  { name: 'Gin', slug: 'Gin', tokens: ['github.com/gin-gonic/gin'] },
  { name: 'Rails', slug: 'Rails', tokens: ['rails'] }
];

/** Extracts lowercase dependency names from one manifest file. */
function dependencyNames(fileName, content) {
  const out = new Set();
  if (fileName === 'package.json' || fileName === 'composer.json') {
    try {
      const pkg = JSON.parse(content);
      for (const key of ['dependencies', 'devDependencies', 'require', 'require-dev']) {
        for (const dep of Object.keys(pkg[key] || {})) out.add(dep.toLowerCase());
      }
    } catch { /* malformed manifest: claim nothing from it */ }
    return out;
  }
  if (fileName === 'pom.xml') {
    for (const m of content.matchAll(/<artifactId>\s*([^<\s]+)\s*<\/artifactId>/g)) out.add(m[1].toLowerCase());
    return out;
  }
  // requirements.txt, pyproject.toml, go.mod, Cargo.toml, build.gradle, Gemfile: tokenise.
  for (const m of content.toLowerCase().matchAll(/[a-z0-9@][a-z0-9_.\-/@]*/g)) out.add(m[0]);
  return out;
}

/**
 * @param {Record<string,string>} manifests fileName -> content, from the repository root
 * @returns {{languages: string[], datastores: object[], frameworks: object[], evidence: string[]}}
 */
export function detectStack(manifests) {
  const languages = [];
  const deps = new Set();
  const evidence = [];
  for (const [file, content] of Object.entries(manifests)) {
    const lang = MANIFESTS[file];
    if (!lang) continue;
    if (!languages.includes(lang)) languages.push(lang);
    evidence.push(file);
    for (const d of dependencyNames(file, content)) deps.add(d);
  }
  const pick = (table) => table.filter((e) => e.tokens.some((t) => deps.has(t)));
  return { languages, datastores: pick(DATASTORES), frameworks: pick(FRAMEWORKS), evidence };
}

function joinList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * The starter ADR committed by the pull request. Parseable by the CAVDAX ingestion engine.
 * With a detected stack it records the repository's primary technology choice; with nothing
 * detected it falls back to the standard "record architecture decisions" ADR.
 */
export function buildStarterAdr({ date = new Date(), repo = 'this repository', detection = null } = {}) {
  const day = date.toISOString().slice(0, 10);
  const primary = detection && (detection.datastores[0] || detection.frameworks[0]);

  if (!primary) {
    return `---
id: ADR-001
title: Record architecture decisions
status: ACCEPTED
date: ${day}
fact_id: F-ADR-Process
fact_claim: Architecture decisions for ${repo} are recorded as ADRs in docs/adrs
decision_id: DEC-001
decision_title: Record significant architecture decisions as ADRs
---
# ADR-001: Record architecture decisions

## Context
CAVDAX could not detect a technology stack from the manifest files in ${repo}.
Architecture decisions are easy to lose, and AI coding agents need one place to read what was decided.

## Decision
Significant architecture decisions are recorded as Markdown files in \`docs/adrs/\`.
When a decision changes, add a new ADR that sets \`supersedes: ADR-001\` (use the old ADR id)
instead of editing history.

## Consequences
- CAVDAX reads these files and builds a causal graph of sources, facts and decisions.
- Agents are blocked from acting on a decision whose source ADR has been superseded.
- Replace this with a real decision from your project when you have one.
`;
  }

  const isStore = detection.datastores[0] === primary;
  const others = [...detection.datastores, ...detection.frameworks].filter((e) => e !== primary);
  const stack = detection.languages.length ? ` (${joinList(detection.languages)})` : '';
  const kind = isStore ? 'data store' : 'application framework';
  const subject = isStore ? `${primary.name} as the primary data store` : `${primary.name} as the application framework`;
  const sources = joinList(detection.evidence.map((f) => `\`${f}\``));

  return `---
id: ADR-001
title: Use ${primary.name} as the ${kind} for ${repo}
status: ACCEPTED
date: ${day}
fact_id: F-${primary.slug}
fact_claim: ${repo} uses ${subject}
decision_id: DEC-001
decision_title: Build ${repo} on ${primary.name}
---
# ADR-001: Use ${primary.name} as the ${kind} for ${repo}

## Context
CAVDAX read ${sources} in ${repo}${stack} and found ${primary.name}${others.length ? `, alongside ${joinList(others.map((e) => e.name))}` : ''}.
This record captures that existing choice so engineers and AI coding agents work against it.

## Decision
${repo} uses **${primary.name}** as its ${kind}. New code follows this choice unless a later ADR supersedes it.

## Consequences
- Agents and engineers scaffold new code against ${primary.name}.
- To change this, add a new ADR with \`supersedes: ADR-001\`. CAVDAX then marks this decision for revalidation.
- This ADR was generated from dependency names only. Edit it to match your intent before merging.
`;
}

function pullRequestBody(detection) {
  const lines = [
    'This pull request was opened by CAVDAX on behalf of the repository owner.',
    '',
    `It adds one file, \`${NEW_ADR_PATH}\`, a starter Architecture Decision Record. Nothing else changes.`,
    ''
  ];
  const found = detection && [...detection.datastores, ...detection.frameworks];
  if (found && found.length) {
    lines.push(`Detected from ${joinList(detection.evidence.map((f) => `\`${f}\``))}: ${joinList(found.map((e) => e.name))}.`);
    lines.push('The ADR records the first of these as the primary technology choice.');
  } else {
    lines.push('No known data store or framework was found in the manifest files, so the ADR is the standard "record architecture decisions" record.');
  }
  lines.push('', 'This is generated from dependency names only. Edit it to match your intent before merging, or close this pull request to decline.');
  lines.push('After you merge, CAVDAX reads ADRs from the default branch and builds the decision graph.');
  return lines.join('\n');
}

/** Reads root-level manifests from the default branch and detects the stack. */
async function detectRepoStack({ token, owner, repo, branch, tree, fetchImpl }) {
  const rootFiles = tree.filter((e) => e.type === 'blob' && MANIFESTS[e.path] && (e.size ?? 0) <= MAX_MANIFEST_BYTES);
  const manifests = {};
  await Promise.all(rootFiles.map(async (e) => {
    manifests[e.path] = await gh(fetchImpl, token, 'GET',
      `/repos/${owner}/${repo}/contents/${enc(e.path)}?ref=${encodeURIComponent(branch)}`,
      null, 'application/vnd.github.raw+json');
  }));
  return detectStack(manifests);
}

/** Opens (or returns the already-open) pull request that adds the starter ADR. */
export async function createAdrPullRequest({ token, owner, repo, fetchImpl = fetch, now = new Date() }) {
  assertRepoName(owner, repo);

  const scan = await scanWithTree({ token, owner, repo, fetchImpl });
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

  // Read everything we need before writing anything, so a failure cannot leave an orphan branch.
  const detection = await detectRepoStack({ token, owner, repo, branch: base, tree: scan.tree, fetchImpl });

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
    content: Buffer.from(buildStarterAdr({ date: now, repo: `${owner}/${repo}`, detection }), 'utf-8').toString('base64'),
    branch
  });

  const pr = await gh(fetchImpl, token, 'POST', `/repos/${owner}/${repo}/pulls`, {
    title: 'Add starter ADR for CAVDAX (ADR-001)',
    head: branch,
    base,
    body: pullRequestBody(detection)
  });

  const detected = [...detection.datastores, ...detection.frameworks].map((e) => e.name);
  return { number: pr.number, url: pr.html_url, branch, path: NEW_ADR_PATH, base, reused: false, detected };
}
