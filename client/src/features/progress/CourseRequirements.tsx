import { useProgressContext } from './ProgressContext';
import { useI18n } from '@i18n/context';

type Props = { courseId: number | unknown | null };

const statusCopy = {
  completed: { key: 'req.completed', cls: 'bg-white/10 text-white/80' },
  available: {
    key: 'req.available',
    cls: 'bg-green-500/15 text-green-300',
  },
  locked: {
    key: 'req.locked',
    cls: 'bg-amber-500/15 text-amber-300',
  },
} as const;

/** Prerequisites of the course open in the drawer, each marked done or missing. */
const CourseRequirements = ({ courseId }: Props) => {
  const ctx = useProgressContext();
  const { t } = useI18n();
  const id = Number(courseId);
  const course = ctx?.progress.graph.courses.get(id);
  if (!ctx || !course) return null;

  const { progress, isSignedIn } = ctx;
  const state = progress.states.get(id);
  const done = (c: number) => progress.states.get(c)?.status === 'completed';
  const name = (c: number) => progress.graph.courses.get(c)?.name ?? `#${c}`;
  const prereqs = [...course.prerequisites];
  const coreqs = [...course.corequisites];
  const hours = progress.creditHours.get(id);

  return (
    <section
      aria-label={t('req.section')}
      className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {isSignedIn && state && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCopy[state.status].cls}`}
          >
            {t(statusCopy[state.status].key)}
          </span>
        )}
        {hours && (
          <span className="text-xs text-white/60">
            {t('req.hours', { n: hours })}
          </span>
        )}
        {progress.marks[id] && (
          <span className="text-xs text-white/60">
            {t('req.grade', { g: progress.marks[id] })}
          </span>
        )}
      </div>

      {prereqs.length === 0 && coreqs.length === 0 ? (
        <p className="text-sm text-white/70">{t('req.none')}</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {prereqs.map((c) => (
            <li key={`p${c}`} className="flex items-center gap-2" dir="auto">
              <span
                aria-hidden="true"
                className={
                  isSignedIn && done(c) ? 'text-green-400' : 'text-white/40'
                }
              >
                {isSignedIn && done(c) ? '✓' : '○'}
              </span>
              <span
                className={
                  isSignedIn && !done(c) ? 'text-white' : 'text-white/70'
                }
              >
                {name(c)}
              </span>
              {isSignedIn && (
                <span className="sr-only">
                  {done(c) ? t('req.done') : t('req.notDone')}
                </span>
              )}
            </li>
          ))}
          {coreqs.map((c) => (
            <li key={`c${c}`} className="flex items-center gap-2" dir="auto">
              <span aria-hidden="true" className="text-white/40">
                ⟷
              </span>
              <span className="text-white/70">
                {name(c)}{' '}
                <span className="text-xs text-white/50">
                  {t('req.together')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CourseRequirements;
