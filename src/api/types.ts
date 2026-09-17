export type ExperienceBand = '0-1' | '1-3' | '3-5' | '5-10' | '10+';
export type JoiningUrgency = 'immediate' | '15_days' | '30_days';
export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interview'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface Envelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface CursorPage<T> {
  data: T[];
  page: { nextCursor: string | null; hasMore: boolean };
  meta?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  nameGu: string | null;
  slug: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  categoryId: string | null;
  categoryName: string | null;
  experienceBand: ExperienceBand;
  joiningUrgency: JoiningUrgency;
  salaryMin: number;
  salaryMax: number;
  description: string | null;
  requirements: string[];
  referralReward: number;
  tenureMonths: number;
  appliedCount: number;
  postedAt: string | null;
  postedAgo: string | null;
  isNew: boolean;
  hasApplied?: boolean;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  source: 'direct' | 'referred';
  appliedAt: string;
  appliedAgo: string | null;
  interviewAt: string | null;
  interviewDate: string | null;
  interviewLocation: string | null;
  hiredDate: string | null;
  rejectionReason: string | null;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
  } | null;
  timeline?: { from: string | null; to: string; at: string }[];
}

export interface TenureProgress {
  day: number;
  totalDays: number;
  daysRemaining: number;
  isComplete: boolean;
}

export interface Referral {
  id: string;
  friendName: string;
  friendMobile: string;
  status: string;
  statusLabel: string;
  statusBadge: string;
  tenureMonths: number;
  rewardAmount: number;
  hiredDate: string | null;
  tenureDueDate: string | null;
  tenureCompletedDate: string | null;
  tenure: TenureProgress | null;
  sharedAt: string;
  sharedAgo: string | null;
  job: { id: string; title: string; company: string } | null;
  friend: { id: string; name: string; currentOrganization: string | null } | null;
}

export interface EmploymentStint {
  id: string;
  company: string;
  from: string;
  to: string | null;
  period: string;
  isCurrent: boolean;
}

export interface Me {
  id: string;
  mobile: string;
  employeeCode: string | null;
  referralCode: string;
  name: string;
  age: number | null;
  experienceBand: ExperienceBand | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryNameGu: string | null;
  presentSalary: number | null;
  expectedSalary: number | null;
  currentOrganization: string | null;
  isEmployed: boolean;
  totalReferrals: number;
  moneyEarned: number;
  language: string;
  employmentHistory: EmploymentStint[];
}

export interface ReferralStats {
  totalReferrals: number;
  moneyEarned: number;
  byStatus: Record<string, number>;
}

export interface AppNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  data: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  createdAgo: string;
}
