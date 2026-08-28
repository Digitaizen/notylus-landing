/**
 * Site configuration.
 *
 * `www.notylus.net` is the Notylus marketing host. The transliteration-utility
 * marketing site stays on `www.translitpro.com` — see `SPLIT_CONTRACT.md` §3 in
 * the `translit-pro` repo. There is deliberately no 301 between the two roots:
 * `translitpro.com` carries the SEO authority that acquires users, and
 * `notylus.net` starts at zero.
 */

/**
 * Base URL for the Notylus workspace app.
 * - Development: set `PUBLIC_APP_URL` in `.env` to your local app URL
 * - Production: `https://app.notylus.net`
 */
export const APP_BASE_URL = import.meta.env.PUBLIC_APP_URL || 'https://app.notylus.net';

/** Marketing site for the TranslitPro input engine. */
export const TRANSLITPRO_SITE_URL = 'https://www.translitpro.com';

/** Support address (Cloudflare Email Routing on `notylus.net`). */
export const SUPPORT_EMAIL = 'support@notylus.net';

/**
 * Build a URL into the workspace app.
 *
 * Unlike the TranslitPro site, this one is English-only for now, so no `?lang=`
 * parameter is appended.
 *
 * @param path - Optional path (e.g. '/login', '/signup')
 * @param queryParams - Optional query string without the leading `?` (e.g. 'plan=pro')
 */
export function buildAppUrl(path: string = '', queryParams: string = ''): string {
  const base = `${APP_BASE_URL}${path}`;
  return queryParams ? `${base}?${queryParams}` : base;
}
