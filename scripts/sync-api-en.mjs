/**
 * Mirrors the generated API docs (api-docs/) to api-docs-en/ so the same
 * language-neutral reference is served at both /api and /en/api (two docs
 * plugin instances — see docusaurus.config.ts — can't share one path).
 *
 * Runs automatically before `start` and `build` (package.json pre* hooks), so
 * only api-docs/ is committed; api-docs-en/ is gitignored and rebuilt each time.
 */
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src  = path.join(SITE, 'api-docs');
const dest = path.join(SITE, 'api-docs-en');

if (!fs.existsSync(src)) {
  console.warn('sync-api-en: api-docs/ not found — skipping EN mirror.');
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Mirrored api-docs → api-docs-en');
