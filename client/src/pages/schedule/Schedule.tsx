import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useCourseQueries from '@hooks/ReactQueryHook/courses/useCourseQueries';
import { useRoadmaps } from '@features/map/useRoadmaps';
import { readLastPlan } from '@features/progress/plans';
import {
  MAX_ENTRIES,
  findClashes,
  formatTime,
  hourRange,
  layoutDay,
  parseTime,
  toIcs,
  visibleDays,
  weeklyMinutes,
  type TimetableEntry,
} from '@features/study/timetable';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';

/** Block colours; the index is what the server stores. */
const COLORS = [
  'bg-sky-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-fuchsia-600',
];
const HOUR_PX = 52;
const ALL_DAYS = [6, 0, 1, 2, 3, 4, 5];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type Draft = {
  title: string;
  days: number[];
  start: string;
  end: string;
  location: string;
  color: number;
};
const EMPTY_DRAFT: Draft = {
  title: '',
  days: [],
  start: '08:00',
  end: '09:30',
  location: '',
  color: 0,
};

const card = 'rounded-2xl border border-white/10 bg-neutral-950/75 p-4 sm:p-5';
const input =
  'w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-white/40';

const Schedule = () => {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const { useCoursesQuery } = useCourseQueries();
  const { data: courses = [] } = useCoursesQuery();
  const { roadmaps } = useRoadmaps();

  // Sunday is 7 Jan 2024, so day d is 7 + d.
  const dayName = (d: number, style: 'long' | 'short' = 'long') =>
    new Date(2024, 0, 7 + d).toLocaleDateString(locale, { weekday: style });

  const courseName = (c: { label?: string; name: string }) =>
    (c.label || c.name).trim();

  const { data: saved, isLoading } = useQuery({
    queryKey: ['timetable'],
    queryFn: async () =>
      (await axios.get<TimetableEntry[]>('/api/timetable')).data,
  });

  // Next semester's courses from the planner, as quick picks.
  const planKey =
    readLastPlan(roadmaps.map((r) => r.slug)) ?? roadmaps[0]?.slug;
  const { data: planned = [] } = useQuery({
    queryKey: ['planner', planKey],
    queryFn: async () =>
      (
        await axios.get<{ courseId: number; semester: number }[]>(
          '/api/planner',
          { params: { plan: planKey } }
        )
      ).data,
    enabled: !!planKey,
  });
  const quickPicks = useMemo(() => {
    const byId = new Map(courses.map((c) => [c.id, c]));
    return planned
      .filter((p) => p.semester === 1)
      .map((p) => byId.get(p.courseId))
      .filter((c): c is NonNullable<typeof c> => !!c);
  }, [planned, courses]);

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editing, setEditing] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const dirty = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!saved) return;
    dirty.current = false;
    setEntries(saved);
  }, [saved]);

  // Auto-save shortly after the last change, like the semester planner.
  useEffect(() => {
    if (!dirty.current) return;
    setSaveState('saving');
    const timer = setTimeout(async () => {
      try {
        const res = await axios.put<TimetableEntry[]>('/api/timetable', {
          items: entries,
        });
        dirty.current = false;
        queryClient.setQueryData(['timetable'], res.data);
        setSaveState('saved');
      } catch (e) {
        setSaveState('error');
        toast.error(AxiosErrorHandler(e));
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [entries, queryClient]);

  const update = (next: TimetableEntry[]) => {
    dirty.current = true;
    setEntries(next);
  };

  const clashes = useMemo(() => findClashes(entries), [entries]);
  const clashing = useMemo(() => new Set(clashes.flat()), [clashes]);
  const days = visibleDays(entries);
  const [fromHour, toHour] = hourRange(entries);
  const hours = Array.from(
    { length: toHour - fromHour },
    (_, i) => fromHour + i
  );

  const resetForm = () => {
    setDraft({ ...EMPTY_DRAFT, color: draft.color });
    setEditing(null);
    setFormError('');
  };

  const submit = () => {
    const title = draft.title.trim();
    const start = parseTime(draft.start);
    const end = parseTime(draft.end);
    if (!title) return setFormError(t('tt.needTitle'));
    if (draft.days.length === 0) return setFormError(t('tt.pickDay'));
    if (start === null || end === null || end <= start)
      return setFormError(t('tt.badTime'));
    const kept =
      editing === null ? entries : entries.filter((_, i) => i !== editing);
    if (kept.length + draft.days.length > MAX_ENTRIES)
      return setFormError(t('tt.full', { n: MAX_ENTRIES }));
    const match = courses.find((c) => courseName(c) === title);
    const added = draft.days.map<TimetableEntry>((day) => ({
      courseId: match?.id ?? null,
      title,
      day,
      start,
      end,
      location: draft.location.trim() || null,
      color: draft.color,
    }));
    update([...kept, ...added]);
    resetForm();
  };

  const edit = (index: number) => {
    const e = entries[index];
    setEditing(index);
    setFormError('');
    setDraft({
      title: e.title,
      days: [e.day],
      start: formatTime(e.start),
      end: formatTime(e.end),
      location: e.location ?? '',
      color: e.color,
    });
    titleRef.current?.focus();
    titleRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const remove = (index: number) => {
    update(entries.filter((_, i) => i !== index));
    if (editing === index) resetForm();
  };

  const exportIcs = () => {
    const blob = new Blob([toIcs(entries, new Date())], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const totalHours = Math.round((weeklyMinutes(entries) / 60) * 10) / 10;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white print:text-black">
            {t('tt.title')}
          </h1>
          <p className="mt-1 text-sm text-white/70 print:hidden">
            {t('tt.subtitle')}
          </p>
        </div>
        <span className="text-xs text-white/60 print:hidden" aria-live="polite">
          {saveState === 'saving'
            ? t('planner.saving')
            : saveState === 'saved'
              ? t('planner.saved')
              : saveState === 'error'
                ? t('planner.notSaved')
                : ''}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        {/* ---- Add / edit form ---- */}
        <section
          className={`${card} h-fit print:hidden`}
          aria-labelledby="tt-form-h"
        >
          <h2 id="tt-form-h" className="mb-3 font-semibold text-white">
            {editing === null ? t('tt.addTitle') : t('tt.editTitle')}
          </h2>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="block text-xs text-white/60">
              {t('tt.course')}
              <input
                ref={titleRef}
                className={`${input} mt-1`}
                list="tt-courses"
                maxLength={100}
                dir="auto"
                placeholder={t('tt.coursePh')}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <datalist id="tt-courses">
                {courses.map((c) => (
                  <option key={c.id} value={courseName(c)} />
                ))}
              </datalist>
            </label>

            {quickPicks.length > 0 ? (
              <div className="text-xs text-white/60">
                <span>{t('tt.fromPlan')}</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {quickPicks.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      dir="auto"
                      onClick={() =>
                        setDraft({ ...draft, title: courseName(c) })
                      }
                      className="cursor-pointer rounded-full border border-white/15 px-2.5 py-0.5 text-white/80 hover:bg-white/10"
                    >
                      {courseName(c)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">
                {t('tt.noPlan')}{' '}
                <Link to="/planner" className="text-blue-400 hover:underline">
                  {t('header.planner')}
                </Link>
              </p>
            )}

            <fieldset>
              <legend className="text-xs text-white/60">{t('tt.days')}</legend>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {ALL_DAYS.map((d) => {
                  const on = draft.days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          days: on
                            ? draft.days.filter((x) => x !== d)
                            : [...draft.days, d],
                        })
                      }
                      className={`cursor-pointer rounded-md px-2.5 py-1 text-xs ${
                        on
                          ? 'bg-blue-600 text-white'
                          : 'border border-white/15 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {dayName(d, 'short')}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs text-white/60">
                {t('tt.start')}
                <input
                  type="time"
                  step={300}
                  className={`${input} mt-1`}
                  value={draft.start}
                  onChange={(e) =>
                    setDraft({ ...draft, start: e.target.value })
                  }
                />
              </label>
              <label className="block text-xs text-white/60">
                {t('tt.end')}
                <input
                  type="time"
                  step={300}
                  className={`${input} mt-1`}
                  value={draft.end}
                  onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                />
              </label>
            </div>

            <label className="block text-xs text-white/60">
              {t('tt.room')}{' '}
              <span className="text-white/40">({t('common.optional')})</span>
              <input
                className={`${input} mt-1`}
                maxLength={60}
                dir="auto"
                placeholder={t('tt.roomPh')}
                value={draft.location}
                onChange={(e) =>
                  setDraft({ ...draft, location: e.target.value })
                }
              />
            </label>

            <fieldset>
              <legend className="text-xs text-white/60">{t('tt.color')}</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {COLORS.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={draft.color === i}
                    aria-label={t('tt.colorN', { n: i + 1 })}
                    onClick={() => setDraft({ ...draft, color: i })}
                    className={`h-6 w-6 cursor-pointer rounded-full ${c} ${
                      draft.color === i
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-950'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </fieldset>

            {formError && (
              <p role="alert" className="text-xs text-red-300">
                {formError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {editing === null ? t('tt.add') : t('tt.update')}
              </button>
              {editing !== null && (
                <>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80"
                  >
                    {t('common.cancel')}
                  </button>
                  {/* Phones have no hover, so the block's ✕ is hard to reach there. */}
                  <button
                    type="button"
                    onClick={() => remove(editing)}
                    className="cursor-pointer rounded-lg border border-red-800 px-3 py-2 text-sm text-red-300 hover:bg-red-900/30"
                  >
                    {t('common.delete')}
                  </button>
                </>
              )}
            </div>
          </form>
        </section>

        {/* ---- Week grid ---- */}
        <section className="min-w-0" aria-label={t('tt.grid')}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <span className="text-sm text-white/70">
              {t('tt.summary', { n: entries.length, h: totalHours })}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={entries.length === 0}
                onClick={exportIcs}
                title={t('tt.exportHint')}
                className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-40"
              >
                {t('tt.export')}
              </button>
              <button
                type="button"
                disabled={entries.length === 0}
                onClick={() => window.print()}
                className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-40"
              >
                {t('tt.print')}
              </button>
              <button
                type="button"
                disabled={entries.length === 0}
                onClick={() => {
                  if (window.confirm(t('tt.confirmClear'))) {
                    update([]);
                    resetForm();
                  }
                }}
                className="cursor-pointer rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/30 disabled:opacity-40"
              >
                {t('tt.clearAll')}
              </button>
            </div>
          </div>

          {clashes.length > 0 && (
            <div
              role="status"
              className="mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 print:hidden"
            >
              <p className="font-semibold">{t('tt.clashTitle')}</p>
              <ul className="mt-1 list-disc ps-5">
                {clashes.map(([a, b]) => (
                  <li key={`${a}-${b}`} dir="auto">
                    {t('tt.clash', {
                      a: entries[a].title,
                      b: entries[b].title,
                      day: dayName(entries[a].day),
                    })}{' '}
                    ({formatTime(Math.max(entries[a].start, entries[b].start))})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isLoading ? (
            <p className="text-white/60">{t('tt.loading')}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950/75 print:border-black print:bg-white">
              <div
                className="grid min-w-[40rem]"
                style={{
                  gridTemplateColumns: `3.25rem repeat(${days.length}, minmax(6.5rem, 1fr))`,
                }}
              >
                {/* Header row */}
                <div className="border-b border-white/10" />
                {days.map((d) => (
                  <div
                    key={d}
                    className="border-b border-s border-white/10 px-2 py-2 text-center text-sm font-semibold text-white print:text-black"
                  >
                    {dayName(d)}
                  </div>
                ))}

                {/* Hour labels */}
                <div
                  className="relative"
                  style={{ height: hours.length * HOUR_PX }}
                >
                  {hours.map((h, i) => (
                    <span
                      key={h}
                      className="absolute end-1.5 -translate-y-1/2 text-[11px] tabular-nums text-white/40 print:text-black"
                      style={{ top: i * HOUR_PX }}
                    >
                      {i === 0 ? '' : formatTime(h * 60)}
                    </span>
                  ))}
                </div>

                {/* Day columns */}
                {days.map((d) => (
                  <div
                    key={d}
                    className="relative border-s border-white/10"
                    style={{ height: hours.length * HOUR_PX }}
                  >
                    {hours.map((h, i) => (
                      <div
                        key={h}
                        aria-hidden="true"
                        className="absolute inset-x-0 border-t border-white/5"
                        style={{ top: i * HOUR_PX }}
                      />
                    ))}
                    {layoutDay(entries, d).map(({ index, lane, lanes }) => {
                      const e = entries[index];
                      const top = ((e.start - fromHour * 60) / 60) * HOUR_PX;
                      const height = Math.max(
                        22,
                        ((e.end - e.start) / 60) * HOUR_PX - 2
                      );
                      return (
                        <div
                          key={index}
                          className={`group absolute overflow-hidden rounded-md px-1.5 py-1 text-white shadow ${COLORS[e.color % COLORS.length]} ${
                            clashing.has(index) ? 'ring-2 ring-amber-300' : ''
                          } ${editing === index ? 'outline-2 outline-white' : ''}`}
                          style={{
                            top,
                            height,
                            insetInlineStart: `calc(${(lane / lanes) * 100}% + 2px)`,
                            width: `calc(${100 / lanes}% - 4px)`,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => edit(index)}
                            aria-label={t('tt.editClass', { name: e.title })}
                            className="block h-full w-full cursor-pointer text-start"
                          >
                            <span
                              dir="auto"
                              className="block truncate text-xs font-semibold"
                            >
                              {e.title}
                            </span>
                            <span className="block text-[11px] tabular-nums opacity-90">
                              {formatTime(e.start)}–{formatTime(e.end)}
                            </span>
                            {e.location && (
                              <span
                                dir="auto"
                                className="block truncate text-[11px] opacity-90"
                              >
                                {e.location}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            aria-label={t('tt.removeClass', { name: e.title })}
                            className="absolute end-0.5 top-0.5 hidden h-5 w-5 cursor-pointer items-center justify-center rounded bg-black/30 text-[11px] group-hover:flex group-focus-within:flex print:hidden"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isLoading && entries.length === 0 && (
            <p className="mt-3 text-sm text-white/50">{t('tt.empty')}</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default Schedule;
