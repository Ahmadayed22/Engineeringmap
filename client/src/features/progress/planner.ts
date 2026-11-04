import type { CourseId, RequirementGraph } from './prerequisites';

export type PlanEntry = { courseId: CourseId; semester: number };

export type PlanIssue =
  | {
      kind: 'missingPrereq';
      courseId: CourseId;
      semester: number;
      missing: CourseId[];
    }
  | {
      kind: 'missingCoreq';
      courseId: CourseId;
      semester: number;
      missing: CourseId[];
    }
  | { kind: 'overload'; semester: number; hours: number }
  | { kind: 'alreadyCompleted'; courseId: CourseId; semester: number };

/** University-style load limits used for warnings (not enforced). */
export const MAX_SEMESTER_HOURS = 18;

/**
 * Checks a semester plan against prerequisites:
 * - a prerequisite must be completed or planned in an EARLIER semester;
 * - a co-requisite may also be planned in the SAME semester;
 * - semesters above MAX_SEMESTER_HOURS are flagged.
 */
export function validatePlan(
  graph: RequirementGraph,
  plan: PlanEntry[],
  completed: ReadonlySet<CourseId>,
  creditHours: ReadonlyMap<CourseId, number>
): PlanIssue[] {
  const semesterOf = new Map(plan.map((p) => [p.courseId, p.semester]));
  const doneBy = (c: CourseId, semester: number, sameAllowed: boolean) => {
    if (completed.has(c)) return true;
    const s = semesterOf.get(c);
    return s !== undefined && (sameAllowed ? s <= semester : s < semester);
  };

  const issues: PlanIssue[] = [];
  const hoursBySemester = new Map<number, number>();

  for (const { courseId, semester } of plan) {
    hoursBySemester.set(
      semester,
      (hoursBySemester.get(semester) ?? 0) + (creditHours.get(courseId) ?? 0)
    );
    if (completed.has(courseId)) {
      issues.push({ kind: 'alreadyCompleted', courseId, semester });
      continue;
    }
    const course = graph.courses.get(courseId);
    if (!course) continue;
    const missingPre = [...course.prerequisites].filter(
      (c) => !doneBy(c, semester, false)
    );
    if (missingPre.length)
      issues.push({
        kind: 'missingPrereq',
        courseId,
        semester,
        missing: missingPre,
      });
    const missingCo = [...course.corequisites].filter(
      (c) => !doneBy(c, semester, true)
    );
    if (missingCo.length)
      issues.push({
        kind: 'missingCoreq',
        courseId,
        semester,
        missing: missingCo,
      });
  }

  for (const [semester, hours] of hoursBySemester) {
    if (hours > MAX_SEMESTER_HOURS)
      issues.push({ kind: 'overload', semester, hours });
  }
  return issues;
}

/** Courses that could go into `semester` given everything completed or planned before it. */
export function eligibleForSemester(
  graph: RequirementGraph,
  plan: PlanEntry[],
  completed: ReadonlySet<CourseId>,
  semester: number
): CourseId[] {
  const planned = new Map(plan.map((p) => [p.courseId, p.semester]));
  const before = (c: CourseId) =>
    completed.has(c) || (planned.get(c) ?? Infinity) < semester;
  const upTo = (c: CourseId) =>
    completed.has(c) || (planned.get(c) ?? Infinity) <= semester;
  const prereqsBefore = (c: CourseId) =>
    [...(graph.courses.get(c)?.prerequisites ?? [])].every(before);
  // Same rule as the map: a co-requisite you could also take that semester doesn't block.
  // validatePlan still warns until the co-requisite is actually planned.
  return [...graph.courses.values()]
    .filter((c) => !completed.has(c.courseId) && !planned.has(c.courseId))
    .filter(
      (c) =>
        [...c.prerequisites].every(before) &&
        [...c.corequisites].every((x) => upTo(x) || prereqsBefore(x))
    )
    .map((c) => c.courseId);
}
