import { useMemo } from 'react';
import type { Edge, Node } from '@xyflow/react';
import useCourseQueries from '@hooks/ReactQueryHook/courses/useCourseQueries';
import {
  buildRequirementGraph,
  computeCourseStates,
  type CourseId,
  type CourseState,
  type RequirementGraph,
} from './prerequisites';
import { computeGpa, type GpaSummary } from './gpa';

export type CourseProgress = {
  graph: RequirementGraph;
  states: Map<CourseId, CourseState>;
  totalCourses: number;
  completedCount: number;
  available: CourseId[];
  creditHours: Map<CourseId, number>;
  completedHours: number;
  totalHours: number;
  /** Completed courses whose credit hours the API doesn't know. */
  completedWithoutHours: number;
  gpa: GpaSummary;
  marks: Record<number, string>;
};

/**
 * Everything the map needs to show "what can I take next" and the progress summary.
 * `completed` and `marks` come from the same queries the map already uses.
 */
export function useCourseProgress(
  nodes: Node[],
  edges: Edge[],
  completed: ReadonlySet<number>,
  marks: Record<number, string>
): CourseProgress {
  const graph = useMemo(
    () => buildRequirementGraph(nodes, edges),
    [nodes, edges]
  );

  const { useCoursesQuery } = useCourseQueries();
  const { data: courses } = useCoursesQuery();

  const creditHours = useMemo(() => {
    const map = new Map<CourseId, number>();
    for (const c of courses ?? []) {
      if (typeof c.creditHours === 'number' && c.creditHours > 0)
        map.set(c.id, c.creditHours);
    }
    return map;
  }, [courses]);

  return useMemo(() => {
    // Only count completions for courses on this plan.
    const done = new Set([...completed].filter((id) => graph.courses.has(id)));
    const states = computeCourseStates(graph, done);
    const available = [...states]
      .filter(([, s]) => s.status === 'available')
      .map(([id]) => id);

    let completedHours = 0;
    let totalHours = 0;
    let completedWithoutHours = 0;
    for (const id of graph.courses.keys()) {
      const h = creditHours.get(id) ?? 0;
      totalHours += h;
      if (done.has(id)) {
        if (h > 0) completedHours += h;
        else completedWithoutHours += 1;
      }
    }

    const planMarks = Object.fromEntries(
      Object.entries(marks).filter(([id]) => graph.courses.has(Number(id)))
    );

    return {
      graph,
      states,
      totalCourses: graph.courses.size,
      completedCount: done.size,
      available,
      creditHours,
      completedHours,
      totalHours,
      completedWithoutHours,
      gpa: computeGpa(planMarks, creditHours),
      marks: planMarks,
    };
  }, [graph, completed, marks, creditHours]);
}
