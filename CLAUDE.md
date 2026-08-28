# Notylus landing site — Agent Guide

Marketing site for **Notylus** (`www.notylus.net`), the multilingual workspace.

## Commands

```bash
npm run dev      # dev server (localhost:4321)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

No lint or test commands, and no typecheck script — `npm run build` is the only
gate. Astro frontmatter is type-checked as part of the build.

## Scope: this repo is the Notylus site only

| Host | Product | Repo |
| --- | --- | --- |
| `www.notylus.net` | Notylus workspace (second brain) | **this repo** |
| `www.translitpro.com` | TranslitPro transliteration utility | `translit-pro-landing` |
| `app.notylus.net` | the workspace app itself | `translit-pro` |

Message ownership is fixed by `docs/product/SPLIT_CONTRACT.md` §3 in the
`translit-pro` repo: **knowledge messaging here** (capture, write, find), utility
messaging (“type Cyrillic from a Latin keyboard”, “vs translit.ru”) on
`translitpro.com`. Do not turn this into a second transliteration page — that
positioning already has a domain with the search authority behind it.

The two roots are deliberately **not** redirected to each other. Cross-link
instead (`TRANSLITPRO_SITE_URL` in `src/config.ts`).

## Architecture

**Astro 5 static site**, Cloudflare adapter, Tailwind 4 via `@tailwindcss/vite`,
`@astrojs/sitemap`. One page: `src/pages/index.astro`.

- `src/layouts/BaseLayout.astro` — document shell, meta/OG/Twitter tags, JSON-LD.
- `src/components/` — `Header`, `Hero`, `Pillars`, `HowItWorks`, `Pricing`,
  `FAQ`, `CallToAction`, `Footer`. Sections are ordered in `index.astro`.
- `src/config.ts` — `buildAppUrl()`, `APP_BASE_URL`, `TRANSLITPRO_SITE_URL`,
  `SUPPORT_EMAIL`.
- `src/features/pricing/getPricingTiers.ts` — prices.

### English-only, on purpose

There is no `i18n` config and no locale files. The 13 localized routes live on
the TranslitPro site; Notylus copy has not been translated yet. When it is, add
the `i18n` config plus an hreflang block in `BaseLayout.astro` — do not duplicate
`index.astro` per language.

### Pricing

`getPricingTiers.ts` is a **verbatim copy** of the file by the same path in
`translit-pro-landing`. One subscription unlocks both products, so a price shown
here, a price shown there, and `app_tier_pricing` in the app's database must
agree — two sites quoting different numbers for the same Stripe price ID is a
support problem. Update all copies together, and never inline a price into
JSON-LD (the TranslitPro site did, and drifted to advertising retired prices to
Google long after the visible page was fixed).

### App links

Always build app URLs with `buildAppUrl()` rather than writing
`https://app.notylus.net/...` inline; the host is env-overridable via
`PUBLIC_APP_URL` for local development against a dev app.

Unlike the TranslitPro site, `buildAppUrl()` appends no `?lang=` parameter —
this site is English-only.

### Auth state (no-flicker pattern)

`Header.astro` reads the `tp_logged_in` cookie in an inline script that runs
before first paint and swaps “Sign In” → “Back to App”, so a logged-in visitor
never sees the wrong label flash. **This only works once the app sets that
cookie on `.notylus.net`** as well as `.translitpro.com`; until then logged-in
visitors just see “Sign In”, which still works.

### Social card

`public/og-image.png` is what the meta tags point at — social scrapers reject
relative URLs and none of them render SVG, so `BaseLayout.astro` resolves it to
an absolute URL against `Astro.site`. `public/og-image.svg` is the editable
source; regenerate the PNG after changing it:

```bash
convert -background none -density 200 public/og-image.svg -resize 1200x630 \
  public/og-image.png
```

The SVG uses a single `font-family="DejaVu Sans"` deliberately: ImageMagick's
SVG renderer reads only the first family in a list and fails on a comma-separated
stack, silently dropping every text element from the PNG.

### Generated files

`.astro/` and `dist/` are generated on every build and gitignored. After a fresh
clone the IDE may show transient TypeScript errors until `npx astro sync` (or any
`npm run dev`/`build`) has run once.

### Esbuild / TypeScript caveat

Astro frontmatter is processed by esbuild in TSX mode. Avoid object index
signatures (`{ [key: string]: T }`) and generic utility types
(`Partial<Record<...>>`) in frontmatter — esbuild chokes on them. Use `any` or no
annotation.

## Deployment (Cloudflare Pages)

- Build command `npm run build`, output directory `dist`.
- Custom domain `www.notylus.net`, with the apex redirecting to `www`.
- Optional `PUBLIC_APP_URL` environment variable to point CTAs at a non-default
  app host.
