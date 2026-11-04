import { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { GRADE_POINTS, GRADES, computeGpa } from '@features/progress/gpa';
import { useAuth } from '@hooks/CustomHook/useAuth';
import useGetAllMark from '@hooks/ReactQueryHook/courses/useGetAllMark';
import useCourseQueries from '@hooks/ReactQueryHook/courses/useCourseQueries';
import { useI18n } from '@i18n/context';

const hoursOptions = [1, 2, 3, 4];

type SemesterRow = { subject: string; hours: string; grade: string };
type RepeatRow = {
  subject: string;
  hours: string;
  newGrade: string;
  oldGrade: string;
};
type FormValues = {
  oldHours: string;
  oldGPA: string;
  semesterCourses: SemesterRow[];
  repeatedCourses: RepeatRow[];
};

type Result = { gpa: number; hours: number; previousGpa: number | null };

const inputCls =
  'w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none';
const cardCls =
  'mt-4 rounded-2xl border border-white/10 bg-neutral-950/70 p-4 shadow-lg';

export default function GPACalculator() {
  const { isAuthenticated } = useAuth();
  const { allMarks } = useGetAllMark();
  const { useCoursesQuery } = useCourseQueries();
  const { data: courses } = useCoursesQuery();
  const [result, setResult] = useState<Result | null>(null);
  const { t } = useI18n();

  // GPA from the grades saved on the study-plan map.
  const saved = useMemo(() => {
    const hours = new Map<number, number>();
    for (const c of courses ?? []) {
      if (typeof c.creditHours === 'number' && c.creditHours > 0)
        hours.set(c.id, c.creditHours);
    }
    return computeGpa(allMarks, hours);
  }, [allMarks, courses]);

  const { register, control, handleSubmit, setValue, reset } =
    useForm<FormValues>({
      defaultValues: {
        oldHours: '',
        oldGPA: '',
        semesterCourses: Array.from({ length: 8 }, () => ({
          subject: '',
          hours: '',
          grade: 'A',
        })),
        repeatedCourses: Array.from({ length: 3 }, () => ({
          subject: '',
          hours: '',
          newGrade: 'A',
          oldGrade: 'F',
        })),
      },
    });

  const { fields: semesterFields } = useFieldArray({
    control,
    name: 'semesterCourses',
  });
  const { fields: repeatedFields } = useFieldArray({
    control,
    name: 'repeatedCourses',
  });

  const applySavedGrades = () => {
    if (saved.gpa === null) return;
    setValue('oldHours', String(saved.gradedHours));
    setValue('oldGPA', saved.gpa.toFixed(2));
    setResult(null);
  };

  const onSubmit = (data: FormValues) => {
    const oldHours = Number(data.oldHours) || 0;
    const oldGpa = Number(data.oldGPA) || 0;
    let totalPoints = oldHours * oldGpa;
    let totalHours = oldHours;

    for (const c of data.semesterCourses) {
      const h = Number(c.hours) || 0;
      if (h > 0) {
        totalPoints += h * GRADE_POINTS[c.grade];
        totalHours += h;
      }
    }
    // A repeated course replaces its old grade; its hours are already in the old total.
    for (const c of data.repeatedCourses) {
      const h = Number(c.hours) || 0;
      if (h > 0) {
        totalPoints +=
          h * (GRADE_POINTS[c.newGrade] - GRADE_POINTS[c.oldGrade]);
      }
    }

    setResult({
      gpa:
        totalHours > 0 ? Math.round((totalPoints / totalHours) * 100) / 100 : 0,
      hours: totalHours,
      previousGpa: oldHours > 0 ? oldGpa : null,
    });
  };

  const gradeSelect = (
    name:
      | `semesterCourses.${number}.grade`
      | `repeatedCourses.${number}.newGrade`
      | `repeatedCourses.${number}.oldGrade`,
    label: string
  ) => (
    <select aria-label={label} className={inputCls} {...register(name)}>
      {GRADES.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  );

  const hoursSelect = (
    name: `semesterCourses.${number}.hours` | `repeatedCourses.${number}.hours`,
    label: string
  ) => (
    <select aria-label={label} className={inputCls} {...register(name)}>
      <option value="">{t('gpa.hrs')}</option>
      {hoursOptions.map((h) => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
  );

  const delta =
    result && result.previousGpa !== null
      ? Math.round((result.gpa - result.previousGpa) * 100) / 100
      : null;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <header className="text-center">
        <h1 className="mt-2 text-3xl font-bold text-white">{t('gpa.title')}</h1>
        <p className="mt-2 text-sm text-white/70">{t('gpa.subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className={cardCls} aria-labelledby="old-avg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="old-avg" className="text-lg font-semibold text-white">
              {t('gpa.current')}
            </h2>
            {isAuthenticated && saved.gpa !== null && (
              <button
                type="button"
                onClick={applySavedGrades}
                className="cursor-pointer rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-200 hover:bg-green-500/20"
              >
                {t('gpa.useSaved', {
                  gpa: saved.gpa.toFixed(2),
                  h: saved.gradedHours,
                })}
              </button>
            )}
          </div>
          {!isAuthenticated && (
            <p className="mt-1 text-xs text-white/50">
              <Link to="/login" className="text-blue-400 hover:underline">
                {t('common.signIn')}
              </Link>{' '}
              {t('gpa.signInHint')}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs text-white/60">
              {t('gpa.completedHours')}
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={t('gpa.hoursPh')}
                className={`${inputCls} mt-1`}
                {...register('oldHours')}
              />
            </label>
            <label className="text-xs text-white/60">
              {t('gpa.cumulative')}
              <input
                type="number"
                min={0}
                max={4}
                step="0.01"
                inputMode="decimal"
                placeholder={t('gpa.gpaPh')}
                className={`${inputCls} mt-1`}
                {...register('oldGPA')}
              />
            </label>
          </div>
        </section>

        <section className={cardCls} aria-labelledby="this-sem">
          <h2 id="this-sem" className="text-lg font-semibold text-white">
            {t('gpa.thisSemester')}
          </h2>
          <div className="mt-2 grid grid-cols-[1fr_5rem_5rem] gap-2 text-xs text-white/50">
            <span>{t('gpa.course')}</span>
            <span>{t('gpa.hours')}</span>
            <span>{t('gpa.grade')}</span>
          </div>
          {semesterFields.map((field, i) => (
            <div
              key={field.id}
              className="mt-2 grid grid-cols-[1fr_5rem_5rem] gap-2"
            >
              <input
                type="text"
                dir="auto"
                aria-label={t('gpa.courseN', { n: i + 1 })}
                placeholder={t('common.optional')}
                className={inputCls}
                {...register(`semesterCourses.${i}.subject`)}
              />
              {hoursSelect(
                `semesterCourses.${i}.hours`,
                t('gpa.courseNHours', { n: i + 1 })
              )}
              {gradeSelect(
                `semesterCourses.${i}.grade`,
                t('gpa.courseNGrade', { n: i + 1 })
              )}
            </div>
          ))}
        </section>

        <section className={cardCls} aria-labelledby="repeat">
          <h2 id="repeat" className="text-lg font-semibold text-white">
            {t('gpa.repeated')}
          </h2>
          <p className="text-xs text-white/50">{t('gpa.repeatedHint')}</p>
          <div className="mt-2 grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 text-xs text-white/50">
            <span>{t('gpa.course')}</span>
            <span>{t('gpa.hours')}</span>
            <span>{t('gpa.new')}</span>
            <span>{t('gpa.old')}</span>
          </div>
          {repeatedFields.map((field, i) => (
            <div
              key={field.id}
              className="mt-2 grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2"
            >
              <input
                type="text"
                dir="auto"
                aria-label={t('gpa.repeatN', { n: i + 1 })}
                placeholder={t('common.optional')}
                className={inputCls}
                {...register(`repeatedCourses.${i}.subject`)}
              />
              {hoursSelect(
                `repeatedCourses.${i}.hours`,
                t('gpa.repeatNHours', { n: i + 1 })
              )}
              {gradeSelect(
                `repeatedCourses.${i}.newGrade`,
                t('gpa.repeatNNew', { n: i + 1 })
              )}
              {gradeSelect(
                `repeatedCourses.${i}.oldGrade`,
                t('gpa.repeatNOld', { n: i + 1 })
              )}
            </div>
          ))}
        </section>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500"
          >
            {t('gpa.calculate')}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setResult(null);
            }}
            className="cursor-pointer rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5"
          >
            {t('gpa.clear')}
          </button>
        </div>

        {result && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-2xl border border-white/10 bg-neutral-950/80 p-5 text-center"
          >
            <span className="block text-sm text-white/60">
              {t('gpa.newGpa')}
            </span>
            <span className="block text-4xl font-bold text-white">
              {result.gpa.toFixed(2)}
            </span>
            <span className="mt-1 block text-sm text-white/60">
              {t('gpa.totalHours', { n: result.hours })}
              {delta !== null && (
                <span
                  className={delta >= 0 ? 'text-green-400' : 'text-red-400'}
                >
                  {' '}
                  ·{' '}
                  {t('gpa.vsNow', {
                    d: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`,
                  })}
                </span>
              )}
            </span>
          </output>
        )}
      </form>
    </main>
  );
}
