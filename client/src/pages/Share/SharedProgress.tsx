import axios from 'axios';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PLANS, type PlanKey } from '@features/progress/plans';
import ReadOnlyPlanMap from '@features/progress/ReadOnlyPlanMap';
import { LottieHandler, PageLoader } from '@components/feedbaks';
import { useI18n } from '@i18n/context';

type Shared = { username: string; completedCourseIds: number[] };

/** Public, read-only view of a student's completed courses (/progress/:token). */
const SharedProgress = () => {
  const { token = '' } = useParams();
  const { t } = useI18n();
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
  // Open the plan where they've completed the most courses.
  const best = useMemo<PlanKey>(() => {
    const count = (k: PlanKey) =>
      [...completedAll].filter((id) => PLANS[k].graph.courses.has(id)).length;
    return count('ee') > count('cpe') ? 'ee' : 'cpe';
  }, [completedAll]);
  const [chosen, setChosen] = useState<PlanKey | null>(null);
  const planKey = chosen ?? best;
  const plan = PLANS[planKey];

  if (isLoading) return <PageLoader message={t('loader.shared')} />;
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
              plan: t(`plan.${planKey}`),
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
          className="inline-flex rounded-lg border border-white/10 bg-neutral-950/70 p-1"
        >
          {(Object.keys(PLANS) as PlanKey[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === planKey}
              onClick={() => setChosen(k)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm ${
                k === planKey
                  ? 'bg-white/15 font-semibold text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {t(`plan.${k}`)}
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
