import { useMemo } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { toFlow, type StudyMapDoc } from '@features/map/mapFormat';
import {
  useStudyMap,
  type PlanKey,
  PLAN_KEYS,
} from '@features/map/useStudyMap';
import { buildRequirementGraph, type RequirementGraph } from './prerequisites';

export type { PlanKey };
export { PLAN_KEYS };

export type PlanInfo = {
  key: PlanKey;
  title: string;
  titleAr: string;
  path: string;
  /** Published map version (0 = not loaded). */
  version: number;
  doc: StudyMapDoc;
  nodes: Node[];
  edges: Edge[];
  graph: RequirementGraph;
};

export const PLAN_META: Record<
  PlanKey,
  { title: string; titleAr: string; path: string }
> = {
  cpe: {
    title: 'Computer Engineering',
    titleAr: 'هندسة الحاسوب',
    path: '/computerEngineer',
  },
  ee: {
    title: 'Electrical Engineering',
    titleAr: 'الهندسة الكهربائية',
    path: '/electricalEngineer',
  },
};

/** Plan info (React Flow nodes/edges and requirement graph) from a stored map. */
export function buildPlan(
  key: PlanKey,
  doc: StudyMapDoc,
  version = 0
): PlanInfo {
  const { nodes, edges } = toFlow(doc);
  return {
    key,
    ...PLAN_META[key],
    version,
    doc,
    nodes,
    edges,
    graph: buildRequirementGraph(nodes, edges),
  };
}

const EMPTY: StudyMapDoc = { nodes: [], edges: [] };

/** Stand-in while a map loads, so pages can keep calling their hooks unconditionally. */
export const emptyPlan = (key: PlanKey) => buildPlan(key, EMPTY);

/** The published map of one plan. `plan` is undefined until it has loaded. */
export function usePlan(key: PlanKey) {
  const query = useStudyMap(key);
  const { data } = query;
  const plan = useMemo(
    () => (data ? buildPlan(key, data.content, data.version) : undefined),
    [key, data]
  );
  return {
    plan,
    isLoading: !plan && query.isFetching,
    isError: !plan && query.isError,
    refetch: query.refetch,
  };
}

/** Both plans; `plans` is undefined until both have loaded. */
export function usePlans() {
  const cpe = usePlan('cpe');
  const ee = usePlan('ee');
  const plans = useMemo(
    () => (cpe.plan && ee.plan ? { cpe: cpe.plan, ee: ee.plan } : undefined),
    [cpe.plan, ee.plan]
  );
  return {
    plans,
    isLoading: cpe.isLoading || ee.isLoading,
    isError: cpe.isError || ee.isError,
    refetch: () => {
      void cpe.refetch();
      void ee.refetch();
    },
  };
}

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
