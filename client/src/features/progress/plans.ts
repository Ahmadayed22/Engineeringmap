import type { Edge, Node } from '@xyflow/react';
import { initialNodes as cpeNodes } from '@components/layout/node/cpeNode/initialNodes';
import { initialEdges as cpeEdges } from '@components/layout/edge/cpeEdge/initialEdges';
import { initialNodesEE } from '@components/layout/node/EENode/initialNodesEE';
import { initialEdgesEE } from '@components/layout/edge/EeEdge/initialEdgesEE';
import { buildRequirementGraph, type RequirementGraph } from './prerequisites';

export type PlanKey = 'cpe' | 'ee';

export type PlanInfo = {
  key: PlanKey;
  title: string;
  titleAr: string;
  path: string;
  nodes: Node[];
  edges: Edge[];
  graph: RequirementGraph;
};

/** Both study plans, with their requirement graphs built once. */
export const PLANS: Record<PlanKey, PlanInfo> = {
  cpe: {
    key: 'cpe',
    title: 'Computer Engineering',
    titleAr: 'هندسة الحاسوب',
    path: '/computerEngineer',
    nodes: cpeNodes,
    edges: cpeEdges,
    graph: buildRequirementGraph(cpeNodes, cpeEdges),
  },
  ee: {
    key: 'ee',
    title: 'Electrical Engineering',
    titleAr: 'الهندسة الكهربائية',
    path: '/electricalEngineer',
    nodes: initialNodesEE,
    edges: initialEdgesEE,
    graph: buildRequirementGraph(initialNodesEE, initialEdgesEE),
  },
};

const LAST_PLAN_KEY = 'engmap.lastPlan';

export const readLastPlan = (): PlanKey => {
  try {
    return localStorage.getItem(LAST_PLAN_KEY) === 'ee' ? 'ee' : 'cpe';
  } catch {
    return 'cpe';
  }
};

export const saveLastPlan = (plan: PlanKey) => {
  try {
    localStorage.setItem(LAST_PLAN_KEY, plan);
  } catch {
    // ignore: only a convenience
  }
};
