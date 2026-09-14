/**
 * Build-time content mirrors. Docusaurus can't serve one docs instance at two
 * route paths, and two instances can't share a source folder, so every "same
 * content, second URL prefix" case gets a gitignored copy regenerated here:
 *
 *   api-docs   → api-docs-en     .NET API reference at /en-us/api (lang-neutral)
 *   api-docs   → api-docs-ptbr   .NET API reference at /pt-br/api
 *   docs       → docs-ptbr       Portuguese articles mirrored under /pt-br/...
 *
 * Portuguese is served both at the root (/articles/...) and under /pt-br/...,
 * matching the classic site, which built the whole pt-BR tree under /pt-br/.
 *
 * Runs before `start` and `build` (package.json pre* hooks), so only the
 * sources (api-docs/, docs/) are committed; the mirrors are gitignored and
 * rebuilt each time.
 *
 * The sync is INCREMENTAL: instead of deleting the whole mirror and recopying
 * every file, it copies only files whose size or mtime differ and removes only
 * files that no longer exist in the source. This is much faster on repeat runs
 * and, crucially, avoids the Windows file-lock crash (EPERM/ENOTEMPTY) that the
 * old rm-then-copy approach hit whenever the `docusaurus start` dev server was
 * watching a mirror (e.g. api-docs-en): unchanged files are never touched, so
 * the watcher's open handles are left alone. Files that DID change but happen to
 * be locked are reported and skipped rather than aborting the whole build.
 */
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const mirrors = [
  {src: 'api-docs', dest: 'api-docs-en',   optional: true},
  {src: 'api-docs', dest: 'api-docs-ptbr', optional: true},
  {src: 'docs',     dest: 'docs-ptbr',     optional: false},
];

// Two files are considered equal when size matches and mtimes are within this
// tolerance (ms). Timestamps survive copyFile + utimes at second precision on
// some filesystems, so a small window avoids needless recopies.
const MTIME_TOLERANCE_MS = 2000;

const isLockError = (err) =>
  err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'ENOTEMPTY' || err.code === 'EACCES');

/** Recursively map every file under `root` to its {size, mtimeMs}. */
function listFiles(root) {
  const files = new Map();
  const walk = (dir, rel) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const relPath = rel ? path.join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) {
        walk(abs, relPath);
      } else if (entry.isFile()) {
        const st = fs.statSync(abs);
        files.set(relPath, { size: st.size, mtimeMs: st.mtimeMs });
      }
    }
  };
  if (fs.existsSync(root)) walk(root, '');
  return files;
}

/** Remove now-empty directories under `root`, bottom-up. Best-effort. */
function pruneEmptyDirs(root) {
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const dir = path.join(root, entry.name);
      pruneEmptyDirs(dir);
      try {
        if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
      } catch { /* locked or non-empty — leave it */ }
    }
  }
}

let hadLockedFiles = false;

for (const {src, dest, optional} of mirrors) {
  const srcPath  = path.join(SITE, src);
  const destPath = path.join(SITE, dest);

  if (!fs.existsSync(srcPath)) {
    if (optional) {
      console.warn(`sync-mirrors: ${src}/ not found — skipping ${dest}/ mirror.`);
      continue;
    }
    console.error(`sync-mirrors: required source ${src}/ not found.`);
    process.exit(1);
  }

  const srcFiles  = listFiles(srcPath);
  const destFiles = listFiles(destPath);

  let copied = 0, removed = 0, unchanged = 0, locked = 0;

  // Copy new/changed files.
  for (const [rel, s] of srcFiles) {
    const d = destFiles.get(rel);
    const changed = !d || d.size !== s.size || Math.abs(d.mtimeMs - s.mtimeMs) > MTIME_TOLERANCE_MS;
    if (!changed) { unchanged++; continue; }

    const srcFile  = path.join(srcPath, rel);
    const destFile = path.join(destPath, rel);
    try {
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(srcFile, destFile);
      // Mirror the source mtime so the next run recognises the file as up to date.
      const mtime = new Date(s.mtimeMs);
      fs.utimesSync(destFile, mtime, mtime);
      copied++;
    } catch (err) {
      if (isLockError(err)) { locked++; continue; }
      throw err;
    }
  }

  // Remove files that no longer exist in the source.
  for (const rel of destFiles.keys()) {
    if (srcFiles.has(rel)) continue;
    try {
      fs.rmSync(path.join(destPath, rel), { force: true });
      removed++;
    } catch (err) {
      if (isLockError(err)) { locked++; continue; }
      throw err;
    }
  }

  pruneEmptyDirs(destPath);

  if (locked > 0) hadLockedFiles = true;
  const lockedNote = locked > 0 ? `, ${locked} locked (skipped)` : '';
  console.log(
    `Mirrored ${src} → ${dest} (${copied} copied, ${removed} removed, ${unchanged} unchanged${lockedNote})`,
  );
}

if (hadLockedFiles) {
  console.warn(
    'sync-mirrors: some changed files were locked (likely a running `docusaurus start`) ' +
    'and were left as-is. Stop the dev server and re-run if the mirror looks stale.',
  );
}
