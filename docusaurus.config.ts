import {themes as prismThemes} from 'prism-react-renderer';
import type {Config, PluginConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// The /pt-br/* content is a mirror of the root Portuguese docs, only needed so
// the classic site's /pt-br/... URLs keep resolving on the deployed (static)
// site. Registering the extra docs instances also in `docusaurus start`
// noticeably slows the dev server and isn't useful there (dev is for authoring
// the canonical /articles content), so they are enabled for production builds
// only. Set DOCS_PTBR_DEV=1 to also enable them in `npm run start`.
const includePtBrMirror =
  process.env.NODE_ENV === 'production' || process.env.DOCS_PTBR_DEV === '1';

// Built once and reused in the plugins array below.
const ptBrMirrorPlugins: PluginConfig[] = includePtBrMirror
  ? [
      // Portuguese articles mirrored at /pt-br/articles (see sync-mirrors.mjs).
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'docsPtBr',
          path: 'docs-ptbr',
          routeBasePath: 'pt-br/articles',
          sidebarPath: './sidebars.ts',
        },
      ],
      // .NET API reference mirrored at /pt-br/api.
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'apiRefPtBr',
          path: 'api-docs-ptbr',
          routeBasePath: 'pt-br/api',
          sidebarPath: './sidebarsApi.ts',
        },
      ],
    ]
  : [];

const config: Config = {
  title: ' ',
  tagline: 'Documentação para produtos Lacuna Software',
  favicon: 'img/favicon.png',

  // Served as a GitHub Pages project site at lacunasoftware.github.io/docs-v2/,
  // so baseUrl must be the repository path. The nav/footer/language-switch
  // components resolve their links relative to this baseUrl.
  url: 'https://lacunasoftware.github.io',
  baseUrl: '/',

  organizationName: 'LacunaSoftware',
  projectName: 'docs-v2',

  // Treat broken internal links/anchors as build errors: if a page can't link
  // to something, that's a bug we want to catch at compile time, not ship.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  // Emit flat <route>.html files (not <route>/index.html) so the classic
  // DocFX-era URLs ending in .html keep resolving on static hosting.
  trailingSlash: false,

  markdown: {
    hooks: {
      onBrokenMarkdownImages: 'warn',
    },
  },

  // No Docusaurus i18n and no automatic locale detection/redirect — languages
  // are served as plain routes, mirroring the classic site:
  //   pt-BR → /articles/signer/...            (also aliased at /pt-br/articles/...)
  //   en    → /en-us/articles/signer/...
  // Switching languages is manual, via the navbar custom-languageSwitch item.
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
    localeConfigs: {
      'pt-BR': {htmlLang: 'pt-BR'},
    },
  },

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['pt', 'en'],
        indexDocs: true,
        indexPages: false,
        // No blog on this site — don't index it (also silences the search
        // plugin's "blogDir doesn't exist" build warning).
        indexBlog: false,
        // Index the main docs (both languages) plus both .NET API reference
        // instances so the generated SDK classes are reachable from the search bar.
        docsRouteBasePath: ['/articles', '/en-us/articles', '/api', '/en-us/api'],
      },
    ],
    // English articles: docs-en served as its own docs instance at
    // /en-us/articles, matching the classic site's URL scheme. It must be a
    // sibling of docs/ (not nested inside it) — nested content roots get
    // processed by both instances' MDX loaders and fail to compile.
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docsEn',
        path: 'docs-en',
        routeBasePath: 'en-us/articles',
        sidebarPath: './sidebarsEn.ts',
        editUrl: 'https://github.com/LacunaSoftware/docs-v2/edit/main/',
      },
    ],
    // .NET API reference: a separate docs instance served at /api.
    // Language-neutral and not in the navbar, but indexed for search (above) and
    // its own sidebar lists every namespace.
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'apiRef',
        path: 'api-docs',
        routeBasePath: 'api',
        sidebarPath: './sidebarsApi.ts',
      },
    ],
    // Same API content mirrored at /en-us/api. The reference is language-neutral, so
    // both locales serve identical pages; the PT/EN switch just flips the URL.
    // api-docs-en is a build-time copy of api-docs (scripts/sync-mirrors.mjs) —
    // two docs instances can't share one path, so the EN mirror gets its own.
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'apiRefEn',
        path: 'api-docs-en',
        routeBasePath: 'en-us/api',
        sidebarPath: './sidebarsApi.ts',
      },
    ],
    // Portuguese is served at the root (/articles/...) AND under /pt-br/...,
    // exactly like the classic site, which built the whole pt-BR tree under
    // /pt-br/. These instances re-serve the SAME Portuguese content at the
    // /pt-br prefix so classic links like /pt-br/articles/.../x.html resolve to
    // real files (a redirect can't emit a reachable <path>.html on static
    // hosting). Content is mirrored from docs/ and api-docs/ at build time
    // (scripts/sync-mirrors.mjs, gitignored) since two instances can't share a
    // source path. Not added to search (docsRouteBasePath) — the canonical
    // /articles copy is indexed instead, so results aren't duplicated.
    // Production-only by default (see includePtBrMirror above); kept out of the
    // dev server unless DOCS_PTBR_DEV=1.
    ...ptBrMirrorPlugins,
    // Bare /pt-br (and /pt-br/) → homepage, matching the classic entry point.
    //
    // We deliberately do NOT generate `<route>/` folder-alias redirects here.
    // With trailingSlash:false every page is a flat <route>.html file; a redirect
    // written to <route>/index.html gets served *in preference* to <route>.html
    // by static hosts that resolve a directory index first (docusaurus serve,
    // GitHub Pages). Because that redirect targets <route>, it turned every hard
    // page load into an infinite client-side redirect loop. Classic .../x.html
    // links resolve directly (flat files); the client router also strips a
    // trailing `.html` / `/index` and normalizes a trailing slash on SPA nav.
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {from: '/pt-br', to: '/'},
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          // Portuguese articles at /articles/..., same paths as the classic
          // site. English articles live in docs-en/ (docsEn instance above).
          routeBasePath: 'articles',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/LacunaSoftware/docs-v2/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: 'Lacuna Software',
        src: 'img/logo.png',
      },
      // Product links use a custom navbar item (custom-docLink / custom-docDropdown)
      // that keeps the current language prefix (/articles, /en-us/articles,
      // /pt-br/articles) when navigating between products — so the selected
      // language persists across the top nav, matching the sidebar. `docId` is
      // the product's route under <lang>/articles. See
      // src/components/LocalizedDocNavbarItem.
      items: [
        {type: 'custom-docLink', docId: 'web-pki',       position: 'left', label: 'Web PKI'},
        {type: 'custom-docLink', docId: 'rest-pki',      position: 'left', label: 'Rest PKI'},
        {type: 'custom-docLink', docId: 'rest-pki/core', position: 'left', label: 'Rest PKI Core'},
        {type: 'custom-docLink', docId: 'pki-sdk',       position: 'left', label: 'PKI SDK'},
        {type: 'custom-docLink', docId: 'pki-express',   position: 'left', label: 'PKI Express'},
        {type: 'custom-docLink', docId: 'signer',        position: 'left', label: 'Signer'},
        {type: 'custom-docLink', docId: 'amplia',        position: 'left', label: 'Amplia'},

        {
          type: 'custom-docDropdown',
          label: 'Outros',
          position: 'left',
          items: [
            {docId: 'welcome',     label: 'Bem-vindo'},
            {docId: 'pki-guide',   label: 'Certificação Digital'},
            {docId: 'bulk-signer', label: 'Bulk Signer'},
            {docId: 'amplia-reg',  label: 'Amplia Reg'},
            {docId: 'psc',         label: 'PSC'},
            {docId: 'tsa',         label: 'TSA'},
            {docId: 'digiploma',   label: 'Digiploma'},
            {docId: 'grant-id',    label: 'GrantID'},
            {docId: 'scanner',     label: 'Scanner'},
          ],
        },
        {
          type: 'custom-languageSwitch',
          position: 'right',
        },
        {
          href: 'https://docs.lacunasoftware.com/pt-br/index.html',
          label: 'Documentação Clássica',
          position: 'right',
          className: 'navbar__link--classic',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'PKI',
          items: [
            {label: 'Certificação Digital', to: '/articles/pki-guide'},
            {label: 'Web PKI',              to: '/articles/web-pki'},
            {label: 'Rest PKI',             to: '/articles/rest-pki'},
            {label: 'Rest PKI Core',        to: '/articles/rest-pki/core'},
            {label: 'PKI SDK',              to: '/articles/pki-sdk'},
            {label: 'PKI Express',          to: '/articles/pki-express'},
          ],
        },
        {
          title: 'Produtos',
          items: [
            {label: 'Signer',      to: '/articles/signer'},
            {label: 'Bulk Signer', to: '/articles/bulk-signer'},
            {label: 'Amplia',    to: '/articles/amplia'},
            {label: 'Amplia Reg', to: '/articles/amplia-reg'},
            {label: 'GrantID',   to: '/articles/grant-id'},
            {label: 'Scanner',   to: '/articles/scanner'},
            {label: 'PSC',       to: '/articles/psc'},
            {label: 'TSA',       to: '/articles/tsa'},
            {label: 'Digiploma', to: '/articles/digiploma'},
          ],
        },
        {
          title: 'Lacuna Software',
          items: [
            {label: 'Site oficial',  href: 'https://www.lacunasoftware.com'},
            {label: 'Suporte',       href: 'mailto:suporte@lacunasoftware.com'},
            {label: 'Docs clássica', href: '/'},
          ],
        },
      ],
      copyright: `Copyright © 2015-${new Date().getFullYear()} Lacuna Software.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'nginx', 'json', 'csharp', 'powershell'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
