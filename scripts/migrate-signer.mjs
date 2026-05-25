/**
 * Migrates Signer docs (pt-BR and en) from DocFX format to Docusaurus.
 *
 * Usage:  node scripts/migrate-signer.mjs
 *
 * Output:
 *   pt-BR  →  docs/signer/
 *   en     →  docs/en/signer/
 */

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(SITE, '..');

const LOCALES = [
  { src: `${REPO}/docs.pt-br/articles/signer`, dest: `${SITE}/docs/signer`,    name: 'pt-BR' },
  { src: `${REPO}/docs.en-us/articles/signer`, dest: `${SITE}/docs/en/signer`, name: 'en'    },
];

const SKIP_DIRS = new Set(['includes', 'images']);

// ── Sidebar label overrides ───────────────────────────────────────────────────
// Keys are paths relative to the signer root (dirs without trailing slash,
// files with .md extension).

const LABELS = {
  'pt-BR': {
    dirs: {
      'on-premises':                     'On premises',
      'on-premises/windows':             'Setup em Windows Server',
      'on-premises/linux':               'Setup em Linux',
      'on-premises/linux/troubleshoot':  'Resolução de problemas',
      'on-premises/docker':              'Setup em Docker',
      'on-premises/docker/docker-swarm': 'Docker Swarm',
      'on-premises/azure':               'Setup em Azure App Services',
      'user-guide':                      'Manual do usuário',
      'user-guide/sys-admin':            'Administrador do sistema',
    },
    files: {
      'index.md':                                'Signer',
      'changelog.md':                            'Changelog',
      'embedded-signature.md':                   'Assinatura Embutida',
      'integration-guide.md':                    'Guia de Integração',
      'on-premises/index.md':                    'On premises',
      'on-premises/access-control.md':           'Controle de acesso',
      'on-premises/administration.md':           'Integração para administração',
      'on-premises/blob-storage.md':             'Configuração do Blob Storage',
      'on-premises/consumption-monitoring.md':   'Monitoramento de consumo',
      'on-premises/customization.md':            'Personalização',
      'on-premises/payments.md':                 'Pagamentos',
      'on-premises/pix-authentication.md':       'Autenticação Pix',
      'on-premises/prepare-database.md':         'Preparando o banco de dados',
      'on-premises/registered-emails.md':        'Emails Registrados',
      'on-premises/serilog.md':                  'Configuração do Serilog',
      'on-premises/settings.md':                 'Configurações',
      'on-premises/update-20.md':                'Atualizando para 2.x',
      'on-premises/whatsapp.md':                 'Integração com Whatsapp',
      'on-premises/zoom.md':                     'Zoom',
      'user-guide/index.md':                     'Manual do usuário',
      'user-guide/gen-docs.md':                  'Gerando documentos',
      'user-guide/sys-admin/index.md':           'Administrador do sistema',
      'user-guide/sys-admin/add-user.md':        'Adicionando usuários',
      'user-guide/sys-admin/browse-docs.md':     'Navegando em documentos',
      'user-guide/sys-admin/del-docs.md':        'Excluindo documentos',
    },
  },
  en: {
    dirs: {
      'on-premises':                     'On premises',
      'on-premises/windows':             'Setup on Windows Server',
      'on-premises/linux':               'Setup on Linux',
      'on-premises/linux/troubleshoot':  'Troubleshooting',
      'on-premises/docker':              'Setup on Docker',
      'on-premises/docker/docker-swarm': 'Docker Swarm',
      'on-premises/azure':               'Setup on Azure App Services',
      'user-guide':                      'User Guide',
      'user-guide/sys-admin':            'System Administrator',
    },
    files: {
      'index.md':                                'Signer',
      'changelog.md':                            'Changelog',
      'embedded-signature.md':                   'Embedded Signature',
      'integration-guide.md':                    'Integration Guide',
      'on-premises/index.md':                    'On premises',
      'on-premises/access-control.md':           'Access Control',
      'on-premises/administration.md':           'Administration Integration',
      'on-premises/blob-storage.md':             'Blob Storage Configuration',
      'on-premises/consumption-monitoring.md':   'Consumption Monitoring',
      'on-premises/customization.md':            'Customization',
      'on-premises/payments.md':                 'Payments',
      'on-premises/pix-authentication.md':       'Pix Authentication',
      'on-premises/prepare-database.md':         'Preparing the Database',
      'on-premises/registered-emails.md':        'Registered Emails',
      'on-premises/serilog.md':                  'Serilog Configuration',
      'on-premises/settings.md':                 'Settings',
      'on-premises/update-20.md':                'Updating to 2.x',
      'on-premises/whatsapp.md':                 'WhatsApp Integration',
      'on-premises/zoom.md':                     'Zoom',
      'user-guide/index.md':                     'User Guide',
      'user-guide/gen-docs.md':                  'Generating Documents',
      'user-guide/sys-admin/index.md':           'System Administrator',
      'user-guide/sys-admin/add-user.md':        'Adding Users',
      'user-guide/sys-admin/browse-docs.md':     'Browsing Documents',
      'user-guide/sys-admin/del-docs.md':        'Deleting Documents',
    },
  },
};

// ── Sidebar position overrides (matches classic docs toc.md order) ───────────
// Positions are relative to siblings within the same parent directory.

const POSITIONS = {
  dirs: {
    'on-premises':                     2,
    'on-premises/windows':             2,
    'on-premises/linux':               3,
    'on-premises/linux/troubleshoot':  4,
    'on-premises/docker':              4,
    'on-premises/docker/docker-swarm': 2,
    'on-premises/azure':               5,
    'user-guide':                      3,
    'user-guide/sys-admin':            3,
  },
  files: {
    'index.md':                                    1,
    'integration-guide.md':                        4,
    'embedded-signature.md':                       5,
    'changelog.md':                                6,
    'on-premises/index.md':                        1,
    'on-premises/prepare-database.md':             6,
    'on-premises/blob-storage.md':                 7,
    'on-premises/serilog.md':                      8,
    'on-premises/settings.md':                     9,
    'on-premises/access-control.md':               10,
    'on-premises/customization.md':                11,
    'on-premises/registered-emails.md':            12,
    'on-premises/payments.md':                     13,
    'on-premises/pix-authentication.md':           14,
    'on-premises/zoom.md':                         15,
    'on-premises/whatsapp.md':                     16,
    'on-premises/administration.md':               17,
    'on-premises/consumption-monitoring.md':       18,
    'on-premises/update-20.md':                    19,
    'on-premises/windows/index.md':                1,
    'on-premises/linux/index.md':                  1,
    'on-premises/linux/install-ubuntu.md':         2,
    'on-premises/linux/update.md':                 3,
    'on-premises/linux/troubleshoot/index.md':     1,
    'on-premises/linux/troubleshoot/check-logs.md': 2,
    'on-premises/docker/index.md':                 1,
    'on-premises/azure/index.md':                  1,
    'user-guide/index.md':                         1,
    'user-guide/gen-docs.md':                      2,
    'user-guide/sys-admin/index.md':               1,
    'user-guide/sys-admin/add-user.md':            2,
    'user-guide/sys-admin/browse-docs.md':         3,
    'user-guide/sys-admin/del-docs.md':            4,
  },
};

// ── Include resolution ────────────────────────────────────────────────────────

async function resolveIncludes(content, filePath, visited = new Set()) {
  if (visited.has(filePath)) return content;
  const next = new Set([...visited, filePath]);
  const dir  = path.dirname(filePath);
  const re   = /\[!include\[([^\]]*)\]\(([^)]+)\)\]/;
  let result = content;
  let safety = 0, m;
  while ((m = re.exec(result)) !== null && safety++ < 200) {
    const resolved = path.resolve(dir, m[2]);
    let replacement;
    try {
      const raw = await fs.readFile(resolved, 'utf8');
      // Normalize CRLF so admonition regex works on inlined content too
      const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      replacement = await resolveIncludes(normalized.trim(), resolved, next);
    } catch {
      replacement = `\n{/* include: ${m[2]} */}\n`;
    }
    result = result.slice(0, m.index) + replacement + result.slice(m.index + m[0].length);
  }
  return result;
}

// ── Admonition conversion ─────────────────────────────────────────────────────

function transformAdmonitions(content) {
  const lines = content.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^>\s*\[!(NOTE|WARNING|TIP|IMPORTANT|CAUTION)\]\s*$/i);
    if (m) {
      const raw  = m[1].toLowerCase();
      const type = raw === 'important' ? 'info' : raw === 'caution' ? 'warning' : raw;
      out.push(`:::${type}`);
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        const body = lines[i].startsWith('> ') ? lines[i].slice(2)
                   : lines[i] === '>'          ? ''
                   :                             lines[i].slice(1);
        out.push(body);
        i++;
      }
      out.push(':::');
      out.push('');
    } else {
      out.push(lines[i++]);
    }
  }
  return out.join('\n');
}

// ── Other transforms ──────────────────────────────────────────────────────────

const stripBOM         = s => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
const normalizeCRLF    = s => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const stripDocFxFrontmatter = s => {
  const m = s.match(/^---\n([\s\S]*?)\n---\n/);
  return (m && !/^title:/m.test(m[1])) ? s.slice(m[0].length) : s;
};

function normaliseImages(content, srcFilePath) {
  const srcDir  = path.dirname(srcFilePath);
  const repoFwd = REPO.replace(/\\/g, '/');

  return content.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt, imgPath) => {
    if (imgPath.startsWith('/') || imgPath.startsWith('http')) return match;

    const resolved = path.resolve(srcDir, imgPath).replace(/\\/g, '/');

    // Global images/ at repo root → /images/...
    const globalPrefix = `${repoFwd}/images/`;
    if (resolved.startsWith(globalPrefix))
      return `![${alt}](/images/${resolved.slice(globalPrefix.length)})`;

    // Signer article-local images → /images/signer/...
    for (const lang of ['docs.en-us', 'docs.pt-br']) {
      const localPrefix = `${repoFwd}/${lang}/articles/signer/images/`;
      if (resolved.startsWith(localPrefix))
        return `![${alt}](/images/signer/${resolved.slice(localPrefix.length)})`;
    }

    return match;
  });
}

const convertPreBlocks = s =>
  s.replace(/<pre>([\s\S]*?)<\/pre>/gi, (_, inner) => '```\n' + inner.trim() + '\n```');

const convertHtmlComments = s =>
  s.replace(/<!--([\s\S]*?)-->/g, (_, inner) => {
    const oneLine = inner.replace(/\s+/g, ' ').trim();
    return oneLine ? `{/* ${oneLine} */}` : '';
  });

const withFrontMatter = (content, label, position) => {
  const posLine = position != null ? `sidebar_position: ${position}\n` : '';
  return `---\nsidebar_label: "${label}"\n${posLine}---\n\n${content.trimStart()}`;
};

// ── Stub / unavailable page ───────────────────────────────────────────────────

const relPathToDocSegment = relPath =>
  relPath.replace(/\/index\.md$/, '/').replace(/\.md$/, '');

function buildUnavailablePage(title, locale, relPath) {
  const seg   = relPathToDocSegment(relPath);
  const ptUrl = `/docusaurus/docs/signer/${seg}`;
  const enUrl = `/docusaurus/docs/en/signer/${seg}`;

  if (locale === 'pt-BR') {
    return `# ${title}\n\n:::warning Indisponível\n\nDesculpe, este artigo ainda não está disponível no idioma selecionado. Por favor escolha uma das versões disponíveis:\n\n- [English](${enUrl})\n\n:::\n`;
  }
  return `# ${title}\n\n:::warning Unavailable\n\nSorry, this article is not yet available in the selected language. Please choose between one of the available versions:\n\n- [Português (Brasil)](${ptUrl})\n\n:::\n`;
}

// ── File transformation ───────────────────────────────────────────────────────

async function transformFile(src, dest, locale, relPath) {
  let c = await fs.readFile(src, 'utf8');
  c = stripBOM(c);
  c = normalizeCRLF(c);

  const sidebarLabel    = LABELS[locale]?.files?.[relPath];
  const sidebarPosition = POSITIONS.files?.[relPath];

  if (c.includes('data-alt-locales')) {
    const titleMatch = c.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Página';
    c = buildUnavailablePage(title, locale, relPath);
    if (sidebarLabel) c = withFrontMatter(c, sidebarLabel, sidebarPosition);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, c, 'utf8');
    return;
  }

  c = stripDocFxFrontmatter(c);
  c = await resolveIncludes(c, src);
  c = transformAdmonitions(c);
  c = normaliseImages(c, src);
  c = convertPreBlocks(c);
  c = convertHtmlComments(c);
  if (sidebarLabel) c = withFrontMatter(c, sidebarLabel, sidebarPosition);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, c, 'utf8');
}

// ── Directory walk ────────────────────────────────────────────────────────────

async function walkDir(srcDir, destDir, locale, relBase = '') {
  let entries;
  try { entries = await fs.readdir(srcDir, { withFileTypes: true }); }
  catch { return; }

  for (const e of entries) {
    const src     = `${srcDir}/${e.name}`;
    const dest    = `${destDir}/${e.name}`;
    const relPath = relBase ? `${relBase}/${e.name}` : e.name;

    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await fs.mkdir(dest, { recursive: true });

      const catFile = `${dest}/_category_.json`;
      const exists  = await fs.readFile(catFile, 'utf8').catch(() => null);
      if (!exists) {
        // Use explicit label if defined, otherwise derive from directory name
        const label    = LABELS[locale]?.dirs?.[relPath]
          ?? e.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const position = POSITIONS.dirs?.[relPath];
        const catObj   = { label, key: `signer/${relPath}`, ...(position != null && { position }) };
        await fs.writeFile(catFile, JSON.stringify(catObj, null, 2) + '\n', 'utf8');
      }

      await walkDir(src, dest, locale, relPath);

    } else if (e.isFile() && e.name.endsWith('.md')) {
      process.stdout.write('.');
      await transformFile(src, dest, locale, relPath);

    } else if (e.isFile() && /\.(png|jpe?g|gif|svg|webp)$/i.test(e.name)) {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
    }
  }
}

// ── Copy global images ────────────────────────────────────────────────────────

async function copyDir(src, dest) {
  let entries;
  try { entries = await fs.readdir(src, { withFileTypes: true }); }
  catch { return; }
  await fs.mkdir(dest, { recursive: true });
  for (const e of entries) {
    const s = `${src}/${e.name}`;
    const d = `${dest}/${e.name}`;
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

// Clean output dirs so stale files don't linger between runs
for (const { dest } of LOCALES) {
  await fs.rm(dest, { recursive: true, force: true });
  await fs.mkdir(dest, { recursive: true });
}

for (const { src, dest, name } of LOCALES) {
  console.log(`\n[${name}]  ${src}`);
  console.log(`       →  ${dest}\n`);
  await walkDir(src, dest, name); //
  console.log('');
}

// Copy signer article-local images from both locales into static/images/signer/
// (pt-BR first, en-US second so en-US-only files like *-en-us.png are included)
console.log('\nCopying signer article images...');
const signerStaticDest = `${SITE}/static/images/signer`;
await fs.rm(signerStaticDest, { recursive: true, force: true });
for (const lang of ['docs.pt-br', 'docs.en-us']) {
  await copyDir(`${REPO}/${lang}/articles/signer/images`, signerStaticDest);
}

// Copy global shared images (images/windows/, images/spa-config/, images/signer/flutter/, etc.)
console.log('Copying global images...');
await copyDir(`${REPO}/images`, `${SITE}/static/images`);

console.log('Done.');
