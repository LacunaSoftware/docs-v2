/**
 * Regenerates the machine-derived parts of the Signer customization docs:
 *
 *   docs/signer/on-premises/configuracao/personalizacao/temas.md     (and docs-en/…)
 *       the complete theme gallery, from the theme bundles in the Signer repo
 *
 *   docs/signer/on-premises/configuracao/personalizacao/emails.md    (and docs-en/…)
 *       the CustomResources key lists, from the .resx files in the Signer repo
 *       (only the block between the BEGIN/END generated markers is rewritten)
 *
 * Both lists used to be maintained by hand and drifted: when this script was
 * written the docs listed 40 themes while the product shipped 44, and one of
 * the missing ones (electric-purple-indigo) had been out since 1.39.0, from 2021.
 *
 * Usage (the Signer repo must be checked out locally):
 *
 *     node scripts/generate-signer-customization.mjs [--signer-repo ../signer] [--check]
 *
 * --check exits non-zero instead of writing, for CI or a pre-release check.
 *
 * Theme display names and "since" versions can't be derived from the Signer
 * repo (the older palettes live in the shared lacuna-spa package), so they are
 * kept in THEMES below. A theme bundle with no entry here is an error: add the
 * name and the version it shipped in, and capture its sample image into
 * static/images/signer/themes/<code>.png.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// code → [display name, version it first shipped in (null = since the earliest versions)]
const THEMES = {
  apb: ['amaranth-pacific-blue', null],
  acr: ['amazon-cornell-red', null],
  alg: ['azure-lime-green', null],
  bvr: ['blue-venetian-red', '1.36.0'],
  cgo: ['castleton-green-orange', '1.10.1'],
  clg: ['cerulean-lime-green', null],
  cam: ['charcoal-amazonite', null],
  cof: ['charcoal-orange-flame', '1.26.1'],
  ctv: ['chartreuse-traditional-violet', '1.44.1'],
  clc: ['cobalt-lemon-curry', null],
  cpg: ['cyan-process-green', '2.0.0'],
  dcg: ['dark-cerulean-green', null],
  dgy: ['dark-grey-yellow', null],
  dir: ['dark-indigo-red', null],
  dmg: ['davys-maximum-green', '1.49.0'],
  djp: ['deep-jungle-princeton', '1.59.0'],
  dpb: ['dim-palatinate-blue', '1.58.1'],
  epi: ['electric-purple-indigo', '1.39.0'],
  ecb: ['eminence-cornflower-blue', '1.39.1'],
  eva: ['english-vermillion-arsenic', null],
  frv: ['folly-russian-violet', '1.68.0'],
  fbp: ['french-blue-pink', '2.4.8'],
  gvb: ['generic-viridian-blue', '1.33.0'],
  gdc: ['green-dark-coral', null],
  gmc: ['gun-metal-camel', '2.9.2'],
  idg: ['independence-green', null],
  ioa: ['international-orange-apricot', '1.33.0'],
  iog: ['international-orange-green', '1.31.0'],
  mse: ['metallic-seaweed-emerald', null],
  oco: ['onyx-carrot-orange', '1.31.0'],
  osg: ['onyx-satin-gold', null],
  obc: ['oregon-blue-cadet', '2.0.0'],
  obg: ['oxford-blue-green', '1.10.1'],
  pps: ['persian-plum-sand', '1.10.4'],
  pbg: ['prussian-blue-green', '2.3.0'],
  qbm: ['queen-blue-mint', null],
  scy: ['space-cadet-yellow', '1.34.0'],
  sgy: ['sea-green-yellow', '2.0.0'],
  seb: ['silver-eerie-black', '1.54.0'],
  tbg: ['teal-blue-gold', null],
  vgy: ['viridian-green-yellow', '1.10.2'],
  vsb: ['vivid-sky-blue', '1.44.0'],
  yby: ['yale-blue-yellow', '1.51.0'],
  zuo: ['zomp-ut-orange', '1.56.0'],
};

// Localizer → .resx path inside the Signer repo. The localizer names are the
// keys accepted under CustomResources__Localizers__ (enum CustomLocalizers).
const LOCALIZERS = {
  MailFormatter: 'Site/Resources/Services/MailFormatter.pt.resx',
  NotificationRepository: 'Site/Resources/Business/Repositories/NotificationRepository.pt.resx',
  NotificationService: 'Site/Resources/Business/NotificationService.pt.resx',
};

// resx entries added by the designer, not localizable strings.
const RESX_NOISE = new Set(['Name1', 'Color1', 'Bitmap1', 'Icon1']);

const LOCALES = {
  pt: {
    dir: 'docs',
    themesLabel: 'Temas disponíveis',
    themesTitle: 'Temas disponíveis',
    intro:
      'Cada tema é identificado por um **código de três letras**. Esse código é o valor informado à equipe de\n' +
      'implantação para trocar o tema da instância, e também o valor aceito pelo parâmetro `theme` do widget\n' +
      'de [Assinatura Embutida](../../../apis/embedded-signature.md).\n\n' +
      'Além dos temas abaixo, existe o tema `default`:',
    listHeading: 'Lista',
    tableHeader: '| Código | Tema | Desde |',
    noVersionNote:
      ':::note\nTemas sem versão indicada existem desde as primeiras versões do Signer.\n:::',
    galleryHeading: 'Galeria',
    noImage: ':::note\nAmostra deste tema ainda não disponível.\n:::',
    keysSummary: (name, n) => `${name} (${n} chaves)`,
  },
  en: {
    dir: 'docs-en',
    themesLabel: 'Available themes',
    themesTitle: 'Available themes',
    intro:
      'Each theme is identified by a **three-letter code**. That code is the value you give the deployment\n' +
      'team to change the instance theme, and also the value accepted by the `theme` parameter of the\n' +
      '[Embedded Signature](../../../apis/embedded-signature.md) widget.\n\n' +
      'Besides the themes below, there is the `default` theme:',
    listHeading: 'List',
    tableHeader: '| Code | Theme | Since |',
    noVersionNote:
      ':::note\nThemes with no version indicated have existed since the earliest Signer versions.\n:::',
    galleryHeading: 'Gallery',
    noImage: ':::note\nSample for this theme is not available yet.\n:::',
    keysSummary: (name, n) => `${name} (${n} keys)`,
  },
};

const PAGE_DIR = 'signer/on-premises/configuracao/personalizacao';
const BEGIN = '{/* BEGIN generated: custom-resources-keys';
const END = '{/* END generated: custom-resources-keys */}';

function parseArgs() {
  const argv = process.argv.slice(2);
  const repoFlag = argv.indexOf('--signer-repo');
  return {
    signerRepo: path.resolve(
      SITE,
      repoFlag >= 0 ? argv[repoFlag + 1] : process.env.SIGNER_REPO ?? '../signer'
    ),
    check: argv.includes('--check'),
  };
}

function readThemeCodes(signerRepo) {
  const dir = path.join(signerRepo, 'Site/ClientApp/src/themes/build');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.scss') && !f.startsWith('_'))
    .map((f) => path.basename(f, '.scss'))
    .sort();
}

function readResourceKeys(signerRepo, relPath) {
  const xml = fs.readFileSync(path.join(signerRepo, relPath), 'utf8');
  return [...xml.matchAll(/<data name="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((k) => !RESX_NOISE.has(k))
    .sort();
}

function renderThemesPage(locale, codes) {
  const L = LOCALES[locale];
  // Listed by theme name, which is how a reader scans the gallery.
  const entries = codes
    .map((code) => [code, ...THEMES[code]])
    .sort((a, b) => a[1].localeCompare(b[1], 'en'));
  const lines = [
    '---',
    `sidebar_label: "${L.themesLabel}"`,
    'sidebar_position: 3',
    'slug: /signer/on-premises/customization/temas',
    '---',
    '',
    `# ${L.themesTitle}`,
    '',
    L.intro,
    '',
    '![default](/images/signer/themes/default.png)',
    '',
    `## ${L.listHeading}`,
    '',
    L.tableHeader,
    '|---|---|---|',
  ];

  for (const [code, name, since] of entries) {
    lines.push(`| \`${code}\` | ${name} | ${since ? `v${since}` : ''} |`);
  }

  lines.push('', L.noVersionNote, '', `## ${L.galleryHeading}`, '');

  for (const [code, name] of entries) {
    const image = path.join(SITE, 'static/images/signer/themes', `${code}.png`);
    lines.push(`### ${name} (\`${code}\`)`, '');
    lines.push(fs.existsSync(image) ? `![${name}](/images/signer/themes/${code}.png)` : L.noImage);
    lines.push('');
  }

  return lines.join('\n');
}

function renderKeyLists(locale, keysByLocalizer) {
  const L = LOCALES[locale];
  const blocks = Object.entries(keysByLocalizer).map(([name, keys]) =>
    [
      '<details>',
      `<summary>${L.keysSummary(name, keys.length)}</summary>`,
      '',
      ...keys.map((k) => `* \`${k}\``),
      '',
      '</details>',
      '',
    ].join('\n')
  );
  return blocks.join('\n');
}

function replaceGeneratedBlock(content, replacement) {
  const start = content.indexOf(BEGIN);
  const end = content.indexOf(END);
  if (start < 0 || end < 0) {
    throw new Error(`generated markers not found (expected ${BEGIN}… and ${END})`);
  }
  const head = content.slice(0, content.indexOf('\n', start) + 1);
  return `${head}\n${replacement}\n${content.slice(end)}`;
}

function writeOrCheck(file, content, { check }, stale) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current === content) {
    console.log(`up to date: ${path.relative(SITE, file)}`);
    return;
  }
  if (check) {
    stale.push(path.relative(SITE, file));
    console.error(`OUT OF DATE: ${path.relative(SITE, file)}`);
    return;
  }
  fs.writeFileSync(file, content);
  console.log(`written: ${path.relative(SITE, file)}`);
}

function main() {
  const opts = parseArgs();
  if (!fs.existsSync(opts.signerRepo)) {
    console.error(
      `Signer repo not found at ${opts.signerRepo}. Pass --signer-repo <path> or set SIGNER_REPO.`
    );
    process.exit(1);
  }

  const codes = readThemeCodes(opts.signerRepo);
  const unknown = codes.filter((c) => !THEMES[c]);
  if (unknown.length) {
    console.error(
      `Theme bundles with no entry in THEMES: ${unknown.join(', ')}.\n` +
        'Add the display name and the version each one shipped in, then capture ' +
        'static/images/signer/themes/<code>.png.'
    );
    process.exit(1);
  }
  const orphans = Object.keys(THEMES).filter((c) => !codes.includes(c));
  if (orphans.length) {
    console.warn(`warning: documented themes no longer in the product: ${orphans.join(', ')}`);
  }
  const missingImages = codes.filter(
    (c) => !fs.existsSync(path.join(SITE, 'static/images/signer/themes', `${c}.png`))
  );
  if (missingImages.length) {
    console.warn(`warning: themes with no sample image: ${missingImages.join(', ')}`);
  }

  const keysByLocalizer = Object.fromEntries(
    Object.entries(LOCALIZERS).map(([name, rel]) => [name, readResourceKeys(opts.signerRepo, rel)])
  );

  const stale = [];
  for (const [locale, L] of Object.entries(LOCALES)) {
    const dir = path.join(SITE, L.dir, PAGE_DIR);

    writeOrCheck(path.join(dir, 'temas.md'), renderThemesPage(locale, codes), opts, stale);

    const emailsFile = path.join(dir, 'emails.md');
    const emails = fs.readFileSync(emailsFile, 'utf8');
    writeOrCheck(
      emailsFile,
      replaceGeneratedBlock(emails, renderKeyLists(locale, keysByLocalizer)),
      opts,
      stale
    );
  }

  if (stale.length) {
    console.error(`\n${stale.length} file(s) out of date. Run without --check to regenerate.`);
    process.exit(1);
  }
}

main();
