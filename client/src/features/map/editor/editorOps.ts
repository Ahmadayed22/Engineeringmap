import type { Edge, Node } from '@xyflow/react';
import { edgeStyle, ROOT_ID, type StudyMapDoc } from '../mapFormat';
import type { PlanKey } from '../useStudyMap';

/**
 * Colour presets per plan, taken from the 2022 maps: a box colour and the matching arrow
 * colour. `nameKey` is an i18n key.
 */
export type Swatch = { nameKey: string; node: string; edge: string };

export const PALETTES: Record<PlanKey, Swatch[]> = {
  cpe: [
    { nameKey: 'mapEditor.cat.computer', node: '#87032f', edge: '#87032f' },
    { nameKey: 'mapEditor.cat.sciences', node: '#0f3460', edge: '#079cba' },
    { nameKey: 'mapEditor.cat.it', node: '#a87716', edge: '#ffa500' },
    { nameKey: 'mapEditor.cat.electrical', node: '#166e25', edge: '#008000' },
    { nameKey: 'mapEditor.cat.mechatronics', node: '#631d3b', edge: '#641d4b' },
  ],
  ee: [
    { nameKey: 'mapEditor.cat.itSciences', node: '#960202', edge: '#960202' },
    { nameKey: 'mapEditor.cat.electrical', node: '#029640', edge: '#029640' },
    { nameKey: 'mapEditor.cat.computer', node: '#161717', edge: '#161717' },
  ],
};

/** Co-requisite arrows on the CPE map are white. */
export const COREQ_COLOR = '#ffffff';

const colorOf = (n: Node | undefined) =>
  String(
    (n?.style as { backgroundColor?: string } | undefined)?.backgroundColor ??
      '#87032f'
  ).toLowerCase();

/** Arrow colour that goes with a box colour (falls back to the box colour itself). */
export const edgeColorFor = (plan: PlanKey, nodeColor: string) =>
  PALETTES[plan].find((s) => s.node === nodeColor.toLowerCase())?.edge ??
  nodeColor.toLowerCase();

export const nodeColor = colorOf;

export const edgeColor = (e: Edge | undefined) =>
  String(
    (e?.style as { stroke?: string } | undefined)?.stroke ?? '#87032f'
  ).toLowerCase();

export const isCoreq = (e: Edge) =>
  !!(e.style as { strokeDasharray?: unknown } | undefined)?.strokeDasharray;

export const isRootNode = (n: Node | undefined) =>
  !!n && (n.type === 'input' || n.data?.title === ROOT_ID);

/** A new box id for a course: "course-12", then "course-12-2", ... */
export function uniqueNodeId(nodes: Node[], courseId: number): string {
  const taken = new Set(nodes.map((n) => n.id));
  const base = `course-${courseId}`;
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
}

export type ConnectProblem = 'self' | 'toRoot' | 'duplicate' | 'cycle';

/** Why an arrow source → target can't be added, or null if it can. */
export function connectProblem(
  nodes: Node[],
  edges: Edge[],
  source: string,
  target: string
): ConnectProblem | null {
  if (source === target) return 'self';
  if (isRootNode(nodes.find((n) => n.id === target))) return 'toRoot';
  if (edges.some((e) => e.source === source && e.target === target))
    return 'duplicate';
  // A cycle appears if the source can already be reached from the target.
  const out = new Map<string, string[]>();
  for (const e of edges) {
    const list = out.get(e.source) ?? [];
    list.push(e.target);
    out.set(e.source, list);
  }
  const seen = new Set<string>();
  const stack = [target];
  while (stack.length) {
    const id = stack.pop()!;
    if (id === source) return 'cycle';
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...(out.get(id) ?? []));
  }
  return null;
}

export function makeEdge(
  plan: PlanKey,
  nodes: Node[],
  edges: Edge[],
  source: string,
  target: string
): Edge {
  const taken = new Set(edges.map((e) => e.id));
  let id = `${source}-${target}`;
  for (let i = 2; taken.has(id); i++) id = `${source}-${target}-${i}`;
  // On the 2022 maps an arrow takes the colour of the course it points to.
  const color = edgeColorFor(
    plan,
    colorOf(nodes.find((n) => n.id === target))
  );
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    style: edgeStyle(color),
    data: { coreq: false },
  };
}

export const withEdgeStyle = (e: Edge, color: string, coreq: boolean): Edge => ({
  ...e,
  style: edgeStyle(color, coreq),
  data: { ...e.data, coreq },
});

export const withNodeColor = (n: Node, color: string): Node => ({
  ...n,
  style: { ...n.style, backgroundColor: color },
});

/** Renames every box of a course (they are the same course, so they share a name). */
export const renameCourse = (nodes: Node[], courseId: number, label: string) =>
  nodes.map((n) =>
    Number(n.data?.courseId) === courseId
      ? { ...n, data: { ...n.data, label } }
      : n
  );

// ----- Drafts: unpublished edits kept in this browser -----

export type Draft = { baseVersion: number; doc: StudyMapDoc; savedAt: string };

const draftKey = (plan: PlanKey) => `engmap.mapDraft.${plan}`;

export const readDraft = (plan: PlanKey): Draft | null => {
  try {
    const raw = localStorage.getItem(draftKey(plan));
    const draft = raw ? (JSON.parse(raw) as Draft) : null;
    return draft && Array.isArray(draft.doc?.nodes) ? draft : null;
  } catch {
    return null;
  }
};

export const writeDraft = (plan: PlanKey, draft: Draft) => {
  try {
    localStorage.setItem(draftKey(plan), JSON.stringify(draft));
  } catch {
    // storage unavailable: editing still works, the draft just isn't kept
  }
};

export const clearDraft = (plan: PlanKey) => {
  try {
    localStorage.removeItem(draftKey(plan));
  } catch {
    // ignore
  }
};

const canonical = (doc: StudyMapDoc) =>
  JSON.stringify([
    doc.nodes.map((n) => [
      n.id,
      n.courseId ?? null,
      n.label.trim(),
      n.x,
      n.y,
      n.color.toLowerCase(),
      !!n.root,
    ]),
    doc.edges.map((e) => [
      e.id,
      e.source,
      e.target,
      e.color.toLowerCase(),
      !!e.coreq,
    ]),
  ]);

/** Same map content? (positions, labels, colours, arrows; key order doesn't matter) */
export const sameDoc = (a: StudyMapDoc, b: StudyMapDoc) =>
  canonical(a) === canonical(b);
