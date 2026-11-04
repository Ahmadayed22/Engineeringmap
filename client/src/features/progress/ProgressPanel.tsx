import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel } from '@xyflow/react';
import { useOpenCourse } from './useOpenCourse';
import { useProgressContext } from './ProgressContext';
import { useI18n } from '@i18n/context';

const COLLAPSE_KEY = 'engmap.progressCollapsed';
const MAX_CHIPS = 8;

const readCollapsed = () => {
  try {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved !== null) return saved === '1';
  } catch {
    // storage unavailable; fall through to the default
  }
  // Start collapsed on phones so the map stays visible.
  return typeof window !== 'undefined' && window.innerWidth < 640;
};

const Stat = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-lg bg-white/5 px-3 py-2">
    <dt className="text-[11px] uppercase tracking-wide text-white/50">
      {label}
    </dt>
    <dd className="text-lg font-semibold text-white">{value}</dd>
    {hint && <dd className="text-[11px] text-white/50">{hint}</dd>}
  </div>
);

/**
 * Floating summary on the study-plan map: progress, GPA from saved grades, and the
 * courses the student can register for now (click one to jump to it).
 */
const ProgressPanel = () => {
  const ctx = useProgressContext();
  const openCourse = useOpenCourse();
  const { t, dir } = useI18n();
  const side = dir === 'rtl' ? 'bottom-right' : 'bottom-left';
  const [collapsed, setCollapsedState] = useState(readCollapsed);
  const [showAll, setShowAll] = useState(false);

  if (!ctx) return null;
  const { progress, isSignedIn, highlight, setHighlight } = ctx;

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0');
    } catch {
      // ignore: preference just won't persist
    }
  };

  const container =
    'pointer-events-auto w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-neutral-950/85 text-white shadow-2xl backdrop-blur-md';

  if (collapsed) {
    return (
      <Panel position={side}>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/85 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-white"
          aria-expanded="false"
        >
          <span aria-hidden="true">📊</span>
          {isSignedIn
            ? t('progress.pill', {
                done: progress.completedCount,
                total: progress.totalCourses,
                n: progress.available.length,
              })
            : t('progress.title')}
        </button>
      </Panel>
    );
  }

  if (!isSignedIn) {
    return (
      <Panel position={side}>
        <section
          className={`${container} p-4`}
          aria-label={t('progress.title')}
          dir={dir}
        >
          <header className="mb-2 flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold">{t('progress.track')}</h2>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="cursor-pointer rounded p-1 text-white/60 hover:text-white"
              aria-label={t('progress.collapse')}
            >
              ✕
            </button>
          </header>
          <p className="mb-3 text-sm text-white/70">
            {t('progress.trackBody')}
          </p>
          <Link
            to="/login"
            className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-white/90"
          >
            {t('common.signIn')}
          </Link>
        </section>
      </Panel>
    );
  }

  const percent = progress.totalCourses
    ? Math.round((progress.completedCount / progress.totalCourses) * 100)
    : 0;
  const chips = showAll
    ? progress.available
    : progress.available.slice(0, MAX_CHIPS);
  const hoursKnown = progress.totalHours > 0;

  return (
    <Panel position={side}>
      <section
        className={`${container} max-h-[70vh] overflow-y-auto p-4`}
        aria-label={t('progress.title')}
        dir={dir}
      >
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{t('progress.title')}</h2>
            <p className="text-xs text-white/60">
              {t('progress.percent', { n: percent })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="cursor-pointer rounded p-1 text-white/60 hover:text-white"
            aria-label={t('progress.collapse')}
          >
            ✕
          </button>
        </header>

        <div
          className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('progress.bar')}
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <dl className="mb-4 grid grid-cols-3 gap-2">
          <Stat
            label={t('progress.courses')}
            value={`${progress.completedCount}/${progress.totalCourses}`}
          />
          <Stat
            label={t('progress.hours')}
            value={hoursKnown ? `${progress.completedHours}` : '—'}
            hint={
              hoursKnown
                ? progress.completedWithoutHours
                  ? t('progress.ofUnknown', {
                      n: progress.totalHours,
                      m: progress.completedWithoutHours,
                    })
                  : t('progress.of', { n: progress.totalHours })
                : undefined
            }
          />
          <Stat
            label={t('progress.gpa')}
            value={
              progress.gpa.gpa !== null ? progress.gpa.gpa.toFixed(2) : '—'
            }
            hint={
              progress.gpa.gpa !== null
                ? t('progress.graded', { n: progress.gpa.gradedHours })
                : 'add grades'
            }
          />
        </dl>

        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            {t('progress.canTake')}{' '}
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
              {progress.available.length}
            </span>
          </h3>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 cursor-pointer accent-green-500"
              checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)}
            />
            {t('progress.highlight')}
          </label>
        </div>

        {progress.available.length === 0 ? (
          <p className="text-sm text-white/60">
            {progress.completedCount === progress.totalCourses
              ? t('progress.allDone')
              : t('progress.noneUnlocked')}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {chips.map((id) => {
              const course = progress.graph.courses.get(id)!;
              const takeWith = progress.states.get(id)?.takeWith ?? [];
              const withNames = takeWith
                .map((c) => progress.graph.courses.get(c)?.name)
                .filter(Boolean)
                .join('، ');
              return (
                <li key={id}>
                  <button
                    type="button"
                    dir="auto"
                    onClick={() => openCourse(id)}
                    title={
                      withNames
                        ? t('progress.takeWith', { names: withNames })
                        : t('progress.showOnMap')
                    }
                    className="cursor-pointer rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs text-green-100 transition hover:bg-green-500/25 focus-visible:outline-2 focus-visible:outline-green-400"
                  >
                    {course.name}
                    {withNames && <span aria-hidden="true"> ⟷</span>}
                  </button>
                </li>
              );
            })}
            {progress.available.length > MAX_CHIPS && (
              <li>
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="cursor-pointer rounded-full px-3 py-1 text-xs text-white/70 underline-offset-2 hover:underline"
                >
                  {showAll
                    ? t('progress.showLess')
                    : t('progress.more', {
                        n: progress.available.length - MAX_CHIPS,
                      })}
                </button>
              </li>
            )}
          </ul>
        )}

        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/50">
          <span>
            <span className="me-1 inline-block h-2 w-2 rounded-full bg-green-500 align-middle" />
            {t('progress.legendCan')}
          </span>
          <span>{t('progress.legendDim')}</span>
          <span>{t('progress.legendCo')}</span>
        </p>
        <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
          <Link
            to="/planner"
            className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-white/15"
          >
            {t('progress.plan')}
          </Link>
          <Link
            to="/share"
            className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-white/15"
          >
            {t('progress.share')}
          </Link>
        </div>
      </section>
    </Panel>
  );
};

export default ProgressPanel;
