import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useCourseQueries from '@hooks/ReactQueryHook/courses/useCourseQueries';
import {
  EXAM_KINDS,
  splitExams,
  timeLeft,
  toLocalInput,
  type ExamDate,
  type ExamKind,
} from '@features/study/exams';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';

type Draft = { title: string; kind: ExamKind; when: string; location: string };

const card = 'rounded-2xl border border-white/10 bg-neutral-950/75 p-4 sm:p-5';
const input =
  'w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-white/40';

/** Tomorrow at 9:00, a sensible default for a new exam. */
const defaultWhen = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return toLocalInput(d);
};

const MyExams = () => {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const { useCoursesQuery } = useCourseQueries();
  const { data: courses = [] } = useCoursesQuery();
  const [now, setNow] = useState(() => new Date());
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showPast, setShowPast] = useState(false);
  const empty = (): Draft => ({
    title: '',
    kind: 'FINAL',
    when: defaultWhen(),
    location: '',
  });
  const [draft, setDraft] = useState<Draft>(empty);

  // Tick every 30 seconds so the countdowns stay current.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { data = [], isLoading } = useQuery({
    queryKey: ['examDates'],
    queryFn: async () => (await axios.get<ExamDate[]>('/api/exam-dates')).data,
  });
  const { upcoming, past } = useMemo(() => splitExams(data, now), [data, now]);

  const courseName = (c: { label?: string; name: string }) =>
    (c.label || c.name).trim();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['examDates'] });

  const save = useMutation({
    mutationFn: async () => {
      const title = draft.title.trim();
      const match = courses.find((c) => courseName(c) === title);
      const body = {
        courseId: match?.id ?? null,
        title,
        kind: draft.kind,
        startsAt: new Date(draft.when).toISOString(),
        location: draft.location.trim() || null,
      };
      return editing === null
        ? axios.post('/api/exam-dates', body)
        : axios.put(`/api/exam-dates/${editing}`, body);
    },
    onSuccess: () => {
      refresh();
      toast.success(editing === null ? t('ex.added') : t('ex.saved'));
      setEditing(null);
      setDraft(empty());
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/exam-dates/${id}`),
    onSuccess: () => {
      refresh();
      toast.success(t('ex.deleted'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const submit = () => {
    setError('');
    if (!draft.title.trim()) return setError(t('ex.needTitle'));
    const when = new Date(draft.when);
    if (Number.isNaN(when.getTime()) || when <= new Date())
      return setError(t('ex.inPast'));
    save.mutate();
  };

  const startEdit = (e: ExamDate) => {
    setEditing(e.id);
    setError('');
    setDraft({
      title: e.title,
      kind: e.kind,
      when: toLocalInput(new Date(e.startsAt)),
      location: e.location ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const left = (e: ExamDate) => {
    const l = timeLeft(e.startsAt, now);
    return l.days > 0
      ? t('ex.leftDays', { d: l.days, h: l.hours })
      : t('ex.leftHours', { h: l.hours, m: l.minutes });
  };
  const when = (e: ExamDate) =>
    new Date(e.startsAt).toLocaleString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
    });

  const actions = (e: ExamDate) => (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {e.courseId && (
        <Link
          to={`/course/${e.courseId}`}
          className="text-blue-400 hover:underline"
        >
          {t('ex.openCourse')}
        </Link>
      )}
      <button
        type="button"
        onClick={() => startEdit(e)}
        aria-label={t('ex.edit', { name: e.title })}
        className="cursor-pointer text-white/70 hover:text-white hover:underline"
      >
        {t('common.edit')}
      </button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t('ex.confirmDelete', { name: e.title })))
            remove.mutate(e.id);
        }}
        aria-label={t('ex.remove', { name: e.title })}
        className="cursor-pointer text-red-400 hover:underline"
      >
        {t('common.delete')}
      </button>
    </div>
  );

  const [next, ...rest] = upcoming;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">{t('ex.title')}</h1>
        <p className="mt-1 text-sm text-white/70">{t('ex.subtitle')}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-[20rem_1fr]">
        <section className={`${card} h-fit`} aria-labelledby="ex-form-h">
          <h2 id="ex-form-h" className="mb-3 font-semibold text-white">
            {editing === null ? t('ex.addTitle') : t('ex.editTitle')}
          </h2>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="block text-xs text-white/60">
              {t('ex.course')}
              <input
                className={`${input} mt-1`}
                list="ex-courses"
                maxLength={100}
                dir="auto"
                placeholder={t('tt.coursePh')}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <datalist id="ex-courses">
                {courses.map((c) => (
                  <option key={c.id} value={courseName(c)} />
                ))}
              </datalist>
            </label>
            <label className="block text-xs text-white/60">
              {t('ex.kind')}
              <select
                className={`${input} mt-1`}
                value={draft.kind}
                onChange={(e) =>
                  setDraft({ ...draft, kind: e.target.value as ExamKind })
                }
              >
                {EXAM_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`exam.kind.${k}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-white/60">
              {t('ex.when')}
              <input
                type="datetime-local"
                className={`${input} mt-1`}
                value={draft.when}
                onChange={(e) => setDraft({ ...draft, when: e.target.value })}
              />
            </label>
            <label className="block text-xs text-white/60">
              {t('ex.where')}{' '}
              <span className="text-white/40">({t('common.optional')})</span>
              <input
                className={`${input} mt-1`}
                maxLength={60}
                dir="auto"
                placeholder={t('ex.wherePh')}
                value={draft.location}
                onChange={(e) =>
                  setDraft({ ...draft, location: e.target.value })
                }
              />
            </label>
            {error && (
              <p role="alert" className="text-xs text-red-300">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={save.isPending}
                className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {editing === null ? t('ex.add') : t('common.save')}
              </button>
              {editing !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setError('');
                    setDraft(empty());
                  }}
                  className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80"
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          className="flex min-w-0 flex-col gap-4"
          aria-label={t('ex.upcoming')}
        >
          {isLoading ? (
            <p className="text-white/60">{t('ex.loading')}</p>
          ) : upcoming.length === 0 ? (
            <p className={`${card} text-sm text-white/60`}>{t('ex.empty')}</p>
          ) : (
            <>
              <article
                className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-600/25 to-neutral-950/80 p-5"
                aria-labelledby="ex-next-h"
              >
                <p className="text-xs uppercase tracking-wide text-blue-200/80">
                  {t('ex.next')}
                </p>
                <h2
                  id="ex-next-h"
                  className="mt-1 text-2xl font-bold text-white"
                  dir="auto"
                >
                  {next.title}
                </h2>
                <p className="text-sm text-white/70">
                  {t(`exam.kind.${next.kind}`)} · {when(next)}
                  {next.location ? ` · ${next.location}` : ''}
                </p>
                <p
                  className="mt-3 text-3xl font-semibold tabular-nums text-white"
                  aria-live="polite"
                >
                  {left(next)}
                </p>
                <div className="mt-3">{actions(next)}</div>
              </article>

              {rest.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {rest.map((e) => (
                    <li key={e.id} className={`${card} !p-4`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-white" dir="auto">
                            {e.title}
                          </p>
                          <p className="text-xs text-white/60">
                            {t(`exam.kind.${e.kind}`)} · {when(e)}
                            {e.location ? ` · ${e.location}` : ''}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums text-white">
                          {left(e)}
                        </span>
                      </div>
                      <div className="mt-2">{actions(e)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {past.length > 0 && (
            <div>
              <button
                type="button"
                aria-expanded={showPast}
                onClick={() => setShowPast(!showPast)}
                className="cursor-pointer text-sm text-white/60 hover:text-white"
              >
                {showPast ? '▾' : '▸'} {t('ex.past', { n: past.length })}
              </button>
              {showPast && (
                <ul className="mt-2 flex flex-col gap-2">
                  {past.map((e) => (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-neutral-950/50 px-4 py-2 text-sm text-white/60"
                    >
                      <span dir="auto">
                        {e.title} · {when(e)}
                      </span>
                      {actions(e)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MyExams;
