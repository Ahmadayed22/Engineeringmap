import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@hooks/CustomHook/useAuth';
import type { Lang } from '@i18n/context';

/** A roadmap (study plan) from GET /api/plans (server: StudyPlanDto.PlanInfo). */
export type Roadmap = {
  slug: string;
  nameAr: string;
  nameEn: string;
  /** Hidden roadmaps are listed for admins only. */
  visible: boolean;
  sortOrder: number;
};

export const roadmapsKey = (admin: boolean) => ['roadmaps', admin] as const;

const CACHE_KEY = 'engmap.roadmaps';

/** The two original roadmaps; used until the list has loaded once (and offline). */
export const BUILT_IN_ROADMAPS: Roadmap[] = [
  { slug: 'cpe', nameAr: 'هندسة الحاسوب', nameEn: 'Computer Engineering', visible: true, sortOrder: 1 },
  { slug: 'ee', nameAr: 'الهندسة الكهربائية', nameEn: 'Electrical Engineering', visible: true, sortOrder: 2 },
];

const readCached = (): Roadmap[] | undefined => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const list = raw ? (JSON.parse(raw) as Roadmap[]) : undefined;
    return Array.isArray(list) && list.length ? list : undefined;
  } catch {
    return undefined;
  }
};

const writeCached = (list: Roadmap[]) => {
  try {
    // Only what everyone may see: hidden roadmaps never go into the shared cache.
    localStorage.setItem(CACHE_KEY, JSON.stringify(list.filter((r) => r.visible)));
  } catch {
    // ignore: only a convenience
  }
};

/**
 * All roadmaps the current user can see, in display order. Admins also get hidden ones.
 * Starts from the last list this browser saw so the home page and map work offline.
 */
export function useRoadmaps() {
  const { isAdmin } = useAuth();
  const query = useQuery({
    queryKey: roadmapsKey(isAdmin),
    queryFn: async () => {
      const { data } = await axios.get<Roadmap[]>('/api/plans');
      writeCached(data);
      return data;
    },
    initialData: () => readCached() ?? BUILT_IN_ROADMAPS,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });
  return { roadmaps: query.data, isAdmin, refetch: query.refetch };
}

export const roadmapName = (r: Pick<Roadmap, 'nameAr' | 'nameEn'>, lang: Lang) =>
  lang === 'ar' ? r.nameAr : r.nameEn;

/** CPE and EE keep their original addresses so old links and notifications still work. */
const LEGACY_PATHS: Record<string, string> = {
  cpe: '/computerEngineer',
  ee: '/electricalEngineer',
};

export const roadmapPath = (slug: string) =>
  LEGACY_PATHS[slug] ?? `/plan/${encodeURIComponent(slug)}`;
