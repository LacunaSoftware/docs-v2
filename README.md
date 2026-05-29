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

Starts the dev server at **http://localhost:3000/docs-v2/**. Most content changes hot-reload without restarting.

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

Serves the production build at **http://localhost:3000/docs-v2/**.

## Deployed Site

The production site is published to GitHub Pages and available at:

**https://lacunasoftware.github.io/docs-v2/**

## Deployment

Consult the github actions for more information.

## Other Commands

| Command | Description |
|---|---|
| `npm run clear` | Clear Docusaurus cache |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run write-translations` | Extract i18n translation strings |
