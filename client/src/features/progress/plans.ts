import { useMemo } from 'react';
import { isAxiosError } from 'axios';
import { useQueries } from '@tanstack/react-query';
import type { Edge, Node } from '@xyflow/react';
import { toFlow, type StudyMapDoc } from '@features/map/mapFormat';
import {
  fetchStudyMap,
  readCachedMap,
  studyMapKey,
  useStudyMap,
  type PlanKey,
} from '@features/map/useStudyMap';
import { roadmapPath } from '@features/map/useRoadmaps';
import { buildRequirementGraph, type RequirementGraph } from './prerequisites';

export type { PlanKey };

export type PlanInfo = {
  key: PlanKey;
  /** Where its map is shown, e.g. /computerEngineer or /plan/mechatronics. */
  path: string;
  /** Published map version (0 = not loaded). */
  version: number;
  doc: StudyMapDoc;
  nodes: Node[];
  edges: Edge[];
  graph: RequirementGraph;
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
    path: roadmapPath(key),
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

/** The published map of one roadmap. `plan` is undefined until it has loaded. */
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
    /** The roadmap doesn't exist, or is hidden and the user isn't an admin. */
    notFound:
      !plan &&
      isAxiosError(query.error) &&
      query.error.response?.status === 404,
    refetch: query.refetch,
  };
}

/** The maps of several roadmaps; `plans` is undefined until all of them have loaded. */
export function usePlanMaps(keys: PlanKey[]) {
  const results = useQueries({
    queries: keys.map((key) => ({
      queryKey: studyMapKey(key),
      queryFn: () => fetchStudyMap(key),
      initialData: () => readCachedMap(key),
      initialDataUpdatedAt: 0,
      staleTime: 5 * 60_000,
    })),
  });
  const versions = results.map((r) => r.data?.version ?? -1).join(',');
  const plans = useMemo(() => {
    if (results.some((r) => !r.data)) return undefined;
    const out: Record<PlanKey, PlanInfo> = {};
    results.forEach((r, i) => {
      out[keys[i]] = buildPlan(keys[i], r.data!.content, r.data!.version);
    });
    return out;
    // Rebuilt only when a map version changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join(','), versions]);
  return {
    plans,
    isLoading: !plans && results.some((r) => r.isFetching),
    isError: !plans && results.some((r) => r.isError && !r.data),
  };
}

const LAST_PLAN_KEY = 'engmap.lastPlan';

/** The roadmap last opened in the planner, if it's still one of `available`. */
export const readLastPlan = (available: PlanKey[]): PlanKey | undefined => {
  try {
    const last = localStorage.getItem(LAST_PLAN_KEY);
    return last && available.includes(last) ? last : undefined;
  } catch {
    return undefined;
  }
};

export const saveLastPlan = (plan: PlanKey) => {
  try {
    localStorage.setItem(LAST_PLAN_KEY, plan);
  } catch {
    // ignore: only a convenience
  }
};
