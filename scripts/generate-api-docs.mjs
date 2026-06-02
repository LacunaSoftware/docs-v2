/**
 * Generates Docusaurus (MDX) .NET API reference docs from DocFX-generated
 * ManagedReference YAML metadata.
 *
 * This is purpose-built for docs-v2's Docusaurus conventions (see
 * scripts/migrate-signer.mjs): `_category_.json` with a `key` field,
 * `sidebar_label`/`sidebar_position` frontmatter, `:::note` admonitions,
 * pt-BR section headings, and — critically — MDX-safe output (C# generics
 * like `IList<T>` and stray `{ }` in prose would otherwise break the build).
 *
 * It resolves the DocFX `references:` block, so member/type/parameter types
 * become friendly names with working links: internal types → relative .md
 * links, framework types (System.*) → learn.microsoft.com.
 *
 * ── Prerequisites ─────────────────────────────────────────────────────────────
 *   1. docfx 2.78+ installed (the modern .NET Foundation build).
 *   2. The library repos cloned next to this one (see ../docfx.json `src`).
 *   3. Generate the YAML first:
 *          docfx metadata docfx.json          (run from the docs-v2 root)
 *      That writes ManagedReference *.yml into ../api (the default API_SRC).
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *   node scripts/generate-api-docs.mjs [apiSrcDir] [apiOutDir]
 *
 *   apiSrcDir   DocFX YAML dir.   Default: <docs-v2>/api
 *   apiOutDir   Docusaurus dir.   Default: <docs-v2>/docs/api
 *
 * ── Output ────────────────────────────────────────────────────────────────────
 *   docs/api/_category_.json                       — top-level category
 *   docs/api/index.md                              — namespace list
 *   docs/api/<Namespace>/_category_.json           — per-namespace category
 *   docs/api/<Namespace>/index.md                  — namespace overview
 *   docs/api/<Namespace>/<TypeName>.md             — one page per type
 */

import fs   from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { load as yamlLoad } from 'js-yaml';

const SITE     = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_SRC  = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(SITE, 'api');
// Served by its own docs plugin instance (routeBasePath 'api') so the pages live
// at /api/… — language-neutral, URL-only, outside the pt/en docs tree.
const API_OUT  = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(SITE, 'api-docs');

// Prefix for `_category_.json` keys (docs-v2's sidebar component keys off this).
const KEY_PREFIX = path.basename(API_OUT);

// ── Localizable chrome ─────────────────────────────────────────────────────────
// API summaries come from the C# XML doc comments (usually English); only the
// surrounding section headings are localized. Centralised here for easy reuse.

const T = {
  rootTitle:    'Referência da API .NET',
  rootLabel:    'Referência da API',
  overview:     'Visão geral',
  namespace:    'Namespace',
  assembly:     'Assembly',
  inheritance:  'Hierarquia',
  remarks:      'Comentários',
  example:      'Exemplo',
  parameters:   'Parâmetros',
  typeParams:   'Parâmetros de tipo',
  returns:      'Retorno',
  exceptions:   'Exceções',
  members:      'Membros',
  inherited:    'Membros herdados',
  seealso:      'Veja também',
  colName:      'Nome',
  colType:      'Tipo',
  colDesc:      'Descrição',
  colCond:      'Condição',
  colValue:     'Valor',
};

// Type kinds (top-level declarations) → section heading (plural).
const TYPE_KINDS = {
  Class:     'Classes',
  Struct:    'Estruturas',
  Interface: 'Interfaces',
  Enum:      'Enumerações',
  Delegate:  'Delegates',
};

// Member kinds → section heading, in display order.
const MEMBER_SECTIONS = [
  ['Constructor', 'Construtores'],
  ['Field',       'Campos'],
  ['Property',    'Propriedades'],
  ['Method',      'Métodos'],
  ['Operator',    'Operadores'],
  ['Event',       'Eventos'],
];

// ── Load + index ────────────────────────────────────────────────────────────

/**
 * Reads every ManagedReference YAML file and builds three indexes:
 *   items     uid → item            (types and their members)
 *   types     uid → type item       (subset of items: classes/structs/…)
 *   refs      uid → reference        (friendly name + href, incl. external types)
 */
async function loadModel() {
  let entries;
  try { entries = await fs.readdir(API_SRC); }
  catch {
    console.error(`ERROR: API YAML directory not found at ${API_SRC}`);
    console.error('Run `docfx metadata docfx.json` from the docs-v2 root first.');
    process.exit(1);
  }

  const files = entries.filter(f => f.endsWith('.yml') && f !== 'toc.yml');
  const items = new Map();
  const refs  = new Map();

  for (const file of files) {
    const raw = await fs.readFile(path.join(API_SRC, file), 'utf8');
    let doc;
    try { doc = yamlLoad(raw); } catch { continue; }

    for (const item of doc?.items ?? []) {
      if (item?.uid) items.set(item.uid, item);
    }
    for (const ref of doc?.references ?? []) {
      // Prefer the richest entry (one carrying an href) when a uid recurs.
      if (ref?.uid && (!refs.has(ref.uid) || (ref.href && !refs.get(ref.uid).href))) {
        refs.set(ref.uid, ref);
      }
    }
  }

  // Index types and give each a stable { ns, file } so links are deterministic.
  const types = new Map();
  for (const item of items.values()) {
    if (item.type in TYPE_KINDS) {
      const ns   = item.namespace ?? item.parent ?? 'Global';
      const name = item.name ?? shortName(item.uid);
      types.set(item.uid, { item, ns, name, file: `${sanitizeFile(name)}.md` });
    }
  }

  return { items, types, refs };
}

// ── Small helpers ─────────────────────────────────────────────────────────────

const shortName = uid => String(uid).split('.').pop().replace(/`\d+/g, '');

// Filesystem-safe page name for a type. Generic params become readable, legal
// segments: `SignatureExplorer2<TResult>` → `SignatureExplorer2-TResult`,
// `Foo<T, U>` → `Foo-T-U`. Must be computed once (in loadModel) so links match.
const sanitizeFile = name => String(name)
  .replace(/`\d+/g, '')
  .replace(/\s*,\s*/g, '-')
  .replace(/</g, '-')
  .replace(/>/g, '')
  .replace(/[:"/\\|?*]/g, '_')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '');

const slug = s => String(s)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const decodeEntities = s => String(s)
  .replace(/&lt;/g,   '<')
  .replace(/&gt;/g,   '>')
  .replace(/&quot;/g, '"')
  .replace(/&#3?9;|&apos;/g, "'")
  .replace(/&amp;/g,  '&');

// Escape the characters MDX would try to parse as JSX/expressions. Applied only
// to free prose — never to code spans/fences (which we build ourselves).
const escMdx = s => String(s)
  .replace(/[{}]/g, c => (c === '{' ? '&#123;' : '&#125;'))
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// Inline code span. Type names with generics are safe inside backticks.
const code = s => '`' + String(s).replace(/`/g, '') + '`';

// Markdown link. URLs with parentheses (common in MS Learn anchors, e.g.
// `…equals(system-object)`) are wrapped in angle brackets so the first `)`
// doesn't close the link early.
const mdLink = (text, url) => `[${text}](${/[()]/.test(url) ? `<${url}>` : url})`;

function frontmatter(label, position) {
  const pos = position != null ? `sidebar_position: ${position}\n` : '';
  return `---\nsidebar_label: "${String(label).replace(/"/g, '\\"')}"\n${pos}---\n\n`;
}

// ── Cross-reference resolution ──────────────────────────────────────────────

/**
 * Relative .md path from a page in `curNs` (null = the root index) to the type
 * page that owns `uid`. Returns null when the uid is not one of our generated
 * types (e.g. a framework type or a type from a non-documented assembly).
 */
function relTypePath(curNs, uid, model) {
  const t = model.types.get(uid);
  if (!t) return null;
  if (curNs === null) return `./${t.ns}/${t.file}`;          // from docs/api/index.md
  return t.ns === curNs ? `./${t.file}` : `../${t.ns}/${t.file}`;
}

/** Friendly display name for any uid (our types, members, framework types). */
function displayName(uid, model) {
  return model.refs.get(uid)?.name ?? model.types.get(uid)?.name ?? shortName(uid);
}

/**
 * Resolve a uid to a URL, or null if it can't be linked.
 *   - our type            → relative .md
 *   - our member          → owning type's .md + #anchor
 *   - external (System.*) → learn.microsoft.com (from refs.href)
 */
function urlForUid(uid, curNs, model) {
  if (model.types.has(uid)) return relTypePath(curNs, uid, model);

  const member = model.items.get(uid);
  if (member && member.parent && model.types.has(member.parent)) {
    const base = relTypePath(curNs, member.parent, model);
    return base ? `${base}#${slug(member.id ?? shortName(uid))}` : null;
  }

  // Only link an external ref if its href is an absolute URL (e.g. MS Learn).
  // DocFX also emits local `.html` hrefs for composite types (PKCertificate[],
  // IList<T>) and types from non-documented assemblies — those have no page
  // here, so they render as a plain code span rather than a broken link.
  const ref = model.refs.get(uid);
  if (ref?.href && /^https?:\/\//.test(ref.href)) return ref.href;
  return null;
}

/** A uid rendered as a linked code span (or a plain code span when unlinkable). */
function refLink(uid, curNs, model) {
  const span = code(displayName(uid, model));
  const url  = urlForUid(uid, curNs, model);
  return url ? mdLink(span, url) : span;
}

/** Strip a DocFX commentId prefix (`T:`, `M:`, `P:`, `!:`, …) to a bare uid. */
const bareUid = cref => String(cref).replace(/^[A-Za-z!]:/, '');

// ── XML doc comment → MDX ─────────────────────────────────────────────────────

/**
 * Converts a C# XML doc fragment (summary/remarks/description) into MDX-safe
 * markdown. Inline tags become links/code, then any leftover prose is escaped.
 * Protected fragments (code, links) are stashed behind sentinels so escaping
 * never touches them.
 */
function renderDoc(raw, curNs, model) {
  if (raw == null) return '';
  let s = String(raw);

  const stash = [];
  const MARK = String.fromCharCode(1);
  const keep = md => MARK + (stash.push(md) - 1) + MARK;

  // <code> … </code>  →  fenced block
  s = s.replace(/<code(?:\s[^>]*)?>([\s\S]*?)<\/code>/gi, (_, inner) =>
    keep('\n\n```csharp\n' + decodeEntities(inner).replace(/^\n+|\n+$/g, '') + '\n```\n\n'));

  // <c> … </c>  →  inline code
  s = s.replace(/<c>([\s\S]*?)<\/c>/gi, (_, inner) => keep(code(decodeEntities(inner).trim())));

  // <see cref="…"/> / <seealso cref="…"/>  →  linked code span
  s = s.replace(/<(?:see|seealso)\s+cref="([^"]+)"\s*\/?>(?:<\/(?:see|seealso)>)?/gi,
    (_, cref) => keep(refLink(bareUid(cref), curNs, model)));

  // <xref href="UID"…></xref> / <xref uid="UID"/>  (docfx-resolved cref)  →  linked code span
  s = s.replace(/<xref\s+[^>]*?(?:href|uid)="([^"]+)"[^>]*?>(?:<\/xref>)?/gi,
    (_, uid) => keep(refLink(bareUid(uid), curNs, model)));

  // <see langword="…"/>  →  inline code (true/false/null/…)
  s = s.replace(/<see\s+langword="([^"]+)"\s*\/?>(?:<\/see>)?/gi, (_, lw) => keep(code(lw)));

  // <see href="…">text</see> or <see href="…"/>  →  markdown link
  s = s.replace(/<see\s+href="([^"]+)"\s*(?:\/>|>([\s\S]*?)<\/see>)/gi,
    (_, href, text) => keep(mdLink((text || href).trim(), href)));

  // <paramref/> <typeparamref/>  →  inline code
  s = s.replace(/<(?:paramref|typeparamref)\s+name="([^"]+)"\s*\/?>/gi, (_, n) => keep(code(n)));

  // <list> … </list>  →  markdown bullets
  s = s.replace(/<list[^>]*>([\s\S]*?)<\/list>/gi, (_, inner) => {
    const items = [...inner.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m =>
      '- ' + m[1].replace(/<\/?(?:term|description)>/gi, ' ').replace(/\s+/g, ' ').trim());
    return keep('\n\n' + items.join('\n') + '\n\n');
  });

  // <para> … </para>  →  paragraph break
  s = s.replace(/<para>\s*([\s\S]*?)\s*<\/para>/gi, (_, inner) => `\n\n${inner}\n\n`);
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // Drop any remaining tags, decode entities, then MDX-escape the bare prose.
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  s = escMdx(decodeEntities(s));

  // Restore protected fragments and tidy whitespace.
  s = s.replace(new RegExp(MARK + '(\\d+)' + MARK, 'g'), (_, i) => stash[+i]);
  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

const firstLine = txt => String(txt).split('\n').map(l => l.trim()).find(Boolean) ?? '';

// ── Member rendering ────────────────────────────────────────────────────────

function renderMember(item, curNs, model) {
  const out = [];
  const name = item.name ?? shortName(item.uid);

  // Code-styled heading with an explicit, stable anchor for cross-refs.
  out.push(`### ${code(name)} {#${slug(item.id ?? name)}}`, '');

  if (item.summary) out.push(renderDoc(item.summary, curNs, model), '');

  const sig = item.syntax?.content;
  if (sig) out.push('```csharp', sig.trim(), '```', '');

  // Parameters
  const params = item.syntax?.parameters ?? [];
  if (params.length) {
    out.push(`**${T.parameters}**`, '', `| ${T.colName} | ${T.colType} | ${T.colDesc} |`, '|---|---|---|');
    for (const p of params)
      out.push(`| ${code(p.id ?? '')} | ${p.type ? refLink(p.type, curNs, model) : ''} | ${cell(p.description, curNs, model)} |`);
    out.push('');
  }

  // Type parameters
  const tparams = item.syntax?.typeParameters ?? [];
  if (tparams.length) {
    out.push(`**${T.typeParams}**`, '', `| ${T.colName} | ${T.colDesc} |`, '|---|---|');
    for (const tp of tparams) out.push(`| ${code(tp.id ?? '')} | ${cell(tp.description, curNs, model)} |`);
    out.push('');
  }

  // Return value (skip for constructors)
  const ret = item.syntax?.return;
  if (ret && item.type !== 'Constructor') {
    const type = ret.type ? refLink(ret.type, curNs, model) : '';
    const desc = ret.description ? ` — ${renderDoc(ret.description, curNs, model)}` : '';
    out.push(`**${T.returns}**`, '', `${type}${desc}`, '');
  }

  // Exceptions
  if (item.exceptions?.length) {
    out.push(`**${T.exceptions}**`, '', `| ${T.colType} | ${T.colCond} |`, '|---|---|');
    for (const ex of item.exceptions)
      out.push(`| ${ex.type ? refLink(ex.type, curNs, model) : ''} | ${cell(ex.description, curNs, model)} |`);
    out.push('');
  }

  if (item.remarks) out.push(`**${T.remarks}**`, '', renderDoc(item.remarks, curNs, model), '');

  return out.join('\n');
}

// Table-cell text: render doc, then neutralise pipes and newlines.
const cell = (raw, curNs, model) =>
  renderDoc(raw, curNs, model).replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();

// ── Type page ─────────────────────────────────────────────────────────────────

function renderTypePage(t, model) {
  const { item, ns, name } = t;
  const curNs = ns;
  const out = [];

  out.push(`# ${escMdx(name)}`, '');
  out.push(`**${T.namespace}:** ${code(ns)}  `);
  if (item.assemblies?.length) out.push(`**${T.assembly}:** ${code(item.assemblies[0])}  `);
  out.push(`_${item.type}_`, '');

  if (item.summary) out.push(renderDoc(item.summary, curNs, model), '');

  if (item.syntax?.content) out.push('```csharp', item.syntax.content.trim(), '```', '');

  // Inheritance chain (base types → this type).
  if (item.inheritance?.length) {
    const chain = [...item.inheritance.map(u => refLink(u, curNs, model)), code(name)].join(' → ');
    out.push(`**${T.inheritance}:** ${chain}`, '');
  }

  if (item.remarks) out.push(`## ${T.remarks}`, '', renderDoc(item.remarks, curNs, model), '');
  if (item.example?.length) {
    out.push(`## ${T.example}`, '');
    for (const ex of [].concat(item.example)) out.push(renderDoc(ex, curNs, model), '');
  }

  // Enums: a single value table instead of member sections.
  if (item.type === 'Enum') {
    const fields = (item.children ?? []).map(uid => model.items.get(uid)).filter(Boolean);
    if (fields.length) {
      out.push(`## ${T.members}`, '', `| ${T.colName} | ${T.colDesc} |`, '|---|---|');
      for (const f of fields)
        out.push(`| ${code(f.name ?? shortName(f.uid))} | ${cell(f.summary, curNs, model)} |`);
      out.push('');
    }
    return finishPage(out, item, curNs, model);
  }

  // Group declared members by kind.
  const byKind = {};
  for (const uid of item.children ?? []) {
    const child = model.items.get(uid);
    if (!child) continue;
    (byKind[child.type] ??= []).push(child);
  }
  for (const [kind, heading] of MEMBER_SECTIONS) {
    const members = byKind[kind];
    if (!members?.length) continue;
    out.push(`## ${heading}`, '');
    members.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    for (const m of members) out.push(renderMember(m, curNs, model), '', '---', '');
  }

  return finishPage(out, item, curNs, model);
}

// Inherited members + See also, shared by all type pages.
function finishPage(out, item, curNs, model) {
  if (item.inheritedMembers?.length) {
    out.push(`## ${T.inherited}`, '');
    out.push(item.inheritedMembers.map(u => refLink(u, curNs, model)).join(', '), '');
  }
  const seealso = item.seealso ?? [];
  if (seealso.length) {
    out.push(`## ${T.seealso}`, '');
    for (const sa of seealso) {
      const uid = sa.linkId ?? sa.uid ?? (sa.commentId && bareUid(sa.commentId));
      if (uid) out.push(`- ${refLink(uid, curNs, model)}`);
      else if (sa.altText && sa.href) out.push(`- ${mdLink(sa.altText, sa.href)}`);
    }
    out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

// ── Namespace overview + root index ───────────────────────────────────────────

function renderNamespaceIndex(ns, typesInNs, nsSummary, model) {
  const out = [`# ${escMdx(ns)}`, ''];
  if (nsSummary) out.push(renderDoc(nsSummary, ns, model), '');

  for (const [kind, heading] of Object.entries(TYPE_KINDS)) {
    const group = typesInNs.filter(t => t.item.type === kind);
    if (!group.length) continue;
    group.sort((a, b) => a.name.localeCompare(b.name));
    out.push(`## ${heading}`, '', `| ${T.colName} | ${T.colDesc} |`, '|---|---|');
    for (const t of group)
      out.push(`| [${code(t.name)}](./${t.file}) | ${cell(t.item.summary, ns, model)} |`);
    out.push('');
  }
  return out.join('\n');
}

function renderRootIndex(namespaces, nsSummaries, model) {
  const out = [`# ${T.rootTitle}`, '', `| ${T.namespace} | ${T.colDesc} |`, '|---|---|'];
  for (const ns of [...namespaces].sort())
    out.push(`| [${escMdx(ns)}](./${ns}/index.md) | ${cell(nsSummaries.get(ns), null, model)} |`);
  out.push('');
  return out.join('\n');
}

// ── Main ───────────────────────────────────────────────────────────────────────

console.log('Loading DocFX ManagedReference YAML…');
const model = await loadModel();
console.log(`  ${model.items.size} items, ${model.types.size} types, ${model.refs.size} references.`);

// Group types by namespace; collect namespace summaries (from Namespace items).
const byNamespace  = new Map();   // ns → [ {item, ns, name, file} ]
const nsSummaries  = new Map();   // ns → summary
for (const t of model.types.values()) {
  (byNamespace.get(t.ns) ?? byNamespace.set(t.ns, []).get(t.ns)).push(t);
}
for (const item of model.items.values()) {
  if (item.type === 'Namespace' && item.summary) nsSummaries.set(item.uid, item.summary);
}

if (!byNamespace.size) {
  console.error('No types found. Did `docfx metadata` produce ManagedReference YAML?');
  process.exit(1);
}

// Fresh output tree.
await fs.rm(API_OUT, { recursive: true, force: true });
await fs.mkdir(API_OUT, { recursive: true });

// Top-level category + index.
await fs.writeFile(
  path.join(API_OUT, '_category_.json'),
  JSON.stringify({ label: T.rootLabel, key: KEY_PREFIX, position: 99 }, null, 2) + '\n', 'utf8');
await fs.writeFile(
  path.join(API_OUT, 'index.md'),
  frontmatter(T.overview, 0) + renderRootIndex(byNamespace.keys(), nsSummaries, model), 'utf8');

let typeCount = 0;
for (const [ns, typesInNs] of [...byNamespace].sort((a, b) => a[0].localeCompare(b[0]))) {
  const nsDir = path.join(API_OUT, ns);
  await fs.mkdir(nsDir, { recursive: true });

  await fs.writeFile(
    path.join(nsDir, '_category_.json'),
    JSON.stringify({ label: ns, key: `${KEY_PREFIX}/${ns}` }, null, 2) + '\n', 'utf8');

  await fs.writeFile(
    path.join(nsDir, 'index.md'),
    frontmatter(ns, 0) + renderNamespaceIndex(ns, typesInNs, nsSummaries.get(ns), model), 'utf8');

  for (const t of typesInNs) {
    await fs.writeFile(path.join(nsDir, t.file), frontmatter(t.name) + renderTypePage(t, model), 'utf8');
    process.stdout.write('.');
    typeCount++;
  }
  console.log(`\n  [${ns}] ${typesInNs.length} types`);
}

console.log(`\nDone. ${typeCount} type pages across ${byNamespace.size} namespaces → ${API_OUT}`);
