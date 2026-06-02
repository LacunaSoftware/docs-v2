import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: ' ',
  tagline: 'Documentação para produtos Lacuna Software',
  favicon: 'img/favicon.png',

  url: 'https://LacunaSoftware.github.io',
  baseUrl: '/docs-v2/',

  organizationName: 'LacunaSoftware',
  projectName: 'docs-v2',

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownImages: 'warn',
    },
  },

  // No Docusaurus i18n — languages are served as plain doc paths:
  //   pt-BR → /docs/signer/
  //   en    → /docs/en/signer/
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
        docsRouteBasePath: '/docs',
      },
    ],
    // .NET API reference: a separate docs instance served at /api (not /docs/api).
    // Language-neutral, not in the navbar, and excluded from search above — so it's
    // reachable only by URL, but its own sidebar lists every namespace.
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'apiRef',
        path: 'api-docs',
        routeBasePath: 'api',
        sidebarPath: './sidebarsApi.ts',
      },
    ],
    // Same API content mirrored at /en/api. The reference is language-neutral, so
    // both locales serve identical pages; the PT/EN switch just flips the URL.
    // api-docs-en is a build-time copy of api-docs (scripts/sync-api-en.mjs) —
    // two docs instances can't share one path, so the EN mirror gets its own.
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'apiRefEn',
        path: 'api-docs-en',
        routeBasePath: 'en/api',
        sidebarPath: './sidebarsApi.ts',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
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
      items: [
        {type: 'docSidebar', sidebarId: 'webPki',      position: 'left', label: 'Web PKI'},
        {type: 'docSidebar', sidebarId: 'restPki',     position: 'left', label: 'Rest PKI'},
        {type: 'docSidebar', sidebarId: 'restPkiCore', position: 'left', label: 'Rest PKI Core'},
        {type: 'docSidebar', sidebarId: 'pkiSdk',      position: 'left', label: 'PKI SDK'},
        {type: 'docSidebar', sidebarId: 'pkiExpress',  position: 'left', label: 'PKI Express'},
        {type: 'docSidebar', sidebarId: 'signer',      position: 'left', label: 'Signer'},
        {type: 'docSidebar', sidebarId: 'amplia',      position: 'left', label: 'Amplia'},

        {
          type: 'dropdown',
          label: 'Outros',
          position: 'left',
          items: [
            {type: 'docSidebar', sidebarId: 'welcome',    label: 'Bem-vindo'},
            {type: 'docSidebar', sidebarId: 'pkiGuide', label: 'Certificação Digital'},
            {type: 'docSidebar', sidebarId: 'bulkSigner', label: 'Bulk Signer'},
            {type: 'docSidebar', sidebarId: 'ampliaReg', label: 'Amplia Reg'},
            {type: 'docSidebar', sidebarId: 'psc',       label: 'PSC'},
            {type: 'docSidebar', sidebarId: 'tsa',       label: 'TSA'},
            {type: 'docSidebar', sidebarId: 'digiploma', label: 'Digiploma'},
            {type: 'docSidebar', sidebarId: 'grantId',   label: 'GrantID'},
            {type: 'docSidebar', sidebarId: 'scanner',   label: 'Scanner'},
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
            {label: 'Certificação Digital', to: '/docs/pki-guide/'},
            {label: 'Web PKI',              to: '/docs/web-pki/'},
            {label: 'Rest PKI',             to: '/docs/rest-pki/'},
            {label: 'Rest PKI Core',        to: '/docs/rest-pki-core/'},
            {label: 'PKI SDK',              to: '/docs/pki-sdk/'},
            {label: 'PKI Express',          to: '/docs/pki-express/'},
          ],
        },
        {
          title: 'Produtos',
          items: [
            {label: 'Signer',      to: '/docs/signer/'},
            {label: 'Bulk Signer', to: '/docs/bulk-signer/'},
            {label: 'Amplia',    to: '/docs/amplia/'},
            {label: 'Amplia Reg', to: '/docs/amplia-reg/'},
            {label: 'GrantID',   to: '/docs/grant-id/'},
            {label: 'Scanner',   to: '/docs/scanner/'},
            {label: 'PSC',       to: '/docs/psc/'},
            {label: 'TSA',       to: '/docs/tsa/'},
            {label: 'Digiploma', to: '/docs/digiploma/'},
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
