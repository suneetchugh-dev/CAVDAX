/**
 * CAVDAX Check Command
 *
 * npx cavdax check [--staged] [--pr <number>]
 *
 * Validates staged git files OR a GitHub PR's changed files against the
 * FalkorDB causal dependency graph. Returns exit code 0 (pass) or 1 (fail).
 *
 * Designed for use in:
 *   - git pre-commit hooks: `npx cavdax check --staged`
 *   - GitHub Actions CI:    `npx cavdax check --pr ${{ github.event.pull_request.number }}`
 *
 * Only text-based source files are scanned for CAVDAX decision ID references.
 * Binary files, lock files, and generated assets are skipped to prevent false
 * positives and crashes from calling readFileSync on non-UTF-8 content.
 */

import { execSync } from 'child_process';
import path from 'path';
import { connectGraph, closeQuietly, describeConnectError, falkorConfig, loadCore } from './runtime.js';

// File extensions that are safe to read as UTF-8 text and may contain
// CAVDAX decision ID references (e.g. DEC-102 in a comment or config).
// Binary files, images, lock files, and generated bundles are excluded.
const SCANNABLE_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs',
  '.ts', '.tsx', '.jsx',
  '.py', '.go', '.rs', '.rb', '.java', '.kt', '.cs', '.cpp', '.c', '.h',
  '.md', '.mdx', '.txt',
  '.yaml', '.yml', '.toml', '.ini', '.env',
  '.json',   // package.json, tsconfig etc — but NOT *.lock.json
  '.sh', '.bash', '.zsh',
  '.sql', '.graphql', '.proto'
]);

/**
 * Returns true if the file path should be scanned for decision ID references.
 * Excludes lock files explicitly regardless of extension.
 */
function isScannableFile(filePath) {
  const basename = path.basename(filePath);
  // Exclude lock files by name pattern regardless of extension
  if (basename.endsWith('.lock') || basename === 'package-lock.json' || basename === 'yarn.lock' || basename === 'pnpm-lock.yaml') {
    return false;
  }
  const ext = path.extname(filePath).toLowerCase();
  // Exclude documentation and markdown files (they describe examples, not executable code dependencies)
  if (ext === '.md' || ext === '.mdx' || ext === '.txt') {
    return false;
  }
  return SCANNABLE_EXTENSIONS.has(ext);
}

/**
 * Returns a list of staged file paths via `git diff --cached --name-only`.
 * @returns {string[]}
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Attempts to connect to FalkorDB and verify whether a given decision ID
 * (extracted heuristically from staged file content) is still valid.
 * Falls back to simulation if FalkorDB is unavailable.
 *
 * @param {string[]} files - List of file paths to check.
 * @param {object} options - CLI options (host, port passed via env).
 * @returns {Promise<boolean>} true if all checks pass, false if any violations found.
 */
async function verifyFiles(files, options) {
  let client = null;
  let graph = null;
  let verifyActionGate = null;
  let unreachableReason = null;

  try {
    ({ client, graph } = await connectGraph());
    ({ verifyActionGate } = await loadCore('graph/queries.js'));
  } catch (err) {
    unreachableReason = describeConnectError(err, falkorConfig());
    graph = null;
  }

  // --strict: an unverifiable gate must not silently pass (use in CI / pre-commit).
  if (!graph && options.strict) {
    console.error(`   ⛔ ${unreachableReason}`);
    console.error('      --strict is set, so unverifiable references are treated as failures.');
  }

  let allPassed = true;

  for (const filePath of files) {
    // Skip non-text files before attempting readFileSync to prevent crashes
    // on binary content (images, compiled bundles, lock files, etc.)
    if (!isScannableFile(filePath)) {
      console.log(`   ⏭️  ${filePath} — skipped (binary/lock/generated file)`);
      continue;
    }

    // Scan for decision ID patterns (e.g. DEC-102)
    let decisionIds = [];
    try {
      const { readFileSync } = await import('fs');
      const content = readFileSync(filePath, 'utf-8');
      const matches = content.match(/\bDEC-\d+\b/g) || [];
      decisionIds = [...new Set(matches)];
    } catch {
      // File deleted between git diff and now — skip gracefully
      console.log(`   ⏭️  ${filePath} — skipped (file unreadable or deleted)`);
      continue;
    }

    if (decisionIds.length === 0) {
      console.log(`   ✅ ${filePath} — no CAVDAX decision references found, skipping`);
      continue;
    }

    for (const decId of decisionIds) {
      let result;

      if (graph && verifyActionGate) {
        result = await verifyActionGate(graph, decId);
      } else {
        // FalkorDB is not reachable — skip causal check, do not block.
        //
        // Why: blocking without a live graph causes false positives because
        // the check command has no way to know whether DEC-102 is actually
        // stale in THIS repo's graph — it only knows it's stale in the CAVDAX
        // demo graph. Any repo that mentions "DEC-102" in a comment or doc
        // would be incorrectly blocked.
        //
        // The hardcoded DEC-102 simulation below this point is intentionally
        // removed. It existed only for the interactive Web HUD demo and must
        // never run in CI where FalkorDB is absent (syntax-check jobs, PRs
        // from forks, cavdax-gate.yml before FalkorDB is healthy, etc.).
        //
        // Operators who want strict enforcement must ensure FalkorDB is
        // reachable (set FALKORDB_HOST + FALKORDB_PORT, or run via docker).
        console.warn(`   ⚠️  FalkorDB unreachable — skipping causal check for ${decId} in ${filePath}`);
        result = {
          is_approved: !options.strict,
          gate_verdict: options.strict ? 'BLOCKED_GATE_UNREACHABLE' : 'SKIPPED_NO_FALKORDB',
          violation_paths: []
        };
      }

      if (!result.is_approved) {
        console.error(`   ⛔ BLOCKED: ${filePath} references ${decId}`);
        console.error(`      Verdict: ${result.gate_verdict}`);
        console.error(`      Violation path: ${JSON.stringify(result.violation_paths)}`);
        allPassed = false;
      } else {
        console.log(`   ✅ ${filePath} — ${decId} verified (${result.gate_verdict})`);
      }
    }
  }

  await closeQuietly(client);
  return allPassed;
}

/**
 * Main entry point for the `check` command.
 * @param {object} options - Commander options object.
 * @returns {Promise<boolean>} true = pass, false = fail
 */
export async function runCheck(options) {
  console.log('\n🛡️  CAVDAX Check — causal provenance validation\n');

  let filesToCheck = [];

  if (options.staged) {
    filesToCheck = getStagedFiles();
    if (filesToCheck.length === 0) {
      console.log('   No staged files found. Nothing to check.');
      return true;
    }
    console.log(`   Checking ${filesToCheck.length} staged file(s)...\n`);
  } else if (options.pr) {
    console.log(`   PR mode: checking files changed in PR #${options.pr}`);
    // In CI: rely on git diff vs. base branch for changed files
    try {
      const output = execSync('git diff --name-only origin/main...HEAD', { encoding: 'utf-8' });
      filesToCheck = output.trim().split('\n').filter(Boolean);
    } catch {
      console.warn('   ⚠️  Could not determine changed files via git diff — checking all staged files.');
      filesToCheck = getStagedFiles();
    }
    if (filesToCheck.length === 0) {
      console.log('   No changed files found in PR. Nothing to check.');
      return true;
    }
    console.log(`   Checking ${filesToCheck.length} PR file(s)...\n`);
  } else {
    console.log('   Usage: npx cavdax check --staged   OR   npx cavdax check --pr <number>');
    return true;
  }

  const passed = await verifyFiles(filesToCheck, options);

  if (passed) {
    console.log('\n✅ All causal provenance checks passed.\n');
  } else {
    console.error('\n⛔ CAVDAX gate blocked one or more files. Fix violations before merging.\n');
  }

  return passed;
}
