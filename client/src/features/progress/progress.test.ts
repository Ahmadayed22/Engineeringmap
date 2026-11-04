import { describe, expect, it } from 'vitest';
import type { Edge, Node } from '@xyflow/react';
import { buildRequirementGraph, computeCourseStates } from './prerequisites';
import { computeGpa } from './gpa';
import { normalizeForSearch, searchCourses } from './search';
import { eligibleForSemester, validatePlan } from './planner';
import { initialNodes as cpeNodes } from '@components/layout/node/cpeNode/initialNodes';
import { initialEdges as cpeEdges } from '@components/layout/edge/cpeEdge/initialEdges';
import { initialNodesEE } from '@components/layout/node/EENode/initialNodesEE';
import { initialEdgesEE } from '@components/layout/edge/EeEdge/initialEdgesEE';

const node = (id: string, courseId?: number): Node => ({
  id,
  position: { x: 0, y: 0 },
  data: { label: id, courseId, title: id },
});
const edge = (source: string, target: string, dashed = false): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  style: dashed ? { strokeDasharray: '5,5' } : {},
});

describe('buildRequirementGraph', () => {
  it('reads prerequisites from edges and ignores the root banner', () => {
    const g = buildRequirementGraph(
      [node('root'), node('calc1', 1), node('calc2', 2)],
      [edge('root', 'calc1'), edge('calc1', 'calc2')]
    );
    expect([...g.courses.get(1)!.prerequisites]).toEqual([]);
    expect([...g.courses.get(2)!.prerequisites]).toEqual([1]);
  });

  it('treats dashed edges as co-requisites', () => {
    const g = buildRequirementGraph(
      [node('phys', 1), node('lab', 2)],
      [edge('phys', 'lab', true)]
    );
    expect([...g.courses.get(2)!.corequisites]).toEqual([1]);
    expect(g.courses.get(2)!.prerequisites.size).toBe(0);
  });

  it('a repeated course adds its parent as a requirement of its children, not of itself', () => {
    // skills is required by arch; skills is drawn again under logic to say arch needs both.
    const g = buildRequirementGraph(
      [
        node('basics', 1),
        node('skills', 2),
        node('logic', 3),
        node('skills-copy', 2),
        node('arch', 4),
      ],
      [
        edge('basics', 'skills'),
        edge('logic', 'skills-copy'),
        edge('skills-copy', 'arch'),
      ]
    );
    expect([...g.courses.get(2)!.prerequisites]).toEqual([1]); // not 3
    expect([...g.courses.get(4)!.prerequisites].sort()).toEqual([2, 3]);
  });

  it('reports edges that point at missing nodes', () => {
    const g = buildRequirementGraph([node('a', 1)], [edge('ghost', 'a')]);
    expect(g.brokenEdges).toEqual(['ghost-a']);
  });
});

describe('computeCourseStates', () => {
  const g = buildRequirementGraph(
    [node('phys', 1), node('lab', 2), node('phys2', 3)],
    [edge('phys', 'lab', true), edge('phys', 'phys2')]
  );

  it('everything without prerequisites is available at the start', () => {
    const s = computeCourseStates(g, new Set());
    expect(s.get(1)!.status).toBe('available');
    expect(s.get(3)).toEqual({ status: 'locked', missing: [1], takeWith: [] });
    // the lab can be taken together with Physics 1
    expect(s.get(2)).toEqual({
      status: 'available',
      missing: [],
      takeWith: [1],
    });
  });

  it('unlocks courses once prerequisites are completed', () => {
    const s = computeCourseStates(g, new Set([1]));
    expect(s.get(1)!.status).toBe('completed');
    expect(s.get(3)!.status).toBe('available');
    expect(s.get(2)).toEqual({
      status: 'available',
      missing: [],
      takeWith: [],
    });
  });
});

describe('real study plans', () => {
  for (const [name, nodes, edges] of [
    ['CPE', cpeNodes, cpeEdges],
    ['EE', initialNodesEE, initialEdgesEE],
  ] as const) {
    it(`${name}: builds without cycles and every course is reachable from an empty start`, () => {
      const g = buildRequirementGraph(nodes, edges);
      expect(g.courses.size).toBeGreaterThan(40);
      // Complete available courses repeatedly; with no cycles everything gets completed.
      const done = new Set<number>();
      for (let round = 0; round < 40 && done.size < g.courses.size; round++) {
        const states = computeCourseStates(g, done);
        const next = [...states]
          .filter(([, st]) => st.status === 'available')
          .map(([id]) => id);
        if (next.length === 0) break;
        next.forEach((id) => done.add(id));
      }
      expect(done.size).toBe(g.courses.size);
    });
  }

  it('CPE: Computer Skills is not made to require Digital Logic by its repeated node', () => {
    const g = buildRequirementGraph(cpeNodes, cpeEdges);
    const skills = g.courses.get(22)!; // المهارات الحاسوبية للمهندسين
    const digitalLogic = g.courses.get(23)!;
    expect(skills.prerequisites.has(digitalLogic.courseId)).toBe(false);
  });
});

describe('computeGpa', () => {
  const hours = new Map([
    [1, 3],
    [2, 1],
    [3, 3],
  ]);

  it('weights by credit hours', () => {
    expect(computeGpa({ 1: 'A', 2: 'F' }, hours)).toEqual({
      gpa: Math.round(((4 * 3 + 0.5 * 1) / 4) * 100) / 100,
      gradedHours: 4,
      missingHours: [],
    });
  });

  it('skips unknown grades and reports courses without credit hours', () => {
    expect(computeGpa({ 1: 'B', 9: 'A', 3: 'Z' }, hours)).toEqual({
      gpa: 3,
      gradedHours: 3,
      missingHours: [9],
    });
  });

  it('applies what-if overrides on top of saved marks', () => {
    expect(computeGpa({ 1: 'C' }, hours, { 1: 'A', 3: 'A' }).gpa).toBe(4);
  });

  it('returns null when nothing can be counted', () => {
    expect(computeGpa({}, hours).gpa).toBeNull();
  });
});

describe('course search', () => {
  const items = [
    { id: 1, name: 'الفيزياء العامة 1' },
    { id: 2, name: 'الفيزياء العملية 1' },
    { id: 3, name: 'تفاضل وتكامل 1' },
    { id: 4, name: 'Data Structures' },
  ];

  it('ignores alef variants, taa marbuta and diacritics', () => {
    expect(normalizeForSearch('أَلفيزياء العامّة')).toBe(
      normalizeForSearch('الفيزياء العامه')
    );
  });

  it('ranks prefix matches first and matches all words', () => {
    expect(searchCourses(items, 'الفيزياء').map((i) => i.id)).toEqual([1, 2]);
    expect(searchCourses(items, 'تكامل تفاضل').map((i) => i.id)).toEqual([3]);
    expect(searchCourses(items, 'data').map((i) => i.id)).toEqual([4]);
    expect(searchCourses(items, '   ')).toEqual([]);
  });
});

describe('semester planner', () => {
  // calc1 -> calc2 -> calc3 ; phys -(co)-> lab
  const g = buildRequirementGraph(
    [
      node('calc1', 1),
      node('calc2', 2),
      node('calc3', 3),
      node('phys', 4),
      node('lab', 5),
    ],
    [edge('calc1', 'calc2'), edge('calc2', 'calc3'), edge('phys', 'lab', true)]
  );
  const hours = new Map([
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 1],
  ]);

  it('accepts a plan that respects prerequisites and co-requisites', () => {
    const plan = [
      { courseId: 2, semester: 1 },
      { courseId: 3, semester: 2 },
      { courseId: 4, semester: 1 },
      { courseId: 5, semester: 1 }, // co-requisite in the same semester is fine
    ];
    expect(validatePlan(g, plan, new Set([1]), hours)).toEqual([]);
  });

  it('flags prerequisites planned in the same or a later semester', () => {
    const issues = validatePlan(
      g,
      [
        { courseId: 2, semester: 2 },
        { courseId: 3, semester: 2 },
      ],
      new Set([1]),
      hours
    );
    expect(issues).toEqual([
      { kind: 'missingPrereq', courseId: 3, semester: 2, missing: [2] },
    ]);
  });

  it('flags missing co-requisites, completed courses and overloaded semesters', () => {
    const plan = [
      { courseId: 5, semester: 1 },
      { courseId: 1, semester: 1 },
    ];
    const issues = validatePlan(g, plan, new Set([1]), new Map([[5, 19]]));
    expect(issues).toContainEqual({
      kind: 'missingCoreq',
      courseId: 5,
      semester: 1,
      missing: [4],
    });
    expect(issues).toContainEqual({
      kind: 'alreadyCompleted',
      courseId: 1,
      semester: 1,
    });
    expect(issues).toContainEqual({ kind: 'overload', semester: 1, hours: 19 });
  });

  it('suggests courses that would be eligible in a given semester', () => {
    const plan = [{ courseId: 2, semester: 1 }];
    expect(eligibleForSemester(g, plan, new Set([1]), 1).sort()).toEqual([
      4, 5,
    ]);
    expect(eligibleForSemester(g, plan, new Set([1]), 2).sort()).toEqual([
      3, 4, 5,
    ]);
  });
});
