import { describe, expect, it, vi } from 'vitest';
import type { Edge, Node } from '@xyflow/react';
import { fromFlow, toFlow, type StudyMapDoc } from './mapFormat';
import { roadmapPath, roadmapName, roadmapPicture } from './useRoadmaps';
import { fitSize } from './shrinkImage';
import { readLastPlan, saveLastPlan } from '../progress/plans';
import {
  edgeColorFor,
  paletteFor,
  connectProblem,
  edgeColor,
  isCoreq,
  makeEdge,
  renameCourse,
  sameDoc,
  uniqueNodeId,
} from './editor/editorOps';
import cpeMap from './fixtures/cpe.json';
import eeMap from './fixtures/ee.json';
import {
  setServerMessageLang,
  translateServerMessage,
} from '../../i18n/serverMessages';

const small: StudyMapDoc = {
  nodes: [
    { id: 'root', label: 'Plan', x: 0, y: 0, color: '#87032f', root: true },
    { id: 'a', courseId: 1, label: 'A', x: 0, y: 100, color: '#0f3460' },
    { id: 'b', courseId: 2, label: 'B', x: 0, y: 200, color: '#87032f' },
    { id: 'a2', courseId: 1, label: 'A', x: 200, y: 200, color: '#0f3460' },
  ],
  edges: [
    { id: 'root-a', source: 'root', target: 'a', color: '#079cba' },
    { id: 'a-b', source: 'a', target: 'b', color: '#87032f', coreq: true },
  ],
};

describe('map format', () => {
  it('round-trips the seeded 2022 maps without changes', () => {
    for (const doc of [cpeMap, eeMap] as StudyMapDoc[]) {
      const { nodes, edges } = toFlow(doc);
      expect(sameDoc(fromFlow(nodes, edges), doc)).toBe(true);
    }
  });

  it('draws the banner as the input node and co-requisites dashed', () => {
    const { nodes, edges } = toFlow(small);
    expect(nodes[0].type).toBe('input');
    expect(nodes[1]).toMatchObject({ type: 'custom', data: { courseId: 1 } });
    expect(isCoreq(edges[1])).toBe(true);
    expect(isCoreq(edges[0])).toBe(false);
  });

  it('treats key order and colour case as the same map', () => {
    const shuffled: StudyMapDoc = {
      nodes: small.nodes.map((n) => ({ ...n, color: n.color.toUpperCase() })),
      edges: small.edges,
    };
    expect(sameDoc(shuffled, small)).toBe(true);
    expect(
      sameDoc({ ...small, nodes: small.nodes.map((n, i) => (i === 1 ? { ...n, x: 5 } : n)) }, small)
    ).toBe(false);
  });
});

describe('map editor rules', () => {
  const { nodes, edges } = toFlow(small);

  it('refuses arrows that would break the map', () => {
    expect(connectProblem(nodes, edges, 'a', 'a')).toBe('self');
    expect(connectProblem(nodes, edges, 'a', 'root')).toBe('toRoot');
    expect(connectProblem(nodes, edges, 'a', 'b')).toBe('duplicate');
    expect(connectProblem(nodes, edges, 'b', 'a')).toBe('cycle');
    expect(connectProblem(nodes, edges, 'a2', 'b')).toBeNull();
  });

  it('colours a new arrow like the course it points to', () => {
    const e: Edge = makeEdge('cpe', nodes, edges, 'b', 'a2');
    expect(e.id).toBe('b-a2');
    expect(edgeColor(e)).toBe('#079cba'); // sciences box → sciences arrow
    expect(makeEdge('cpe', nodes, [...edges, e], 'b', 'a2').id).toBe('b-a2-2');
  });

  it('gives new boxes unique ids and renames every box of a course', () => {
    const extra: Node = { ...nodes[1], id: 'course-1' };
    expect(uniqueNodeId(nodes, 1)).toBe('course-1');
    expect(uniqueNodeId([...nodes, extra], 1)).toBe('course-1-2');
    const renamed = renameCourse(nodes, 1, 'Calculus');
    expect(renamed.filter((n) => n.data.label === 'Calculus').map((n) => n.id)).toEqual(['a', 'a2']);
  });
});

describe('map error messages', () => {
  it('translates messages with a detail part and keeps the detail', () => {
    setServerMessageLang('ar');
    expect(translateServerMessage('Prerequisites go in a circle: A → B → A')).toBe(
      'المتطلبات تدور في حلقة: A → B → A'
    );
    expect(translateServerMessage('Something unknown: x')).toBe('Something unknown: x');
    setServerMessageLang('en');
    expect(translateServerMessage('Prerequisites go in a circle: A')).toBe(
      'Prerequisites go in a circle: A'
    );
  });
});

describe('roadmaps', () => {
  it('keeps the original addresses for CPE and EE', () => {
    expect(roadmapPath('cpe')).toBe('/computerEngineer');
    expect(roadmapPath('ee')).toBe('/electricalEngineer');
    expect(roadmapPath('mechatronics-engineering')).toBe('/plan/mechatronics-engineering');
  });

  it('names a roadmap in the interface language', () => {
    const r = { nameAr: 'الميكاترونكس', nameEn: 'Mechatronics' };
    expect(roadmapName(r, 'ar')).toBe('الميكاترونكس');
    expect(roadmapName(r, 'en')).toBe('Mechatronics');
  });

  it('gives new roadmaps every colour preset of both original maps', () => {
    const colours = paletteFor('mechatronics').map((s) => s.node);
    expect(colours).toEqual(expect.arrayContaining(['#87032f', '#0f3460', '#029640', '#960202']));
    expect(edgeColorFor('mechatronics', '#0F3460')).toBe('#079cba');
    expect(paletteFor('ee').map((s) => s.node)).toEqual(['#960202', '#029640', '#161717']);
  });

  it('reopens the last roadmap in the planner only if it still exists', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
    saveLastPlan('mechatronics');
    expect(readLastPlan(['cpe', 'ee', 'mechatronics'])).toBe('mechatronics');
    expect(readLastPlan(['cpe', 'ee'])).toBeUndefined();
    vi.unstubAllGlobals();
  });
});

describe('roadmap pictures', () => {
  it('shrinks big pictures to fit 1600x1200 and never enlarges small ones', () => {
    expect(fitSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitSize(3200, 1000)).toEqual({ width: 1600, height: 500 });
    expect(fitSize(1000, 3000)).toEqual({ width: 400, height: 1200 });
    expect(fitSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('uses the uploaded picture, else the bundled one for CPE/EE, else none', () => {
    expect(roadmapPicture({ slug: 'new-plan', imageVersion: 42 })).toMatch(
      /\/api\/plans\/new-plan\/image\?v=42$/
    );
    expect(roadmapPicture({ slug: 'cpe', imageVersion: 7 })).toMatch(/\/api\/plans\/cpe\/image\?v=7$/);
    expect(roadmapPicture({ slug: 'cpe', imageVersion: null })).toMatch(/cpe.*\.webp/);
    expect(roadmapPicture({ slug: 'new-plan', imageVersion: null })).toBeUndefined();
  });
});
