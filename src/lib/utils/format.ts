const LOCALE = "en-GB";

/**
 * Render a number with Latin digits, a comma thousands separator, and at
 * most two fraction digits. The locale is locked so the result never falls
 * back to Arabic-Indic digits in an RTL document.
 */
export const formatNumber = (
  v: number | string | null | undefined,
  opts?: Intl.NumberFormatOptions,
): string => Number(v ?? 0).toLocaleString(LOCALE, { maximumFractionDigits: 2, ...opts });

/**
 * Integer variant — no fraction digits at all. Use for counts, quantities,
 * sequence numbers, lot numbers rendered as integers, etc.
 */
export const formatInteger = (v: number | string | null | undefined): string =>
  Number(v ?? 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 });

/**
 * Date as dd/mm/yyyy with Latin digits. Replaces the previous `"ar-LY"`
 * calls which produced ٠٣/٠٩/٢٠٢٦.
 */
export const formatDate = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/**
 * Datetime as dd/mm/yyyy HH:MM (24-hour) with Latin digits.
 */
export const formatDateTime = (iso: string | Date): string =>
  new Date(iso).toLocaleString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
