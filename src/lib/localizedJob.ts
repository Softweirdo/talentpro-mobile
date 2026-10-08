import { useTranslation } from 'react-i18next';
import type { Job } from '../api/types';

/**
 * The job with its text swapped for the server's Gujarati translation while
 * the app is in Gujarati. Falls back to the English posting until one exists.
 * The company name is a proper noun and is never translated.
 */
export function useLocalizedJob<T extends Job | undefined>(job: T): T {
  const { i18n } = useTranslation();
  if (!job || i18n.language !== 'gu' || !job.gu) return job;
  return {
    ...job,
    title: job.gu.title || job.title,
    location: job.gu.location || job.location,
    description: job.description ? job.gu.description ?? job.description : job.description,
    requirements: job.gu.requirements.length === job.requirements.length ? job.gu.requirements : job.requirements,
  };
}
