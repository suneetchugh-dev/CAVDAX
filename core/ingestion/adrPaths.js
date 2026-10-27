/**
 * CAVDAX ADR location rules (repo-relative, POSIX paths).
 *
 * One list, used wherever CAVDAX has to decide "is this file an Architecture Decision Record?"
 * Teams keep ADRs in many places, so we accept the common conventions rather than one folder.
 */

// Directories (relative to the repo root) that hold decision records.
export const ADR_DIRECTORIES = [
  '.adr',
  'adr',
  'adrs',
  'doc/adr',
  'doc/adrs',
  'docs/adr',
  'docs/adrs',
  'docs/decisions',
  'docs/architecture/decisions',
  'architecture/decisions',
  'architecture',
  'decisions'
];

// Files that live next to ADRs but are not decisions.
const NON_ADR_FILENAME = /^(readme|index|template|_template|adr-template)(\..*)?$/i;

/**
 * @param {string} repoPath repo-relative path, forward slashes (e.g. "docs/adrs/ADR-001.md")
 * @returns {boolean}
 */
export function isAdrPath(repoPath) {
  if (typeof repoPath !== 'string' || !repoPath.toLowerCase().endsWith('.md')) return false;
  const normalized = repoPath.replace(/^\.?\//, '');
  const fileName = normalized.slice(normalized.lastIndexOf('/') + 1);
  if (NON_ADR_FILENAME.test(fileName)) return false;
  const lower = normalized.toLowerCase();
  return ADR_DIRECTORIES.some((dir) => lower.startsWith(`${dir.toLowerCase()}/`));
}
