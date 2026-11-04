import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useCourseQueries from '@hooks/ReactQueryHook/courses/useCourseQueries';
import { roadmapName, useRoadmaps } from '@features/map/useRoadmaps';
import {
  emptyPlan,
  readLastPlan,
  saveLastPlan,
  usePlan,
  type PlanKey,
} from '@features/progress/plans';
import {
  MAX_SEMESTER_HOURS,
  eligibleForSemester,
  validatePlan,
  type PlanEntry,
  type PlanIssue,
} from '@features/progress/planner';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';

const MAX_SEMESTERS = 12;
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const Planner = () => {
  const { roadmaps } = useRoadmaps();
  const [planKey, setPlanKey] = useState<PlanKey>(
    () => readLastPlan(roadmaps.map((r) => r.slug)) ?? roadmaps[0]?.slug ?? 'cpe'
  );
  const { plan: loadedPlan, isError: mapError, refetch: reloadMap } =
    usePlan(planKey);
  const plan = useMemo(
    () => loadedPlan ?? emptyPlan(planKey),
    [loadedPlan, planKey]
  );
  const queryClient = useQueryClient();
  const { t, dir, lang } = useI18n();
  const current = roadmaps.find((r) => r.slug === planKey);
  const currentName = current ? roadmapName(current, lang) : planKey;
  const { useCompletedCoursesQuery, useCoursesQuery } = useCourseQueries();
  const { data: completedList = [] } = useCompletedCoursesQuery();
  const { data: courses } = useCoursesQuery();

  const { data: saved, isLoading } = useQuery({
    queryKey: ['planner', planKey],
    queryFn: async () =>
      (
        await axios.get<PlanEntry[]>('/api/planner', {
          params: { plan: planKey },
        })
      ).data,
  });

  const [entries, setEntries] = useState<PlanEntry[]>([]);
  const [semesterCount, setSemesterCount] = useState(4);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const dirty = useRef(false);

  // Load the saved plan whenever the plan tab changes.
  useEffect(() => {
    if (!saved) return;
    dirty.current = false;
    setEntries(saved);
    setSemesterCount(
      Math.min(MAX_SEMESTERS, Math.max(4, ...saved.map((e) => e.semester)))
    );
  }, [saved]);

  // Auto-save shortly after the last change.
  useEffect(() => {
    if (!dirty.current) return;
    setSaveState('saving');
    const timer = setTimeout(async () => {
      try {
        const res = await axios.put<PlanEntry[]>(
          '/api/planner',
          { items: entries },
          { params: { plan: planKey } }
        );
        queryClient.setQueryData(['planner', planKey], res.data);
        dirty.current = false;
        setSaveState('saved');
      } catch (e) {
        setSaveState('error');
        toast.error(AxiosErrorHandler(e));
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [entries, planKey, queryClient]);

  const update = (next: PlanEntry[]) => {
    dirty.current = true;
    setEntries(next);
  };

  const completed = useMemo(
    () => new Set(completedList.filter((id) => plan.graph.courses.has(id))),
    [completedList, plan]
  );
  const hours = useMemo(() => {
    const m = new Map<number, number>();
    (courses ?? []).forEach((c) => c.creditHours && m.set(c.id, c.creditHours));
    return m;
  }, [courses]);
  const issues = useMemo(
    () => validatePlan(plan.graph, entries, completed, hours),
    [plan, entries, completed, hours]
  );
  const name = (id: number) => plan.graph.courses.get(id)?.name ?? `#${id}`;

  const issuesFor = (courseId: number) =>
    issues.filter(
      (i): i is Exclude<PlanIssue, { kind: 'overload' }> =>
        i.kind !== 'overload' && i.courseId === courseId
    );
  const describe = (i: PlanIssue) => {
    switch (i.kind) {
      case 'missingPrereq':
        return t('planner.needsFirst', {
          names: i.missing.map(name).join('، '),
        });
      case 'missingCoreq':
        return t('planner.takeWith', { names: i.missing.map(name).join('، ') });
      case 'alreadyCompleted':
        return t('planner.alreadyDone');
      case 'overload':
        return t('planner.overload', { h: i.hours, max: MAX_SEMESTER_HOURS });
    }
  };

  const plannedTotal = entries.length;
  const remaining = plan.graph.courses.size - completed.size - plannedTotal;

  const switchPlan = (key: PlanKey) => {
    if (key === planKey) return;
    // Save pending edits under the plan they belong to before switching, so the
    // auto-save never writes one plan's courses into the other.
    if (dirty.current) {
      const pending = entries;
      const oldKey = planKey;
      axios
        .put('/api/planner', { items: pending }, { params: { plan: oldKey } })
        .then(() => queryClient.setQueryData(['planner', oldKey], pending))
        .catch((e) => toast.error(AxiosErrorHandler(e)));
    }
    dirty.current = false;
    setEntries([]);
    setPlanKey(key);
    saveLastPlan(key);
    setSaveState('idle');
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t('planner.title')}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {t('planner.subtitle', { n: MAX_SEMESTER_HOURS })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60" aria-live="polite">
            {saveState === 'saving'
              ? t('planner.saving')
              : saveState === 'saved'
                ? t('planner.saved')
                : saveState === 'error'
                  ? t('planner.notSaved')
                  : ''}
          </span>
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
                onClick={() => switchPlan(r.slug)}
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
        </div>
      </header>

      <section
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-label={t('planner.plan')}
      >
        {[
          ['planner.completed', completed.size],
          ['planner.planned', plannedTotal],
          ['planner.unplanned', Math.max(0, remaining)],
          ['planner.warnings', issues.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-neutral-950/70 px-4 py-3"
          >
            <div className="text-xs uppercase tracking-wide text-white/50">
              {t(label as 'planner.completed')}
            </div>
            <div
              className={`text-2xl font-semibold ${label === 'planner.warnings' && Number(value) > 0 ? 'text-amber-300' : 'text-white'}`}
            >
              {value}
            </div>
          </div>
        ))}
      </section>

      {mapError ? (
        <p className="text-white/60">
          {t('map.loadFailed')}{' '}
          <button
            onClick={() => void reloadMap()}
            className="cursor-pointer underline"
          >
            {t('common.tryAgain')}
          </button>
        </p>
      ) : isLoading || !loadedPlan ? (
        <p className="text-white/60">{t('planner.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: semesterCount }, (_, i) => i + 1).map(
            (semester) => {
              const inSemester = entries.filter((e) => e.semester === semester);
              const semesterHours = inSemester.reduce(
                (sum, e) => sum + (hours.get(e.courseId) ?? 0),
                0
              );
              const eligible = eligibleForSemester(
                plan.graph,
                entries,
                completed,
                semester
              ).sort((a, b) => name(a).localeCompare(name(b), 'ar'));
              const over = semesterHours > MAX_SEMESTER_HOURS;
              return (
                <section
                  key={semester}
                  aria-label={t('planner.semester', { n: semester })}
                  className="flex flex-col rounded-2xl border border-white/10 bg-neutral-950/75 p-4"
                >
                  <header className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                      {t('planner.semester', { n: semester })}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${over ? 'bg-amber-500/20 text-amber-200' : 'bg-white/10 text-white/70'}`}
                    >
                      {t('planner.hrs', { n: semesterHours })}
                    </span>
                  </header>

                  <ul className="flex flex-1 flex-col gap-2">
                    {inSemester.length === 0 && (
                      <li className="text-sm text-white/40">
                        {t('planner.empty')}
                      </li>
                    )}
                    {inSemester.map((e) => {
                      const problems = issuesFor(e.courseId);
                      return (
                        <li
                          key={e.courseId}
                          className={`rounded-lg border px-3 py-2 ${problems.length ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-white/5'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span dir="auto" className="text-sm text-white">
                              {name(e.courseId)}
                              <span className="ms-1 text-xs text-white/40">
                                {hours.get(e.courseId) ?? '?'}h
                              </span>
                            </span>
                            <span className="flex shrink-0 gap-0.5">
                              <button
                                type="button"
                                aria-label={t('planner.earlier', {
                                  name: name(e.courseId),
                                })}
                                disabled={semester === 1}
                                onClick={() =>
                                  update(
                                    entries.map((x) =>
                                      x.courseId === e.courseId
                                        ? { ...x, semester: semester - 1 }
                                        : x
                                    )
                                  )
                                }
                                className="h-6 w-6 cursor-pointer rounded text-white/60 hover:bg-white/10 disabled:opacity-30"
                              >
                                {dir === 'rtl' ? '›' : '‹'}
                              </button>
                              <button
                                type="button"
                                aria-label={t('planner.later', {
                                  name: name(e.courseId),
                                })}
                                disabled={semester === semesterCount}
                                onClick={() =>
                                  update(
                                    entries.map((x) =>
                                      x.courseId === e.courseId
                                        ? { ...x, semester: semester + 1 }
                                        : x
                                    )
                                  )
                                }
                                className="h-6 w-6 cursor-pointer rounded text-white/60 hover:bg-white/10 disabled:opacity-30"
                              >
                                {dir === 'rtl' ? '‹' : '›'}
                              </button>
                              <button
                                type="button"
                                aria-label={t('planner.remove', {
                                  name: name(e.courseId),
                                })}
                                onClick={() =>
                                  update(
                                    entries.filter(
                                      (x) => x.courseId !== e.courseId
                                    )
                                  )
                                }
                                className="h-6 w-6 cursor-pointer rounded text-white/60 hover:bg-red-500/20 hover:text-red-300"
                              >
                                ✕
                              </button>
                            </span>
                          </div>
                          {problems.map((p) => (
                            <p
                              key={p.kind}
                              dir="auto"
                              className="mt-1 text-xs text-amber-200"
                            >
                              {describe(p)}
                            </p>
                          ))}
                        </li>
                      );
                    })}
                  </ul>

                  <label className="mt-3 block text-xs text-white/50">
                    <span className="sr-only">
                      {t('planner.addTo', { n: semester })}
                    </span>
                    <select
                      value=""
                      onChange={(ev) => {
                        const id = Number(ev.target.value);
                        if (id)
                          update([...entries, { courseId: id, semester }]);
                      }}
                      className="w-full cursor-pointer rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
                    >
                      <option value="">
                        {t('planner.addOption', { n: eligible.length })}
                      </option>
                      {eligible.map((id) => (
                        <option key={id} value={id}>
                          {name(id)}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>
              );
            }
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={semesterCount >= MAX_SEMESTERS}
          onClick={() => setSemesterCount(semesterCount + 1)}
          className="cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-40"
        >
          {t('planner.addSemester')}
        </button>
        <Link
          to={plan.path}
          className="rounded-lg px-4 py-2 text-sm text-blue-400 hover:underline"
        >
          {t('planner.openMap', { plan: currentName })}
        </Link>
      </div>
      <p className="mt-4 text-xs text-white/40">{t('planner.footnote')}</p>
    </main>
  );
};

export default Planner;
