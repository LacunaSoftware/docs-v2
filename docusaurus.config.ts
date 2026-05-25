import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Lacuna Docs',
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
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Lacuna Docs',
      logo: {
        alt: 'Lacuna Software',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'signer',
          position: 'left',
          label: 'Signer',
        },
        {
          type: 'custom-languageSwitch',
          position: 'right',
        },
        // Old / New documentation switch
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
          title: 'Signer',
          items: [
            {label: 'Visão Geral',        to: '/docs/signer/'},
            {label: 'Guia de Integração', to: '/docs/signer/integration-guide'},
            {label: 'On-premises',        to: '/docs/signer/on-premises/'},
            {label: 'Changelog',          to: '/docs/signer/changelog'},
          ],
        },
        {
          title: 'Lacuna Software',
          items: [
            {label: 'Site oficial',  href: 'https://www.lacunasoftware.com'},
            {label: 'Suporte',       href: 'mailto:suporte@lacunasoftware.com'},
            {label: 'Docs clássica', href: 'https://docs.lacunasoftware.com/pt-br/index.html'},
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