import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Formats "2 days ago" in the active language.
 *
 * The API also returns a pre-formatted `*Ago` string, but it is built
 * server-side in English — which in Gujarati produced "શેર કર્યું a few
 * seconds ago". Relative time is presentation, so it belongs on the client
 * where the language is known.
 */
export function formatRelative(iso: string | null | undefined, t: TFunction): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const diff = Math.max(0, Date.now() - then);

  if (diff < MINUTE) return t('time.justNow');

  const pick = (unit: string, count: number) =>
    // i18next resolves the `_plural` suffix from `count`, so Gujarati — which
    // shares a form for several of these — stays correct without special cases.
    t(`time.${unit}`, { count });

  if (diff < HOUR) return pick('minute', Math.floor(diff / MINUTE));
  if (diff < DAY) return pick('hour', Math.floor(diff / HOUR));
  if (diff < WEEK) return pick('day', Math.floor(diff / DAY));
  if (diff < MONTH) return pick('week', Math.floor(diff / WEEK));
  if (diff < YEAR) return pick('month', Math.floor(diff / MONTH));
  return pick('year', Math.floor(diff / YEAR));
}

/** Hook form, bound to the active language. */
export function useRelativeTime() {
  const { t } = useTranslation();
  return (iso: string | null | undefined) => formatRelative(iso, t);
}
