import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';
import {
  EXAM_FILE_TYPES,
  EXAM_KINDS,
  MAX_EXAM_FILE_BYTES,
  TERMS,
  formatSize,
  type ExamKind,
  type PastExam,
  type Term,
} from './exams';
import { examFileUrl, openPrivateExamFile } from './examFiles';

const input =
  'w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-white/40';

const thisYear = new Date().getFullYear();

/** Course drawer tab: old exam papers, and the upload form for signed-in students. */
const PastExamsTab = () => {
  const { courseId } = useTreeFlowContext();
  const { userInfo, isAdmin } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ExamKind | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [meta, setMeta] = useState({
    kind: 'FINAL' as ExamKind,
    year: thisYear,
    term: 'FIRST' as Term,
    doctor: '',
    withSolution: false,
  });

  const key = ['pastExams', courseId];
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: key,
    queryFn: async () =>
      (await axios.get<PastExam[]>(`/api/past-exams/course/${courseId}`)).data,
    enabled: !!courseId,
  });

  const upload = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('file', file!);
      form.append('kind', meta.kind);
      form.append('year', String(meta.year));
      form.append('term', meta.term);
      if (meta.doctor.trim()) form.append('doctor', meta.doctor.trim());
      form.append('withSolution', String(meta.withSolution));
      return (
        await axios.post<PastExam>(`/api/past-exams/course/${courseId}`, form)
      ).data;
    },
    onSuccess: (exam) => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(exam.approved ? t('pe.published') : t('pe.sentForReview'));
      setFile(null);
      setShowForm(false);
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/past-exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(t('pe.deleted'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const pickFile = (f: File | null) => {
    setFileError('');
    setFile(null);
    if (!f) return;
    if (!EXAM_FILE_TYPES.includes(f.type)) return setFileError(t('pe.badType'));
    if (f.size > MAX_EXAM_FILE_BYTES) return setFileError(t('pe.tooBig'));
    setFile(f);
  };

  const shown = filter ? data.filter((e) => e.kind === filter) : data;
  const kindsPresent = EXAM_KINDS.filter((k) => data.some((e) => e.kind === k));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-white">{t('pe.title')}</h2>
        {kindsPresent.length > 1 && (
          <select
            aria-label={t('pe.kind')}
            value={filter}
            onChange={(e) => setFilter(e.target.value as ExamKind | '')}
            className="cursor-pointer rounded-lg border border-white/10 bg-neutral-900 px-2 py-1 text-xs text-white"
          >
            <option value="">{t('pe.filterAll')}</option>
            {kindsPresent.map((k) => (
              <option key={k} value={k}>
                {t(`exam.kind.${k}`)}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-white/50">{t('common.loading')}</p>
      ) : isError ? (
        <p className="text-sm text-red-400">{t('pe.loadError')}</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-white/50">
          {t('pe.empty')}
          {userInfo ? t('pe.emptyAdd') : ''}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((e) => (
            <li
              key={e.id}
              className={`rounded-lg border px-3 py-2 ${e.approved ? 'border-white/10 bg-white/5' : 'border-amber-500/40 bg-amber-500/5'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {t(`exam.kind.${e.kind}`)} · {t(`exam.term.${e.term}`)}{' '}
                    {e.year}
                  </p>
                  <p className="text-xs text-white/50" dir="auto">
                    {[
                      e.doctor,
                      formatSize(e.sizeBytes),
                      t('pe.by', { name: e.uploader }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {e.withSolution && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-200">
                        {t('pe.solution')}
                      </span>
                    )}
                    {!e.approved && (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-200">
                        {t('pe.pending')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {e.approved ? (
                    <>
                      <a
                        href={examFileUrl(e.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        {t('pe.open')}
                      </a>
                      <a
                        href={examFileUrl(e.id, true)}
                        className="rounded-md border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/5"
                      >
                        {t('pe.download')}
                      </a>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        openPrivateExamFile(e.id).catch(() =>
                          toast.error(t('pe.openFailed'))
                        )
                      }
                      className="cursor-pointer rounded-md border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/5"
                    >
                      {t('pe.open')}
                    </button>
                  )}
                  {(e.mine || isAdmin) && (
                    <button
                      type="button"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(t('pe.confirmDelete')))
                          remove.mutate(e.id);
                      }}
                      aria-label={t('pe.delete')}
                      title={t('pe.delete')}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-red-400"
                    >
                      <MdDeleteOutline className="text-lg" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!userInfo ? (
        <p className="text-sm text-white/50">
          <Link to="/login" className="text-blue-400 hover:underline">
            {t('common.signIn')}
          </Link>{' '}
          · {t('pe.signIn')}
        </p>
      ) : !showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="cursor-pointer self-start rounded-lg border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
        >
          + {t('pe.upload')}
        </button>
      ) : (
        <form
          className="flex flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!file) return setFileError(t('pe.pickFile'));
            upload.mutate();
          }}
        >
          <h3 className="font-semibold text-white">{t('pe.upload')}</h3>
          <label className="block text-xs text-white/60">
            {t('pe.file')}
            <input
              type="file"
              accept={EXAM_FILE_TYPES.join(',')}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-white/80 file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white"
            />
          </label>
          {fileError && (
            <p role="alert" className="text-xs text-red-300">
              {fileError}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="block text-xs text-white/60">
              {t('pe.kind')}
              <select
                className={`${input} mt-1`}
                value={meta.kind}
                onChange={(e) =>
                  setMeta({ ...meta, kind: e.target.value as ExamKind })
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
              {t('pe.term')}
              <select
                className={`${input} mt-1`}
                value={meta.term}
                onChange={(e) =>
                  setMeta({ ...meta, term: e.target.value as Term })
                }
              >
                {TERMS.map((k) => (
                  <option key={k} value={k}>
                    {t(`exam.term.${k}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-white/60">
              {t('pe.year')}
              <input
                type="number"
                min={1990}
                max={thisYear + 1}
                className={`${input} mt-1`}
                value={meta.year}
                onChange={(e) =>
                  setMeta({ ...meta, year: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <label className="block text-xs text-white/60">
            {t('pe.doctor')}{' '}
            <span className="text-white/40">({t('common.optional')})</span>
            <input
              className={`${input} mt-1`}
              maxLength={100}
              dir="auto"
              value={meta.doctor}
              onChange={(e) => setMeta({ ...meta, doctor: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={meta.withSolution}
              onChange={(e) =>
                setMeta({ ...meta, withSolution: e.target.checked })
              }
              className="h-4 w-4 cursor-pointer rounded"
            />
            {t('pe.withSolution')}
          </label>
          {!isAdmin && (
            <p className="text-xs text-white/40">{t('pe.reviewNote')}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={upload.isPending}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {upload.isPending ? t('pe.sending') : t('pe.send')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFile(null);
                setFileError('');
              }}
              className="cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PastExamsTab;
