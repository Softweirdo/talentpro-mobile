import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from './client';
import type {
  AppNotification,
  Application,
  Category,
  CursorPage,
  Envelope,
  Job,
  Me,
  Referral,
  ReferralStats,
} from './types';

const get = async <T>(url: string, params?: unknown): Promise<T> =>
  (await api.get<Envelope<T>>(url, { params })).data.data;

const getPage = async <T>(url: string, params?: unknown): Promise<CursorPage<T>> =>
  (await api.get<CursorPage<T>>(url, { params })).data;

export const keys = {
  me: ['me'] as const,
  jobs: ['jobs'] as const,
  applications: ['applications'] as const,
  referrals: ['referrals'] as const,
  notifications: ['notifications'] as const,
  categories: ['categories'] as const,
};

export const useMe = () =>
  useQuery({ queryKey: keys.me, queryFn: () => get<Me>('/me') });

export const useCategories = () =>
  useQuery({
    queryKey: keys.categories,
    queryFn: () => get<Category[]>('/categories'),
    // Categories change rarely and are needed on several screens.
    staleTime: 10 * 60_000,
  });

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      (await api.patch<Envelope<Me>>('/me', body)).data.data,
    onSuccess: (me) => {
      qc.setQueryData(keys.me, me);
      void qc.invalidateQueries({ queryKey: keys.jobs });
    },
  });
}

/** Infinite feed — keyset paginated, so new postings never duplicate a row mid-scroll. */
export const useJobFeed = (params: Record<string, unknown>) =>
  useInfiniteQuery({
    queryKey: [...keys.jobs, 'feed', params],
    queryFn: ({ pageParam }) =>
      getPage<Job>('/jobs', { ...params, limit: 20, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.page.nextCursor ?? undefined,
  });

export const useRecommendedJobs = () =>
  useQuery({
    queryKey: [...keys.jobs, 'recommended'],
    queryFn: () => getPage<Job>('/jobs/recommended', { limit: 5 }),
  });

export const useJob = (id: string) =>
  useQuery({ queryKey: [...keys.jobs, id], queryFn: () => get<Job>(`/jobs/${id}`) });

export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) =>
      (await api.post<Envelope<Application>>(`/jobs/${jobId}/apply`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.applications });
      void qc.invalidateQueries({ queryKey: keys.jobs });
    },
  });
}

export const useApplications = (statusGroup: string) =>
  useInfiniteQuery({
    queryKey: [...keys.applications, statusGroup],
    queryFn: ({ pageParam }) =>
      getPage<Application>('/applications', {
        limit: 20,
        ...(statusGroup !== 'all' ? { statusGroup } : {}),
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.page.nextCursor ?? undefined,
  });

export const useApplication = (id: string) =>
  useQuery({
    queryKey: [...keys.applications, 'one', id],
    queryFn: () => get<Application>(`/applications/${id}`),
  });

export const useReferrals = () =>
  useInfiniteQuery({
    queryKey: keys.referrals,
    queryFn: ({ pageParam }) =>
      getPage<Referral>('/referrals', { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.page.nextCursor ?? undefined,
  });

export const useReferralStats = () =>
  useQuery({
    queryKey: [...keys.referrals, 'stats'],
    queryFn: () => get<ReferralStats>('/referrals/stats'),
  });

export function useCreateReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      friendName: string;
      friendMobile: string;
      jobId?: string | null;
      categoryId?: string | null;
    }) => (await api.post<Envelope<Referral>>('/referrals', body)).data.data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.referrals });
      void qc.invalidateQueries({ queryKey: keys.me });
    },
  });
}

export const useNotifications = () =>
  useInfiniteQuery({
    queryKey: keys.notifications,
    queryFn: ({ pageParam }) =>
      getPage<AppNotification>('/notifications', {
        limit: 25,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.page.nextCursor ?? undefined,
  });

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/notifications/read', { all: true }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.notifications }),
  });
}

export function useRegisterDevice() {
  return useMutation({
    mutationFn: (body: { fcmToken: string; platform: 'android' | 'ios' }) =>
      api.post('/me/devices', body),
  });
}
