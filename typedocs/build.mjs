// Generates the Web PKI TypeScript API reference (TypeDoc) and writes it into
// docs-v2/static at the classic paths, so the migrated site keeps serving the
// exact same URLs the old DocFX site did — e.g.
//   /content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signhash
//
// It is generated with TypeDoc 0.10 + the vendored custom Handlebars theme
// (theme/) to preserve the original per-method anchors (#signhash, #init, ...)
// that the docs and external links depend on. Run it whenever
// lacuna-web-pki.d.ts is updated:
//
//   cd typedocs && npm install && npm run build
//
// The output is committed under static/ (this project is NOT wired into the main
// docs build — the ancient TypeDoc/TS toolchain is kept isolated here).
import {execFileSync} from 'node:child_process';
import {rmSync, mkdirSync, cpSync} from 'node:fs';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const staticDir = resolve(here, '..', 'static');

// Mount points that must serve the reference (URL parity with the old site):
//   /content/typedocs/web-pki           — locale-neutral canonical path (all in-repo links use this)
//   /en-us/content/typedocs/web-pki     — legacy /en-us deep links (e.g. the classic API-reference link)
const primary = join(staticDir, 'content', 'typedocs', 'web-pki');
const enUsMirror = join(staticDir, 'en-us', 'content', 'typedocs', 'web-pki');

// Run TypeDoc's JS entry point via `node` rather than the .bin shim: Node 22 on
// Windows refuses to spawn the .cmd wrapper directly (EINVAL), and this is
// cross-platform.
const typedocJs = resolve(here, 'node_modules', 'typedoc', 'bin', 'typedoc');

console.log('Generating Web PKI TypeDoc into', primary);
rmSync(primary, {recursive: true, force: true});
mkdirSync(primary, {recursive: true});

execFileSync(
  process.execPath,
  [
    typedocJs,
    '--out', primary,
    '--theme', 'theme',
    '--readme', 'none',
    '--name', 'Web PKI - API Reference',
    '--tsconfig', 'tsconfig.json',
    '--ignoreCompilerErrors',
    '--excludeExternals',
    '--includeDeclarations',
    'lacuna-web-pki.d.ts',
  ],
  {cwd: here, stdio: 'inherit'},
);

console.log('Mirroring to', enUsMirror);
rmSync(enUsMirror, {recursive: true, force: true});
mkdirSync(enUsMirror, {recursive: true});
cpSync(primary, enUsMirror, {recursive: true});

console.log('Done. Web PKI API reference generated at both static paths.');
