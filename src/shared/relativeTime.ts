const MINUTE = 60 * 1000;

/** Each step: how many of the previous unit make one of this unit. */
const STEPS: readonly [number, Intl.RelativeTimeFormatUnit][] = [
  [60, 'minute'],
  [24, 'hour'],
  [30, 'day'],
  [12, 'month'],
  [Number.POSITIVE_INFINITY, 'year'],
];

/** "2 minutes ago", "yesterday", "3 months ago" in the given language. */
export function formatRelativeTime(timestamp: number, now: number, locale: string): string {
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  let value = Math.round((timestamp - now) / MINUTE);
  for (const [size, unit] of STEPS) {
    if (Math.abs(value) < size) {
      return format.format(value, unit);
    }
    value = Math.round(value / size);
  }
  return format.format(value, 'year');
}
