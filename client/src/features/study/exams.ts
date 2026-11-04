/** Shared exam types and the countdown maths. */

export const EXAM_KINDS = [
  'FIRST',
  'SECOND',
  'MIDTERM',
  'FINAL',
  'QUIZ',
  'OTHER',
] as const;
export type ExamKind = (typeof EXAM_KINDS)[number];

export const TERMS = ['FIRST', 'SECOND', 'SUMMER'] as const;
export type Term = (typeof TERMS)[number];

/** Same limit as the server (PastExamService.MAX_FILE_BYTES). */
export const MAX_EXAM_FILE_BYTES = 10 * 1024 * 1024;
export const EXAM_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export type ExamDate = {
  id: number;
  courseId: number | null;
  title: string;
  kind: ExamKind;
  startsAt: string;
  location: string | null;
};

export type PastExam = {
  id: number;
  courseId: number;
  kind: ExamKind;
  year: number;
  term: Term;
  doctor: string | null;
  withSolution: boolean;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  approved: boolean;
  mine: boolean;
  uploader: string;
  createdAt: string;
};

export type TimeLeft = {
  past: boolean;
  days: number;
  hours: number;
  minutes: number;
};

/** Whole days, hours and minutes from {@code now} until {@code startsAt}. */
export function timeLeft(startsAt: string | Date, now: Date): TimeLeft {
  const ms = new Date(startsAt).getTime() - now.getTime();
  if (ms <= 0) return { past: true, days: 0, hours: 0, minutes: 0 };
  const totalMinutes = Math.floor(ms / 60000);
  return {
    past: false,
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}

/** Upcoming exams soonest first, and past ones most recent first. */
export function splitExams<T extends { startsAt: string }>(
  exams: T[],
  now: Date
): { upcoming: T[]; past: T[] } {
  const at = (e: T) => new Date(e.startsAt).getTime();
  const upcoming = exams
    .filter((e) => at(e) > now.getTime())
    .sort((a, b) => at(a) - at(b));
  const past = exams
    .filter((e) => at(e) <= now.getTime())
    .sort((a, b) => at(b) - at(a));
  return { upcoming, past };
}

/** "<input type=datetime-local>" value for a date, in local time. */
export const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** 1536000 → "1.5 MB", 20480 → "20 KB". */
export const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
