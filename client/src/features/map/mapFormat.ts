import type { CSSProperties } from 'react';
import type { Edge, Node } from '@xyflow/react';

/**
 * The study-plan map as the API stores it (server: StudyMapDto). Only plain data: colours,
 * positions and labels. Everything visual is derived here, so the stored map can't carry
 * arbitrary styles.
 */
export type MapNodeDoc = {
  id: string;
  /** Missing only on the title banner. */
  courseId?: number;
  label: string;
  x: number;
  y: number;
  /** Box colour, "#rrggbb". */
  color: string;
  /** The title banner at the top of the map. */
  root?: boolean;
};

export type MapEdgeDoc = {
  id: string;
  /** Required before `target`. */
  source: string;
  target: string;
  /** Arrow colour, "#rrggbb". */
  color: string;
  /** Co-requisite: may be taken in the same semester (drawn dashed). */
  coreq?: boolean;
};

export type StudyMapDoc = {
  nodes: MapNodeDoc[];
  edges: MapEdgeDoc[];
};

export const ROOT_ID = 'root';

const courseStyle = (color: string): CSSProperties => ({
  borderRadius: '14px',
  backgroundColor: color,
});

const rootStyle = (color: string): CSSProperties => ({
  width: 1500,
  borderRadius: 15,
  backgroundColor: color,
  fontSize: 30,
  padding: 15,
  color: 'white',
});

export const edgeStyle = (color: string, coreq?: boolean): CSSProperties => ({
  strokeWidth: 4,
  stroke: color,
  ...(coreq ? { strokeDasharray: '5,5' } : {}),
});

export function toFlowNode(n: MapNodeDoc): Node {
  if (n.root) {
    return {
      id: n.id,
      type: 'input',
      position: { x: n.x, y: n.y },
      data: { label: n.label, title: ROOT_ID },
      style: rootStyle(n.color),
    };
  }
  return {
    id: n.id,
    type: 'custom',
    position: { x: n.x, y: n.y },
    data: { label: n.label, courseId: n.courseId, title: n.id },
    style: courseStyle(n.color),
  };
}

export function toFlowEdge(e: MapEdgeDoc): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    style: edgeStyle(e.color, e.coreq),
    data: { coreq: !!e.coreq },
  };
}

/** Stored map → React Flow nodes and edges. */
export function toFlow(doc: StudyMapDoc): { nodes: Node[]; edges: Edge[] } {
  return { nodes: doc.nodes.map(toFlowNode), edges: doc.edges.map(toFlowEdge) };
}

const colorOf = (style: unknown, key: 'backgroundColor' | 'stroke') => {
  const value = (style as Record<string, unknown> | undefined)?.[key];
  return typeof value === 'string' ? value.toLowerCase() : '#87032f';
};

const round = (v: number) => Math.round(v * 10) / 10;

/** React Flow nodes and edges (e.g. from the editor) → stored map. */
export function fromFlow(nodes: Node[], edges: Edge[]): StudyMapDoc {
  return {
    nodes: nodes.map((n) => {
      const isRoot = n.type === 'input' || n.data?.title === ROOT_ID;
      const label = String(n.data?.label ?? '').trim();
      const base = {
        id: n.id,
        label,
        x: round(n.position.x),
        y: round(n.position.y),
        color: colorOf(n.style, 'backgroundColor'),
      };
      return isRoot
        ? { ...base, root: true }
        : { ...base, courseId: Number(n.data?.courseId) };
    }),
    edges: edges.map((e) => {
      const dashed = !!(e.style as { strokeDasharray?: unknown } | undefined)
        ?.strokeDasharray;
      const doc: MapEdgeDoc = {
        id: e.id,
        source: e.source,
        target: e.target,
        color: colorOf(e.style, 'stroke'),
      };
      return dashed ? { ...doc, coreq: true } : doc;
    }),
  };
}
