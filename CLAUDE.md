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

### Brand assets

The mark is the **nautilus shell** (`public/logo.png`), and the wordmark is
"NOTYLUS" set in the Google Font **Goldman** 700, uppercase, `letter-spacing:
0.08em`, with a horizontal gradient that stays at full accent across the leading
4 of 7 characters ("NOTY") and then fades to 45%. All of that mirrors the app
exactly — see `TITLE_FONT_FAMILY` / `TITLE_EMPHASIS_LENGTH` in the main repo's
`src/components/Header.tsx` and the `.sp-title` rule in its `index.html`.

`logo.png` and the favicon set (`favicon.ico`, `favicon-16x16.png`,
`favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-*.png`) are copied
from the main repo's `public/`. `logo.png` is downscaled to 256 px here — the
canonical 1122×1402 original stays in the app repo, and shipping it as-is put a
1.1 MB PNG in the header. Note it is **not square** (205×256 after the
downscale), so size it with `h-N w-auto`, never `w-N h-N`.

Do not reintroduce a lettermark placeholder. Fix the logo in the app repo first,
then re-copy.

### Social card

`public/og-image.png` is what the meta tags point at — social scrapers reject
relative URLs and none of them render SVG, so `BaseLayout.astro` resolves it to
an absolute URL against `Astro.site`. `public/og-image.svg` is the editable
source. It references `logo.png` via `<image>` and names Goldman for the
wordmark, neither of which ImageMagick's SVG renderer handles, so the PNG is
composited directly instead of converted from the SVG — keep the two in sync by
hand:

```bash
curl -s "$(curl -s 'https://fonts.googleapis.com/css2?family=Goldman:wght@700' \
  -H 'User-Agent: Mozilla/5.0' | grep -o 'https://[^)]*\.ttf' | tail -1)" \
  -o /tmp/Goldman-Bold.ttf
convert -size 1200x630 -define gradient:direction=NorthWest \
  gradient:'#0f172a-#1e1b4b' /tmp/og-bg.png
convert /tmp/og-bg.png \
  \( public/logo.png -resize x140 \) -gravity NorthWest -geometry +80+108 -composite \
  -font /tmp/Goldman-Bold.ttf -pointsize 78 -fill '#818cf8' -kerning 6 -annotate +212+140 'NOTYLUS' \
  -font DejaVu-Sans-Bold -pointsize 56 -fill '#ffffff' -kerning 0 -annotate +80+330 'Your multilingual second brain.' \
  -font DejaVu-Sans -pointsize 34 -fill '#94a3b8' -annotate +80+412 'Capture in any language. Find it in yours.' \
  -font DejaVu-Sans -pointsize 30 -fill '#818cf8' -annotate +80+520 'www.notylus.net' \
  -depth 8 -strip public/og-image.png
```

With `gravity NorthWest`, `-annotate +x+y` places the **top** of the em box at
`y`, not the baseline — which is why the wordmark's `y` is ~40 px above the
logo's. Any `font-family` passed to ImageMagick must be a single family: its SVG
renderer reads only the first entry in a comma-separated stack and silently
drops every text element from the output.

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
