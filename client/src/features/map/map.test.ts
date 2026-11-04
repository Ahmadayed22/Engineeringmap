import { describe, expect, it } from 'vitest';
import type { Edge, Node } from '@xyflow/react';
import { fromFlow, toFlow, type StudyMapDoc } from './mapFormat';
import {
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
