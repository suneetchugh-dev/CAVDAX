/**
 * Tests for the GitHub ADR scan and the "Initialize ADR" pull request flow.
 * GitHub is mocked, so nothing touches a real repository.
 *   node --test apps/server/test/githubAdr.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdrPath } from '../../../core/ingestion/adrPaths.js';
import { parseFrontmatter } from '../../../core/ingestion/parser.js';
import {
  scanRepoAdrs, createAdrPullRequest, buildGraphFromAdrs, buildStarterAdr, detectStack, assertRepoName, NEW_ADR_PATH
} from '../githubAdr.js';

const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) });
const text = (body) => ({ ok: true, status: 200, json: async () => ({}), text: async () => body });

const ADR1 = `---
id: ADR-001
title: Use MongoDB
fact_id: F-Mongo
fact_claim: Orders live in MongoDB
decision_id: DEC-201
decision_title: Build on MongoDB
---
# ADR-001: Use MongoDB
`;
const ADR2 = `---
id: ADR-002
title: Use PostgreSQL
supersedes: ADR-001
fact_id: F-Postgres
fact_claim: Orders live in PostgreSQL
---
# ADR-002: Use PostgreSQL
`;

/** Fake GitHub. `files` maps path -> content. Records every call. */
function fakeGithub({ files = {}, openPulls = [], takenBranch = false, extraTree = [] } = {}) {
  const calls = [];
  const fetchImpl = async (url, opts = {}) => {
    const method = opts.method || 'GET';
    const u = new URL(url);
    const p = decodeURIComponent(u.pathname);
    calls.push({ method, path: p, body: opts.body ? JSON.parse(opts.body) : null });
    if (method === 'GET' && /^\/repos\/o\/r$/.test(p)) return json({ default_branch: 'main' });
    if (method === 'GET' && p.startsWith('/repos/o/r/git/trees/')) {
      return json({ truncated: false, tree: [...Object.keys(files).map((f) => ({ type: 'blob', path: f, size: files[f].length })), ...extraTree] });
    }
    if (method === 'GET' && p.startsWith('/repos/o/r/contents/')) {
      const content = files[p.replace('/repos/o/r/contents/', '')];
      return content === undefined ? json({}, 404) : text(content);
    }
    if (method === 'GET' && p === '/repos/o/r/pulls') return json(openPulls);
    if (method === 'GET' && p === '/repos/o/r/git/ref/heads/main') return json({ object: { sha: 'abc123' } });
    if (method === 'POST' && p === '/repos/o/r/git/refs') return takenBranch && opts.body.includes('"refs/heads/cavdax/init-adr"') ? json({}, 422) : json({});
    if (method === 'PUT' && p.startsWith('/repos/o/r/contents/')) return json({ content: {} }, 201);
    if (method === 'POST' && p === '/repos/o/r/pulls') return json({ number: 7, html_url: 'https://github.com/o/r/pull/7' }, 201);
    return json({}, 404);
  };
  return { fetchImpl, calls };
}

test('isAdrPath accepts the common ADR folders and rejects non-decisions', () => {
  for (const p of ['docs/adrs/ADR-001.md', 'docs/adr/0001-x.md', 'doc/adr/0001.md', '.adr/a.md', 'docs/decisions/x.md',
    'architecture/decisions/x.md', 'adr/x.md', 'DOCS/ADRS/X.md']) assert.equal(isAdrPath(p), true, p);
  for (const p of ['README.md', 'docs/adrs/README.md', 'docs/adrs/template.md', 'docs/adrs/diagram.png', 'src/adr.md',
    'docs/guide.md', 'docs/adrs-extra/x.md']) assert.equal(isAdrPath(p), false, p);
});

test('assertRepoName rejects path tricks', () => {
  assert.doesNotThrow(() => assertRepoName('GeetikaChughIBM', 'acme-checkout'));
  for (const [o, r] of [['..', 'r'], ['o', '../x'], ['o', 'a/b'], ['o', ''], ['o', 'r?x=1']]) {
    assert.throws(() => assertRepoName(o, r), /Invalid repository/);
  }
});

test('scan finds ADRs in docs/adrs and builds the real graph', async () => {
  const { fetchImpl } = fakeGithub({ files: { 'docs/adrs/ADR-001.md': ADR1, 'README.md': '# hi', 'docs/adrs/README.md': 'x' } });
  const r = await scanRepoAdrs({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  assert.equal(r.count, 1);
  assert.equal(r.branch, 'main');
  assert.deepEqual(r.graph.nodes.map((n) => n.id).sort(), ['ADR-001', 'DEC-201', 'F-Mongo']);
  assert.ok(r.graph.edges.some((e) => e.type === 'DEPENDS_ON' && e.source === 'DEC-201' && e.target === 'F-Mongo'));
});

test('a superseding ADR invalidates the dependent decision in the graph', async () => {
  const { fetchImpl } = fakeGithub({ files: { 'docs/adrs/ADR-001.md': ADR1, 'docs/adrs/ADR-002.md': ADR2 } });
  const r = await scanRepoAdrs({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  const byId = Object.fromEntries(r.graph.nodes.map((n) => [n.id, n]));
  assert.equal(byId['ADR-001'].status, 'SUPERSEDED');
  assert.equal(byId['F-Mongo'].is_stale, true);
  assert.equal(byId['DEC-201'].status, 'INVALIDATED_NEEDS_REVALIDATION');
  assert.equal(byId['ADR-002'].status, 'ACTIVE');
  assert.ok(r.graph.edges.some((e) => e.type === 'SUPERSEDES' && e.source === 'ADR-002'));
});

test('scan of a repo without ADRs returns zero and an empty graph', async () => {
  const { fetchImpl } = fakeGithub({ files: { 'README.md': '# hi' } });
  const r = await scanRepoAdrs({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  assert.equal(r.count, 0);
  assert.deepEqual(r.graph, { nodes: [], edges: [] });
});

test('Initialize opens a PR from a new branch and never writes to the default branch', async () => {
  const { fetchImpl, calls } = fakeGithub({ files: { 'README.md': '# hi' } });
  const pr = await createAdrPullRequest({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  assert.equal(pr.number, 7);
  assert.equal(pr.branch, 'cavdax/init-adr');
  assert.equal(pr.reused, false);
  const put = calls.find((c) => c.method === 'PUT');
  assert.equal(put.body.branch, 'cavdax/init-adr');
  assert.ok(put.path.endsWith(NEW_ADR_PATH));
  assert.equal(calls.filter((c) => c.method === 'PUT').length, 1);
  assert.equal(calls.find((c) => c.method === 'POST' && c.path.endsWith('/pulls')).body.base, 'main');
  assert.ok(!calls.some((c) => /heads\/main$/.test(c.path) && c.method !== 'GET'), 'must not modify main');
});

test('fallback starter ADR (nothing detected) parses with the real CAVDAX parser', () => {
  const { frontmatter } = parseFrontmatter(buildStarterAdr({ date: new Date('2026-01-02T00:00:00Z'), repo: 'o/r' }), NEW_ADR_PATH);
  assert.equal(frontmatter.id, 'ADR-001');
  assert.equal(frontmatter.fact_id, 'F-ADR-Process');
  assert.equal(frontmatter.decision_id, 'DEC-001');
  assert.equal(frontmatter.date, '2026-01-02');
  assert.ok(isAdrPath(NEW_ADR_PATH));
});

test('detectStack reads real dependencies and ranks a database above a cache', () => {
  const d = detectStack({ 'package.json': JSON.stringify({ dependencies: { express: '^4', redis: '^4', pg: '^8' } }) });
  assert.deepEqual(d.languages, ['Node.js']);
  assert.deepEqual(d.datastores.map((s) => s.name), ['PostgreSQL', 'Redis']);
  assert.deepEqual(d.frameworks.map((s) => s.name), ['Express']);
  assert.deepEqual(d.evidence, ['package.json']);
});

test('detectStack reads Python, Go and Java manifests', () => {
  assert.equal(detectStack({ 'requirements.txt': 'Django==4.2\npsycopg2-binary==2.9\n' }).datastores[0].name, 'PostgreSQL');
  assert.equal(detectStack({ 'requirements.txt': 'Django==4.2\n' }).frameworks[0].name, 'Django');
  assert.equal(detectStack({ 'go.mod': 'module x\nrequire go.mongodb.org/mongo-driver v1.1\n' }).datastores[0].name, 'MongoDB');
  assert.equal(detectStack({ 'pom.xml': '<dependency><artifactId>mysql-connector-j</artifactId></dependency>' }).datastores[0].name, 'MySQL');
});

test('detectStack claims nothing from unknown, empty or malformed manifests', () => {
  const none = { datastores: [], frameworks: [] };
  for (const m of [{}, { 'package.json': '{ not json' }, { 'package.json': '{"dependencies":{"lodash":"1"}}' }, { 'README.md': 'postgres mongodb' }]) {
    const d = detectStack(m);
    assert.deepEqual({ datastores: d.datastores, frameworks: d.frameworks }, none);
  }
});

test('detectStack does not match substrings (e.g. "pg" inside "upgrade")', () => {
  assert.equal(detectStack({ 'requirements.txt': 'upgrade-tool==1.0\nredisson==2\n' }).datastores.length, 0);
});

test('starter ADR describes the repo that was scanned, and parses with the real parser', () => {
  const detection = detectStack({ 'package.json': JSON.stringify({ dependencies: { mongoose: '8', redis: '4' } }) });
  const md = buildStarterAdr({ date: new Date('2026-01-02T00:00:00Z'), repo: 'acme/shop', detection });
  const { frontmatter } = parseFrontmatter(md, NEW_ADR_PATH);
  assert.equal(frontmatter.id, 'ADR-001');
  assert.equal(frontmatter.fact_id, 'F-Mongo');
  assert.match(frontmatter.fact_claim, /acme\/shop uses MongoDB/);
  assert.match(frontmatter.title, /MongoDB/);
  assert.match(md, /alongside Redis/);
  assert.match(md, /`package.json`/);
  assert.ok(!/PostgreSQL/.test(md), 'must not claim a database that is not in the manifest');
});

test('Initialize writes an ADR built from the repo manifest', async () => {
  const { fetchImpl, calls } = fakeGithub({
    files: { 'package.json': JSON.stringify({ dependencies: { pg: '8', express: '4' } }), 'README.md': '# hi' }
  });
  const pr = await createAdrPullRequest({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  assert.deepEqual(pr.detected, ['PostgreSQL', 'Express']);
  const put = calls.find((c) => c.method === 'PUT');
  const md = Buffer.from(put.body.content, 'base64').toString('utf-8');
  assert.match(md, /fact_id: F-Postgres/);
  assert.match(md, /o\/r uses PostgreSQL as the primary data store/);
  const prCall = calls.find((c) => c.method === 'POST' && c.path.endsWith('/pulls'));
  assert.match(prCall.body.body, /Detected from `package.json`: PostgreSQL and Express/);
});

test('Initialize reads manifests before creating the branch (no orphan branch on failure)', async () => {
  const { fetchImpl, calls } = fakeGithub({ files: { 'package.json': '{}', 'README.md': '# hi' } });
  await createAdrPullRequest({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  const manifestRead = calls.findIndex((c) => c.method === 'GET' && c.path.endsWith('/contents/package.json'));
  const branchCreate = calls.findIndex((c) => c.method === 'POST' && c.path.endsWith('/git/refs'));
  assert.ok(manifestRead >= 0 && manifestRead < branchCreate);
});

test('Initialize on a repo with no recognised stack falls back to the process ADR', async () => {
  const { fetchImpl, calls } = fakeGithub({ files: { 'README.md': '# hi' } });
  const pr = await createAdrPullRequest({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  assert.deepEqual(pr.detected, []);
  const md = Buffer.from(calls.find((c) => c.method === 'PUT').body.content, 'base64').toString('utf-8');
  assert.match(md, /fact_id: F-ADR-Process/);
});

test('Initialize is idempotent: an open CAVDAX PR is returned, not duplicated', async () => {
  const { fetchImpl, calls } = fakeGithub({
    files: { 'README.md': '# hi' },
    openPulls: [{ number: 3, html_url: 'https://github.com/o/r/pull/3', head: { ref: 'cavdax/init-adr' } }]
  });
  const pr = await createAdrPullRequest({ token: 't', owner: 'o', repo: 'r', fetchImpl });
  assert.equal(pr.number, 3);
  assert.equal(pr.reused, true);
  assert.ok(!calls.some((c) => c.method === 'POST' || c.method === 'PUT'));
});

test('Initialize uses a unique branch when the default name is taken', async () => {
  const { fetchImpl } = fakeGithub({ files: { 'README.md': '# hi' }, takenBranch: true });
  const pr = await createAdrPullRequest({ token: 't', owner: 'o', repo: 'r', fetchImpl, now: new Date(1700000000000) });
  assert.match(pr.branch, /^cavdax\/init-adr-[a-z0-9]+$/);
});

test('Initialize refuses when the repo already has ADRs', async () => {
  const { fetchImpl, calls } = fakeGithub({ files: { 'docs/adrs/ADR-001.md': ADR1 } });
  await assert.rejects(() => createAdrPullRequest({ token: 't', owner: 'o', repo: 'r', fetchImpl }), (e) => e.code === 'ADRS_EXIST' && e.status === 409);
  assert.ok(!calls.some((c) => c.method !== 'GET'));
});

test('GitHub errors map to clear codes', async () => {
  for (const [status, code] of [[401, 'AUTH_EXPIRED'], [404, 'NOT_FOUND'], [403, 'FORBIDDEN']]) {
    const fetchImpl = async () => json({}, status);
    await assert.rejects(() => scanRepoAdrs({ token: 't', owner: 'o', repo: 'r', fetchImpl }), (e) => e.code === code);
  }
});

test('buildGraphFromAdrs ignores a supersedes target that does not exist', () => {
  const g = buildGraphFromAdrs([{ id: 'ADR-009', title: 'x', path: 'p', supersedes: ['ADR-404'], fact_id: null, fact_claim: null }]);
  assert.equal(g.nodes.length, 1);
  assert.equal(g.edges.length, 0);
});
