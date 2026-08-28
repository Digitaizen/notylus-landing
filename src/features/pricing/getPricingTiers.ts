/**
 * Centralized pricing configuration for the Notylus site.
 *
 * This module is intentionally the single source of truth for all plan prices,
 * so price updates do not require editing page templates.
 *
 * Notylus and TranslitPro are one subscription — a plan bought on either site
 * unlocks both surfaces — so these numbers must stay identical to
 * `src/features/pricing/getPricingTiers.ts` in the `translit-pro-landing` repo
 * and to `app_tier_pricing` in the app's database. Two marketing sites quoting
 * different prices for the same Stripe price ID is a support problem, not a
 * cosmetic one.
 *
 * Note:
 * - Only numeric/currency values live here; labels live in the templates.
 * - Both the raw numeric amounts and their formatted (with currency symbol)
 *   representations are exposed so that the UI can style the number and
 *   currency text separately. This is important for integrations like
 *   browser translation extensions, which may translate the currency symbol
 *   into a word (e.g. "$" → "dollar") and should not inherit the large
 *   font-size used for the numeric amount.
 *
 * @returns An object containing pricing data for each tier, including the
 *          shared currency symbol, numeric amounts, and formatted strings.
 */
export function getPricingTiers() {
  const CURRENCY_SYMBOL = '$';

  // Prices (kept as numbers for easy future manipulation).
  // 2026-08-27 repricing (docs/product/TIERS_AND_PRICING.md §8.2 in the main
  // repo): 2x each tier, annual is the anchor (not monthly x 12). Founder was
  // retired for new sales and, as of 2026-08-28, removed from the app's
  // purchase paths and from Stripe — so no Founder price is published here.
  const BASIC_MONTHLY = 6;
  const BASIC_ANNUAL = 48;

  const PRO_MONTHLY = 12;
  const PRO_ANNUAL = 96;

  const FREE = 0;

  const formatWithCurrency = (amount: number): string =>
    `${CURRENCY_SYMBOL}${amount}`;

  /** Annual savings (numeric) = (monthly × 12) − annual price. */
  const computeAnnualSavingsAmount = (monthly: number, annual: number): number =>
    monthly * 12 - annual;

  /** Number of days used to compute the daily cost from a monthly price. */
  const DAYS_PER_MONTH = 30;

  /**
   * Whether to display the approximate cost per day below the monthly price.
   * Set to `false` to hide the cost-per-day line without touching the template.
   */
  const SHOW_COST_PER_DAY = true;

  /**
   * Computes the approximate daily cost from a monthly price.
   * Returns a string rounded to two decimal places (e.g. "0.10").
   */
  const computeCostPerDay = (monthly: number): string =>
    (monthly / DAYS_PER_MONTH).toFixed(2);

  const basicAnnualSavingsAmount = computeAnnualSavingsAmount(
    BASIC_MONTHLY,
    BASIC_ANNUAL,
  );
  const proAnnualSavingsAmount = computeAnnualSavingsAmount(
    PRO_MONTHLY,
    PRO_ANNUAL,
  );

  return {
    /** Shared currency symbol so the UI can render it separately. */
    currencySymbol: CURRENCY_SYMBOL,

    /**
     * When `true`, the monthly-price panel for Basic and Pro shows an
     * approximate cost-per-day line (e.g. "~$0.10/day").
     * Toggle this flag here to show or hide the line globally.
     */
    showCostPerDay: SHOW_COST_PER_DAY,

    free: {
      /** Numeric amount for the Free tier (used for the large number). */
      amount: FREE,
      /** Formatted string with currency, e.g. "$0". */
      price: formatWithCurrency(FREE),
    },

    basic: {
      /** Numeric monthly amount. */
      amount: BASIC_MONTHLY,
      /** Monthly price formatted with currency, e.g. "$3". */
      price: formatWithCurrency(BASIC_MONTHLY),
      /** Approximate daily cost derived from the monthly price, e.g. "0.10". */
      costPerDay: computeCostPerDay(BASIC_MONTHLY),

      /** Numeric annual billing amount. */
      annualAmount: BASIC_ANNUAL,
      /** Annual billing price formatted with currency, e.g. "$29". */
      annualPrice: formatWithCurrency(BASIC_ANNUAL),

      /** Numeric savings when billed annually instead of monthly. */
      annualSavingsAmount: basicAnnualSavingsAmount,
      /** Savings formatted with currency, e.g. "$7". */
      annualSavings: formatWithCurrency(basicAnnualSavingsAmount),
    },

    pro: {
      /** Numeric monthly amount. */
      amount: PRO_MONTHLY,
      /** Monthly price formatted with currency, e.g. "$7". */
      price: formatWithCurrency(PRO_MONTHLY),
      /** Approximate daily cost derived from the monthly price, e.g. "0.23". */
      costPerDay: computeCostPerDay(PRO_MONTHLY),

      /** Numeric annual billing amount. */
      annualAmount: PRO_ANNUAL,
      /** Annual billing price formatted with currency, e.g. "$69". */
      annualPrice: formatWithCurrency(PRO_ANNUAL),

      /** Numeric savings when billed annually instead of monthly. */
      annualSavingsAmount: proAnnualSavingsAmount,
      /** Savings formatted with currency, e.g. "$15". */
      annualSavings: formatWithCurrency(proAnnualSavingsAmount),
    },

  };
}
