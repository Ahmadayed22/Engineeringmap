import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosErrorHandler } from '@util/index';
import { DrEmail } from '@customTypes/DrEmail';
import { useI18n } from '@i18n/context';
import { safeHref } from '@util/safeHref';
import { formatSize, type ExamKind, type Term } from '@features/study/exams';
import { openPrivateExamFile } from '@features/study/examFiles';

type Report = {
  id: number;
  resourceId: number;
  resourceName: string | null;
  courseId: number;
  courseName: string | null;
  reason: string;
  reporter: string;
  createdAt: string;
};

type Page<T> = { content: T[]; totalElements: number };

const card =
  'rounded-2xl border border-white/10 bg-neutral-950/75 p-5 shadow-xl';
const input =
  'w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-white/40';

const Reports = () => {
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => (await axios.get<Report[]>('/api/admin/reports')).data,
  });
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
  const resolve = useMutation({
    mutationFn: (id: number) => axios.post(`/api/admin/reports/${id}/resolve`),
    onSuccess: () => {
      refresh();
      toast.success(t('admin.dismissed'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });
  const remove = useMutation({
    mutationFn: (r: Report) => axios.delete(`/api/resource/${r.resourceId}`),
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ['resource'] });
      toast.success(t('admin.deleted'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  return (
    <section className={card} aria-labelledby="reports-h">
      <h2 id="reports-h" className="mb-3 text-lg font-semibold text-white">
        {t('admin.reports')}{' '}
        <span className="text-sm font-normal text-white/50">
          {t('admin.open', { n: data.length })}
        </span>
      </h2>
      {isLoading ? (
        <p className="text-sm text-white/60">{t('common.loading')}</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-white/60">{t('admin.nothing')}</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {data.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-white" dir="auto">
                  <span className="font-medium">
                    {r.resourceName || t('admin.material', { n: r.resourceId })}
                  </span>
                  <span className="text-white/50">
                    {' '}
                    · {r.courseName || t('admin.course', { n: r.courseId })}
                  </span>
                </p>
                <p className="text-xs text-white/60">
                  “{r.reason}” · {t('admin.by', { name: r.reporter })} ·{' '}
                  {new Date(r.createdAt).toLocaleDateString(locale)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/course/${r.courseId}`}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
                >
                  {t('admin.openCourse')}
                </Link>
                <button
                  type="button"
                  disabled={resolve.isPending}
                  onClick={() => resolve.mutate(r.id)}
                  className="cursor-pointer rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
                >
                  {t('admin.dismiss')}
                </button>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm(t('admin.confirmDelete')))
                      remove.mutate(r);
                  }}
                  className="cursor-pointer rounded-md border border-red-800 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/30"
                >
                  {t('admin.deleteMaterial')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

type PendingMaterial = {
  id: number;
  courseId: number;
  courseName: string | null;
  name: string | null;
  category: string;
  url: string;
  uploader: string;
};

type PendingExam = {
  id: number;
  courseId: number;
  courseName: string | null;
  kind: ExamKind;
  year: number;
  term: Term;
  doctor: string | null;
  withSolution: boolean;
  fileName: string;
  sizeBytes: number;
  uploader: string;
};

type ReviewKind = 'materials' | 'past-exams';

const CATEGORY_KEYS = {
  books: 'mat.books',
  summaries: 'mat.summaries',
  slides: 'mat.slides',
  labs: 'mat.labs',
  exams: 'mat.exams',
  videos: 'mat.videos',
} as const;

const smallBtn =
  'cursor-pointer rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5 disabled:opacity-40';

/** New uploads from students (materials and past exams) waiting for an admin. */
const Review = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const materials = useQuery({
    queryKey: ['admin', 'pendingMaterials'],
    queryFn: async () =>
      (await axios.get<PendingMaterial[]>('/api/admin/materials/pending')).data,
  });
  const exams = useQuery({
    queryKey: ['admin', 'pendingExams'],
    queryFn: async () =>
      (await axios.get<PendingExam[]>('/api/admin/past-exams/pending')).data,
  });
  const decide = useMutation({
    mutationFn: (v: { what: ReviewKind; id: number; ok: boolean }) =>
      axios.post(`/api/admin/${v.what}/${v.id}/${v.ok ? 'approve' : 'reject'}`),
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({
        queryKey: [v.what === 'materials' ? 'resource' : 'pastExams'],
      });
      toast.success(v.ok ? t('admin.approved') : t('admin.rejected'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });
  const reject = (what: ReviewKind, id: number) => {
    if (window.confirm(t('admin.confirmReject')))
      decide.mutate({ what, id, ok: false });
  };
  const buttons = (what: ReviewKind, id: number, courseId: number) => (
    <div className="flex flex-wrap gap-2">
      <Link to={`/course/${courseId}`} className={smallBtn}>
        {t('admin.openCourse')}
      </Link>
      <button
        type="button"
        disabled={decide.isPending}
        onClick={() => decide.mutate({ what, id, ok: true })}
        className="cursor-pointer rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
      >
        {t('admin.approve')}
      </button>
      <button
        type="button"
        disabled={decide.isPending}
        onClick={() => reject(what, id)}
        className="cursor-pointer rounded-md border border-red-800 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/30 disabled:opacity-40"
      >
        {t('admin.reject')}
      </button>
    </div>
  );

  const m = materials.data ?? [];
  const x = exams.data ?? [];
  return (
    <section className={card} aria-labelledby="review-h">
      <h2 id="review-h" className="mb-3 text-lg font-semibold text-white">
        {t('admin.review')}{' '}
        <span className="text-sm font-normal text-white/50">
          {t('admin.waiting', { n: m.length + x.length })}
        </span>
      </h2>

      <h3 className="mt-2 text-sm font-semibold text-white/80">
        {t('admin.reviewMaterials')}
      </h3>
      {materials.isLoading ? (
        <p className="text-sm text-white/60">{t('common.loading')}</p>
      ) : m.length === 0 ? (
        <p className="text-sm text-white/60">{t('admin.nothing')}</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {m.map((r) => {
            const href = safeHref(r.url);
            const cat = CATEGORY_KEYS[r.category as keyof typeof CATEGORY_KEYS];
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white" dir="auto">
                    <span className="font-medium">
                      {r.name || t('admin.material', { n: r.id })}
                    </span>
                    <span className="text-white/50">
                      {' '}
                      · {cat ? t(cat) : r.category} ·{' '}
                      {r.courseName || t('admin.course', { n: r.courseId })}
                    </span>
                  </p>
                  <p className="truncate text-xs text-white/60">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-blue-400 hover:underline"
                        dir="ltr"
                      >
                        {r.url}
                      </a>
                    ) : (
                      <span dir="ltr">{r.url}</span>
                    )}{' '}
                    · {t('admin.by', { name: r.uploader })}
                  </p>
                </div>
                {buttons('materials', r.id, r.courseId)}
              </li>
            );
          })}
        </ul>
      )}

      <h3 className="mt-4 text-sm font-semibold text-white/80">
        {t('admin.reviewExams')}
      </h3>
      {exams.isLoading ? (
        <p className="text-sm text-white/60">{t('common.loading')}</p>
      ) : x.length === 0 ? (
        <p className="text-sm text-white/60">{t('admin.nothing')}</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {x.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-white" dir="auto">
                  <span className="font-medium">
                    {t(`exam.kind.${e.kind}`)} · {t(`exam.term.${e.term}`)}{' '}
                    {e.year}
                  </span>
                  <span className="text-white/50">
                    {' '}
                    · {e.courseName || t('admin.course', { n: e.courseId })}
                  </span>
                </p>
                <p className="text-xs text-white/60" dir="auto">
                  {[
                    e.doctor,
                    e.withSolution ? t('pe.solution') : null,
                    e.fileName,
                    formatSize(e.sizeBytes),
                    t('admin.by', { name: e.uploader }),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openPrivateExamFile(e.id).catch(() =>
                      toast.error(t('pe.openFailed'))
                    )
                  }
                  className={smallBtn}
                >
                  {t('admin.openFile')}
                </button>
                {buttons('past-exams', e.id, e.courseId)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const FacultyEmails = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({ name: '', email: '', department: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data } = useQuery({
    queryKey: ['admin', 'dremails', search],
    queryFn: async () =>
      (
        await axios.get<Page<DrEmail>>('/api/dremails', {
          params: { search, size: 50, sortBy: 'name' },
        })
      ).data,
  });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'dremails'] });
    queryClient.invalidateQueries({ queryKey: ['drEmails'] });
  };
  const save = useMutation({
    mutationFn: () =>
      editingId
        ? axios.put(`/api/dremails/${editingId}`, draft)
        : axios.post('/api/dremails', draft),
    onSuccess: () => {
      refresh();
      setDraft({ name: '', email: '', department: '' });
      setEditingId(null);
      toast.success(t('admin.saved'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/dremails/${id}`),
    onSuccess: () => {
      refresh();
      toast.success(t('admin.deleted'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const valid =
    draft.name.trim() &&
    /^\S+@\S+\.\S+$/.test(draft.email) &&
    draft.department.trim();

  return (
    <section className={card} aria-labelledby="emails-h">
      <h2 id="emails-h" className="mb-3 text-lg font-semibold text-white">
        {t('admin.emails')}{' '}
        <span className="text-sm font-normal text-white/50">
          ({data?.totalElements ?? 0})
        </span>
      </h2>
      <form
        className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) save.mutate();
        }}
      >
        <input
          className={input}
          placeholder={t('admin.name')}
          aria-label={t('admin.name')}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          className={input}
          placeholder={t('auth.email')}
          aria-label={t('auth.email')}
          type="email"
          value={draft.email}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
        />
        <input
          className={input}
          placeholder={t('admin.department')}
          aria-label={t('admin.department')}
          value={draft.department}
          onChange={(e) => setDraft({ ...draft, department: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!valid || save.isPending}
            className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40"
          >
            {editingId ? t('common.save') : t('common.add')}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setDraft({ name: '', email: '', department: '' });
              }}
              className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
      <input
        className={`${input} mb-3`}
        placeholder={t('admin.search')}
        aria-label={t('admin.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="max-h-96 divide-y divide-white/10 overflow-y-auto">
        {(data?.content ?? []).map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
          >
            <span className="text-white" dir="auto">
              {d.name}{' '}
              <span className="text-white/50">
                · {d.email} · {d.department}
              </span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(d.id);
                  setDraft({
                    name: d.name,
                    email: d.email,
                    department: d.department,
                  });
                }}
                className="cursor-pointer text-xs text-blue-400 hover:underline"
              >
                {t('common.edit')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      t('admin.confirmDeleteName', { name: d.name })
                    )
                  )
                    remove.mutate(d.id);
                }}
                className="cursor-pointer text-xs text-red-400 hover:underline"
              >
                {t('common.delete')}
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

/** Admin moderation: new uploads to approve, reported materials and the faculty email directory. */
const Admin = () => {
  const { t } = useI18n();
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16">
      <header>
        <h1 className="text-3xl font-bold text-white">{t('admin.title')}</h1>
        <p className="text-sm text-white/70">{t('admin.onlyAdmins')}</p>
      </header>
      <Review />
      <Reports />
      <FacultyEmails />
    </main>
  );
};

export default Admin;
