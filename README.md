# Lacuna Software Docs v2

Documentation site for Lacuna Software products, built with [Docusaurus 3](https://docusaurus.io/).

## Prerequisites

- Node.js >= 20.0

## Installation

```bash
npm install
```

> This installs all dependencies including `@easyops-cn/docusaurus-search-local`, which powers the offline full-text search.

## Local Development

```bash
npm run start
```

Starts the dev server at **http://localhost:3000/**. Most content changes hot-reload without restarting.

> **Note:** The search index is **not** available in dev mode. To test search, do a full build and serve it locally (see below).

## Build (with search)

```bash
npm run build
```

Generates the static site into the `build/` directory. The search index is built during this step, so this is required to test search functionality.

To preview the built site locally:

```bash
npm run serve
```

Serves the production build at **http://localhost:3000/**.

## URL scheme

Routing mirrors the classic DocFX site (docs.lacunasoftware.com):

| Content | Route |
|---|---|
| Portuguese articles (`docs/`) | `/articles/<path>` (also aliased at `/pt-br/articles/<path>`) |
| English articles (`docs-en/`) | `/en-us/articles/<path>` |
| .NET API reference | `/api/<path>` and `/en-us/api/<path>` |

With `trailingSlash: false`, each page is emitted as a flat `<path>.html` file, so
classic links ending in `.html` keep working. Articles that were reorganized into
new folders (e.g. `signer/on-premises/configuracao/`) carry a `slug:` in their
front matter pinning them to their classic URL. There is no automatic language
detection or redirect — language switching is manual via the navbar.

## Deployed Site

The production site is published via GitHub Pages / GitHub Actions (see
`.github/workflows/deploy.yml`). The site is built for **https://docs.lacunasoftware.com**
(baseUrl `/`) — under a different host prefix (e.g. `github.io/docs-v2/`) asset
paths will not resolve.

## Deployment

Consult the github actions for more information.

## Other Commands

| Command | Description |
|---|---|
| `npm run clear` | Clear Docusaurus cache |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run write-translations` | Extract i18n translation strings |
