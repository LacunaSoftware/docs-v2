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
  fs.rmSync(destPath, { recursive: true, force: true });
  fs.cpSync(srcPath, destPath, { recursive: true });
  console.log(`Mirrored ${src} → ${dest}`);
}
