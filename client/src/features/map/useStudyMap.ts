import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { StudyMapDoc } from './mapFormat';

export type PlanKey = 'cpe' | 'ee';
export const PLAN_KEYS: PlanKey[] = ['cpe', 'ee'];

/** GET /api/maps/{plan} (server: StudyMapDto.MapResponse). */
export type StudyMapResponse = {
  plan: PlanKey;
  version: number;
  updatedAt: string | null;
  updatedBy: string | null;
  content: StudyMapDoc;
};

export const studyMapKey = (plan: PlanKey) => ['studyMap', plan] as const;

const cacheKey = (plan: PlanKey) => `engmap.map.${plan}`;

/**
 * The last map this browser saw. API responses are never cached by the service worker, so
 * this is what keeps the map instant on repeat visits and usable offline.
 */
export const readCachedMap = (plan: PlanKey): StudyMapResponse | undefined => {
  try {
    const raw = localStorage.getItem(cacheKey(plan));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StudyMapResponse;
    return Array.isArray(parsed?.content?.nodes) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const writeCachedMap = (map: StudyMapResponse) => {
  try {
    localStorage.setItem(cacheKey(map.plan), JSON.stringify(map));
  } catch {
    // storage full or blocked: the map still works, just not offline
  }
};

export const fetchStudyMap = async (plan: PlanKey) => {
  const { data } = await axios.get<StudyMapResponse>(`/api/maps/${plan}`);
  writeCachedMap(data);
  return data;
};

/** The published map for one plan; starts from the cached copy and refreshes it. */
export function useStudyMap(plan: PlanKey) {
  return useQuery({
    queryKey: studyMapKey(plan),
    queryFn: () => fetchStudyMap(plan),
    initialData: () => readCachedMap(plan),
    // Treat the cached copy as old so it is refreshed right away.
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });
}
