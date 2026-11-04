/** Grade points used across the app (same scale as the GPA calculator page). */
export const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  'A-': 3.75,
  'B+': 3.5,
  B: 3.0,
  'B-': 2.75,
  'C+': 2.5,
  C: 2.0,
  'C-': 1.75,
  'D+': 1.5,
  D: 1.25,
  'D-': 1.0,
  F: 0.5,
};

export const GRADES = Object.keys(GRADE_POINTS);

export type GpaSummary = {
  /** Weighted GPA rounded to 2 decimals, or null when nothing can be counted. */
  gpa: number | null;
  /** Credit hours included in the GPA. */
  gradedHours: number;
  /** Courses that have a grade but no known credit hours, so they were left out. */
  missingHours: number[];
};

/**
 * Credit-hour weighted GPA from saved marks.
 * `marks` maps courseId → grade letter, `creditHours` maps courseId → hours.
 * `overrides` replaces or adds grades for "what if" scenarios without touching saved data.
 */
export function computeGpa(
  marks: Record<number, string>,
  creditHours: ReadonlyMap<number, number>,
  overrides: Record<number, string> = {}
): GpaSummary {
  const combined: Record<number, string> = { ...marks, ...overrides };
  let points = 0;
  let hours = 0;
  const missingHours: number[] = [];

  for (const [key, grade] of Object.entries(combined)) {
    const courseId = Number(key);
    const value = GRADE_POINTS[grade];
    if (value === undefined) continue;
    const h = creditHours.get(courseId);
    if (!h || h <= 0) {
      missingHours.push(courseId);
      continue;
    }
    points += value * h;
    hours += h;
  }

  return {
    gpa: hours > 0 ? Math.round((points / hours) * 100) / 100 : null,
    gradedHours: hours,
    missingHours,
  };
}
