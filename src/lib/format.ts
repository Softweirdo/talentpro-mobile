import type { ApplicationStatus, ExperienceBand } from '../api/types';

export const EXPERIENCE_LABEL: Record<ExperienceBand, string> = {
  '0-1': '0–1 yrs',
  '1-3': '1–3 yrs',
  '3-5': '3–5 yrs',
  '5-10': '5–10 yrs',
  '10+': '10+ yrs',
};

export const EXPERIENCE_OPTIONS: { value: ExperienceBand; label: string }[] = (
  Object.keys(EXPERIENCE_LABEL) as ExperienceBand[]
).map((value) => ({ value, label: EXPERIENCE_LABEL[value] }));

/** Indian digit grouping: ₹2,50,000 rather than ₹250,000. */
export const inr = (n: number | null | undefined): string =>
  n === null || n === undefined ? '—' : `₹${n.toLocaleString('en-IN')}`;

export const inrCompact = (n: number): string => {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1).replace(/\.0$/, '')}L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

/** Zero-padded, as the prototype shows referral counts ("07"). */
export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Maps an application status onto the badge palette key and its i18n key. */
export const APPLICATION_BADGE: Record<ApplicationStatus, { tone: string; key: string }> = {
  applied: { tone: 'applied', key: 'status.applied' },
  shortlisted: { tone: 'shortlisted', key: 'status.shortlisted' },
  interview: { tone: 'interview', key: 'status.shortlisted' },
  hired: { tone: 'hired', key: 'status.hired' },
  rejected: { tone: 'rejected', key: 'status.rejected' },
  withdrawn: { tone: 'pending', key: 'status.pending' },
};

export const formatMobile = (e164: string): string => {
  const local = e164.replace(/^\+91/, '');
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : e164;
};

/** Strips everything but digits, and caps at the 10 an Indian mobile has. */
export const digitsOnly = (v: string): string => v.replace(/\D/g, '').slice(0, 10);

export const isValidMobile = (v: string): boolean => /^[6-9]\d{9}$/.test(digitsOnly(v));

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
