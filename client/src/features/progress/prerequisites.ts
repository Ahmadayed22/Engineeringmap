import type { Edge, Node } from '@xyflow/react';

/**
 * Turns a study-plan map (React Flow nodes + edges) into course requirements.
 *
 * How the maps encode requirements:
 * - An edge A → B means "A is required before B".
 * - A dashed edge (strokeDasharray) means co-requisite: B may be taken together with A
 *   (e.g. Physics 1 → Physics Lab 1).
 * - The same course can appear more than once. The first node for a courseId is its
 *   "primary" node and defines that course's own requirements. Later copies are drawn
 *   under another course only to say "this AND that are needed for what follows": the
 *   copy's parents become extra requirements for the copy's children, not for the
 *   copied course itself.
 * - Edges from the "root" banner are just layout.
 */

export type CourseId = number;

export type CourseRequirement = {
  courseId: CourseId;
  /** Display name taken from the primary node's label. */
  name: string;
  /** Primary node id, used to focus the course on the map. */
  nodeId: string;
  prerequisites: Set<CourseId>;
  corequisites: Set<CourseId>;
};

export type RequirementGraph = {
  courses: Map<CourseId, CourseRequirement>;
  /** Edges whose source or target node doesn't exist (data problems in the map). */
  brokenEdges: string[];
};

export type CourseStatus = 'completed' | 'available' | 'locked';

export type CourseState = {
  status: CourseStatus;
  /** Prerequisites (and co-requisites that can't be taken yet) still missing. */
  missing: CourseId[];
  /** Co-requisites not yet completed: take them in the same semester. */
  takeWith: CourseId[];
};

const courseIdOf = (node: Node | undefined): CourseId | null => {
  const raw = node?.data?.courseId;
  if (raw === undefined || raw === null || raw === '') return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
};

const isDashed = (edge: Edge) =>
  !!(edge.style as { strokeDasharray?: unknown } | undefined)?.strokeDasharray;

export function buildRequirementGraph(
  nodes: Node[],
  edges: Edge[]
): RequirementGraph {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const primaryNodeOf = new Map<CourseId, Node>();
  for (const node of nodes) {
    const id = courseIdOf(node);
    if (id !== null && !primaryNodeOf.has(id)) primaryNodeOf.set(id, node);
  }

  const incoming = new Map<string, string[]>();
  const brokenEdges: string[] = [];
  for (const edge of edges) {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) {
      brokenEdges.push(edge.id);
      continue;
    }
    incoming.set(edge.target, [
      ...(incoming.get(edge.target) ?? []),
      edge.source,
    ]);
  }

  const isPrimary = (node: Node) => {
    const id = courseIdOf(node);
    return id !== null && primaryNodeOf.get(id) === node;
  };

  /** Courses implied by passing through `nodeId` as a parent. */
  const requirementsVia = (
    nodeId: string,
    seen = new Set<string>()
  ): CourseId[] => {
    if (seen.has(nodeId)) return [];
    seen.add(nodeId);
    const node = nodeById.get(nodeId);
    const id = courseIdOf(node);
    if (id === null || !node) return []; // root / layout nodes
    if (isPrimary(node)) return [id];
    // A repeated course: it and its own parents are all required.
    return [
      id,
      ...(incoming.get(nodeId) ?? []).flatMap((p) => requirementsVia(p, seen)),
    ];
  };

  const courses = new Map<CourseId, CourseRequirement>();
  for (const [id, node] of primaryNodeOf) {
    const label =
      typeof node.data?.label === 'string' ? node.data.label : String(id);
    courses.set(id, {
      courseId: id,
      name: label.trim(),
      nodeId: node.id,
      prerequisites: new Set(),
      corequisites: new Set(),
    });
  }

  for (const edge of edges) {
    const target = nodeById.get(edge.target);
    if (!target || !nodeById.has(edge.source) || !isPrimary(target)) continue;
    const targetId = courseIdOf(target)!;
    const course = courses.get(targetId)!;
    const required = requirementsVia(edge.source);
    if (required.length === 0) continue;
    const [direct, ...implied] = required;
    (isDashed(edge) ? course.corequisites : course.prerequisites).add(direct);
    implied.forEach((c) => course.prerequisites.add(c));
  }

  // A course never requires itself (can happen with repeated nodes).
  for (const course of courses.values()) {
    course.prerequisites.delete(course.courseId);
    course.corequisites.delete(course.courseId);
    course.corequisites.forEach(
      (c) => course.prerequisites.has(c) && course.corequisites.delete(c)
    );
  }

  return { courses, brokenEdges };
}

export function computeCourseStates(
  graph: RequirementGraph,
  completed: ReadonlySet<CourseId>
): Map<CourseId, CourseState> {
  const states = new Map<CourseId, CourseState>();
  const prereqsMet = (course: CourseRequirement) =>
    [...course.prerequisites].every((c) => completed.has(c));

  for (const course of graph.courses.values()) {
    if (completed.has(course.courseId)) {
      states.set(course.courseId, {
        status: 'completed',
        missing: [],
        takeWith: [],
      });
      continue;
    }
    const missing = [...course.prerequisites].filter((c) => !completed.has(c));
    const takeWith: CourseId[] = [];
    for (const co of course.corequisites) {
      if (completed.has(co)) continue;
      const coCourse = graph.courses.get(co);
      // A co-requisite you could register for now can be taken in the same semester.
      if (coCourse && prereqsMet(coCourse)) takeWith.push(co);
      else missing.push(co);
    }
    states.set(course.courseId, {
      status: missing.length === 0 ? 'available' : 'locked',
      missing,
      takeWith,
    });
  }
  return states;
}
