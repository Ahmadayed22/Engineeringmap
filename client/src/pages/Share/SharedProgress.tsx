import axios from 'axios';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  emptyPlan,
  usePlanMaps,
  type PlanKey,
} from '@features/progress/plans';
import { roadmapName, useRoadmaps } from '@features/map/useRoadmaps';
import ReadOnlyPlanMap from '@features/progress/ReadOnlyPlanMap';
import { LottieHandler, PageLoader } from '@components/feedbaks';
import { useI18n } from '@i18n/context';

type Shared = { username: string; completedCourseIds: number[] };

/** Public, read-only view of a student's completed courses (/progress/:token). */
const SharedProgress = () => {
  const { token = '' } = useParams();
  const { t, lang } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared', token],
    queryFn: async () =>
      (await axios.get<Shared>(`/api/share/${encodeURIComponent(token)}`)).data,
    retry: false,
  });

  const completedAll = useMemo(
    () => new Set(data?.completedCourseIds ?? []),
    [data]
  );
  // Public page: only roadmaps everyone can see, even when an admin opens it.
  const { roadmaps: all } = useRoadmaps();
  const roadmaps = useMemo(() => all.filter((r) => r.visible), [all]);
  const keys = useMemo(() => roadmaps.map((r) => r.slug), [roadmaps]);
  const {
    plans,
    isLoading: mapsLoading,
    isError: mapsError,
  } = usePlanMaps(keys);
  // Open the roadmap where they've completed the most courses.
  const best = useMemo<PlanKey>(() => {
    if (!plans || keys.length === 0) return keys[0] ?? 'cpe';
    const count = (k: PlanKey) =>
      [...completedAll].filter((id) => plans[k].graph.courses.has(id)).length;
    return keys.reduce((a, b) => (count(b) > count(a) ? b : a));
  }, [completedAll, plans, keys]);
  const [chosen, setChosen] = useState<PlanKey | null>(null);
  const planKey = chosen ?? best;
  const plan = plans?.[planKey] ?? emptyPlan(planKey);

  if (isLoading || (mapsLoading && !plans))
    return <PageLoader message={t('loader.shared')} />;
  if (!plans && mapsError) {
    return (
      <p className="py-16 text-center text-white/70">{t('map.loadFailed')}</p>
    );
  }
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center pb-16">
        <LottieHandler type="notFound" message={t('shared.inactive')} />
        <p className="mt-2 text-sm text-white/70">{t('shared.inactiveBody')}</p>
        <Link
          to="/"
          className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900"
        >
          {t('shared.explore')}
        </Link>
      </div>
    );
  }

  const done = [...completedAll].filter((id) =>
    plan.graph.courses.has(id)
  ).length;
  const total = plan.graph.courses.size;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('shared.heading', { name: data.username })}
          </h1>
          <p className="text-sm text-white/70">
            {t('shared.summary', {
              done,
              total,
              plan: (() => {
                const r = roadmaps.find((x) => x.slug === planKey);
                return r ? roadmapName(r, lang) : planKey;
              })(),
              p: percent,
            })}
          </p>
          <div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div
          role="tablist"
          aria-label={t('planner.plan')}
          className="inline-flex flex-wrap rounded-lg border border-white/10 bg-neutral-950/70 p-1"
        >
          {roadmaps.map((r) => (
            <button
              key={r.slug}
              role="tab"
              aria-selected={r.slug === planKey}
              onClick={() => setChosen(r.slug)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm ${
                r.slug === planKey
                  ? 'bg-white/15 font-semibold text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {roadmapName(r, lang)}
            </button>
          ))}
        </div>
      </header>
      <ReadOnlyPlanMap plan={plan} completed={completedAll} />
      <p className="mt-3 text-center text-xs text-white/50">
        {t('shared.legend')}{' '}
        <Link to="/signup" className="text-blue-400 hover:underline">
          {t('shared.ownPlan')}
        </Link>
      </p>
    </main>
  );
};

export default SharedProgress;
