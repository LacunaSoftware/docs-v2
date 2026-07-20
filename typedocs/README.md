# Web PKI API reference (TypeDoc)

Generates the **Web PKI** TypeScript API reference from `lacuna-web-pki.d.ts` and
writes the static HTML into the site's `static/` folder, at the classic paths the
old DocFX site used:

- `static/content/typedocs/web-pki/` → served at `/content/typedocs/web-pki/…`
- `static/en-us/content/typedocs/web-pki/` → served at `/en-us/content/typedocs/web-pki/…`

The in-repo Web PKI articles link to `/content/typedocs/web-pki/…`; the `/en-us`
copy exists so legacy deep links (e.g.
`…/en-us/content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signhash`)
keep resolving.

## Regenerating (after the SDK typings change)

Replace `lacuna-web-pki.d.ts` with the new declaration file, then:

```bash
cd typedocs
npm install
npm run build
```

Commit the regenerated output under `static/`.

## Why it's isolated

This uses **TypeDoc 0.10** + the vendored custom Handlebars **theme/**, pinned to
preserve the original per-method anchors (`#signhash`, `#init`, …) that the docs
and external links depend on. That toolchain is old (TypeScript 2.7), so it is
kept as a standalone project here and is **not** wired into the main Docusaurus
build — the generated HTML is committed as a static asset instead.
