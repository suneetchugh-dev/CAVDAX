#!/usr/bin/env node
/**
 * prepack: copy the engine (../../core) into ./core so the published tarball is
 * self-contained. Before this, the tarball only had bin/ and src/ and every
 * module that imported ../../core/... silently failed to load.
 *
 * postpack (--clean): remove the copy again so the monorepo stays single-source.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(pkgRoot, '../../core');
const dest = path.join(pkgRoot, 'core');

fs.rmSync(dest, { recursive: true, force: true });
if (process.argv.includes('--clean')) process.exit(0);

if (!fs.existsSync(source)) {
  console.error(`bundle-core: ${source} not found — pack from inside the CAVDAX monorepo`);
  process.exit(1);
}

// client.js (env-driven singleton) and stdio.js (legacy monorepo entrypoint) are not used by the package.
const skip = new Set(['stdio.js']);
fs.cpSync(source, dest, { recursive: true, filter: (src) => !skip.has(path.basename(src)) });
console.log(`bundle-core: copied core/ -> ${path.relative(process.cwd(), dest) || dest}`);
