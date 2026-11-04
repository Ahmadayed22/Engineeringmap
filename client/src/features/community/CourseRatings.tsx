import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';

type RatingSummary = {
  courseId: number;
  count: number;
  avgDifficulty: number | null;
  avgWorkload: number | null;
  myDifficulty: number | null;
  myWorkload: number | null;
};

const LEVELS = [1, 2, 3, 4, 5];

const Meter = ({ label, value }: { label: string; value: number | null }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-16 text-white/60">{label}</span>
    <div className="flex gap-0.5" aria-hidden="true">
      {LEVELS.map((l) => (
        <span
          key={l}
          className={`h-2 w-4 rounded-sm ${value !== null && l <= Math.round(value) ? 'bg-amber-400' : 'bg-white/10'}`}
        />
      ))}
    </div>
    <span className="tabular-nums text-white/80" dir="ltr">
      {value !== null ? `${value.toFixed(1)}/5` : '—'}
    </span>
  </div>
);

/** Community "how hard / how much work" ratings for the course open in the drawer. */
const CourseRatings = ({ courseId }: { courseId: unknown }) => {
  const id = Number(courseId);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const key = ['courseRatings', id, isAuthenticated];

  const { data } = useQuery({
    queryKey: key,
    queryFn: async () =>
      (await axios.get<RatingSummary>(`/api/courses/${id}/ratings`)).data,
    enabled: Number.isFinite(id) && id > 0,
  });

  const rate = useMutation({
    mutationFn: async (body: { difficulty: number; workload: number }) =>
      (await axios.put<RatingSummary>(`/api/courses/${id}/rating`, body)).data,
    onSuccess: (summary) => {
      queryClient.setQueryData(key, summary);
      toast.success(t('rate.thanks'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  if (!data) return null;

  const pick = (field: 'difficulty' | 'workload', value: number) => {
    const difficulty =
      field === 'difficulty' ? value : (data.myDifficulty ?? 3);
    const workload = field === 'workload' ? value : (data.myWorkload ?? 3);
    rate.mutate({ difficulty, workload });
  };

  const picker = (
    field: 'difficulty' | 'workload',
    mine: number | null,
    label: string
  ) => (
    <div
      className="flex items-center gap-2 text-xs"
      role="group"
      aria-label={t('rate.yours', { what: label })}
    >
      <span className="w-16 text-white/60">{label}</span>
      {LEVELS.map((l) => (
        <button
          key={l}
          type="button"
          disabled={rate.isPending}
          onClick={() => pick(field, l)}
          aria-pressed={mine === l}
          className={`h-6 w-6 cursor-pointer rounded-md border text-xs transition ${
            mine === l
              ? 'border-amber-400 bg-amber-400/20 text-amber-200'
              : 'border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <section
      aria-label={t('rate.section')}
      className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3"
    >
      <h3 className="mb-2 text-sm font-semibold text-white">
        {t('rate.title')}{' '}
        <span className="text-xs font-normal text-white/50">
          {data.count === 0
            ? t('rate.none')
            : data.count === 1
              ? t('rate.countOne')
              : t('rate.count', { n: data.count })}
        </span>
      </h3>
      <div className="flex flex-col gap-1">
        <Meter label={t('rate.difficulty')} value={data.avgDifficulty} />
        <Meter label={t('rate.workload')} value={data.avgWorkload} />
      </div>
      {isAuthenticated && (
        <details
          className="mt-2"
          open={data.myDifficulty === null ? undefined : false}
        >
          <summary className="cursor-pointer text-xs text-blue-400">
            {data.myDifficulty === null ? t('rate.rate') : t('rate.change')}
          </summary>
          <div className="mt-2 flex flex-col gap-1.5">
            {picker('difficulty', data.myDifficulty, t('rate.difficulty'))}
            {picker('workload', data.myWorkload, t('rate.workload'))}
            <p className="text-[11px] text-white/40">{t('rate.scale')}</p>
          </div>
        </details>
      )}
    </section>
  );
};

export default CourseRatings;
