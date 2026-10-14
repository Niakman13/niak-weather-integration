/** Intl formatters are slow to build: create each locale/options pair once and reuse it. */
const dates = new Map<string, Intl.DateTimeFormat>(), numbers = new Map<string, Intl.NumberFormat>();
export function dateFormat(locale?: string | string[], options: Intl.DateTimeFormatOptions = {}): Intl.DateTimeFormat {
  const key = JSON.stringify([locale, options]);
  let f = dates.get(key); if (!f) dates.set(key, f = new Intl.DateTimeFormat(locale, options));
  return f;
}
export function numberFormat(locale?: string | string[], options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const key = JSON.stringify([locale, options]);
  let f = numbers.get(key); if (!f) numbers.set(key, f = new Intl.NumberFormat(locale, options));
  return f;
}
