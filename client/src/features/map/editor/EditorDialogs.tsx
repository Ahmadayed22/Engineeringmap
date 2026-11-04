import axios from 'axios';
import { useMemo, useState } from 'react';
import Dialog from '../Dialog';
import type { Node } from '@xyflow/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useCourseQueries, {
  courseQueryKeys,
} from '@hooks/ReactQueryHook/courses/useCourseQueries';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';
import { normalizeForSearch } from '@features/progress/search';
import type { PlanKey, StudyMapResponse } from '../useStudyMap';

type Course = { id: number; name: string; creditHours: number | null };

/** Add a box for a new course (created right away) or for an existing one. */
export const AddCourseDialog = ({
  nodes,
  onAdd,
  onClose,
}: {
  nodes: Node[];
  onAdd: (courseId: number, label: string) => void;
  onClose: () => void;
}) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { useCoursesQuery } = useCourseQueries();
  const { data: courses = [] } = useCoursesQuery();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [name, setName] = useState('');
  const [hours, setHours] = useState('3');
  const [search, setSearch] = useState('');

  // The name already used on this map, if the course is on it.
  const mapLabels = useMemo(() => {
    const map = new Map<number, string>();
    for (const n of nodes) {
      const id = Number(n.data?.courseId);
      if (Number.isFinite(id) && !map.has(id))
        map.set(id, String(n.data?.label ?? ''));
    }
    return map;
  }, [nodes]);

  const create = useMutation({
    mutationFn: async () =>
      (
        await axios.post<Course>('/api/courses', {
          name: name.trim(),
          label: name.trim(),
          description: name.trim(),
          creditHours: Number(hours),
        })
      ).data,
    onSuccess: (course) => {
      void queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
      toast.success(t('mapEditor.add.created'));
      onAdd(course.id, name.trim());
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const results = useMemo(() => {
    const q = normalizeForSearch(search.trim());
    return (courses as Course[])
      .map((c) => ({ ...c, label: mapLabels.get(c.id) ?? c.name }))
      .filter(
        (c) =>
          !q ||
          String(c.id) === q ||
          normalizeForSearch(c.label).includes(q) ||
          normalizeForSearch(c.name).includes(q)
      )
      .slice(0, 50);
  }, [courses, search, mapLabels]);

  const validNew =
    name.trim().length > 0 && /^\d+$/.test(hours) && Number(hours) > 0;

  const tab = (key: 'new' | 'existing') =>
    `cursor-pointer rounded-md px-3 py-1.5 text-sm ${
      mode === key ? 'bg-white/15 font-semibold' : 'text-white/60 hover:text-white'
    }`;

  return (
    <Dialog title={t('mapEditor.add.title')} onClose={onClose}>
      <div role="tablist" className="mb-4 inline-flex rounded-lg border border-white/10 p-1">
        <button role="tab" aria-selected={mode === 'new'} className={tab('new')} onClick={() => setMode('new')}>
          {t('mapEditor.add.new')}
        </button>
        <button role="tab" aria-selected={mode === 'existing'} className={tab('existing')} onClick={() => setMode('existing')}>
          {t('mapEditor.add.existing')}
        </button>
      </div>

      {mode === 'new' ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (validNew && !create.isPending) create.mutate();
          }}
        >
          <label className="block space-y-1">
            <span className="text-xs text-white/60">{t('mapEditor.add.name')}</span>
            <input
              autoFocus
              value={name}
              maxLength={250}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-neutral-950 px-3 py-2 text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-white/60">{t('mapEditor.creditHours')}</span>
            <input
              inputMode="numeric"
              value={hours}
              onChange={(e) => setHours(e.target.value.trim())}
              className="w-24 rounded-lg border border-white/15 bg-neutral-950 px-3 py-2 text-white"
            />
          </label>
          <p className="text-xs text-white/50">{t('mapEditor.add.hint')}</p>
          <button
            type="submit"
            disabled={!validNew || create.isPending}
            className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('mapEditor.add.create')}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('mapEditor.add.search')}
            aria-label={t('mapEditor.add.search')}
            className="w-full rounded-lg border border-white/15 bg-neutral-950 px-3 py-2 text-white"
          />
          {results.length === 0 ? (
            <p className="text-sm text-white/60">{t('mapEditor.add.none')}</p>
          ) : (
            <ul className="max-h-[45vh] divide-y divide-white/10 overflow-auto rounded-lg border border-white/10">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onAdd(c.id, c.label)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-start hover:bg-white/10"
                  >
                    <span>
                      {c.label}{' '}
                      <span className="text-xs text-white/40">#{c.id}</span>
                    </span>
                    {mapLabels.has(c.id) && (
                      <span className="shrink-0 text-xs text-white/50">
                        {t('mapEditor.add.onMap')}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-white/50">{t('mapEditor.add.hint')}</p>
        </div>
      )}
    </Dialog>
  );
};

type VersionInfo = { version: number; createdAt: string | null; author: string | null };

/** Published versions of a map, newest first, with restore. */
export const HistoryDialog = ({
  plan,
  currentVersion,
  onRestored,
  onClose,
}: {
  plan: PlanKey;
  currentVersion: number;
  onRestored: (map: StudyMapResponse) => void;
  onClose: () => void;
}) => {
  const { t, locale } = useI18n();
  const { data: versions, isLoading } = useQuery({
    queryKey: ['studyMapVersions', plan],
    queryFn: async () =>
      (await axios.get<VersionInfo[]>(`/api/admin/maps/${plan}/versions`)).data,
  });
  const restore = useMutation({
    mutationFn: async (version: number) =>
      (
        await axios.post<StudyMapResponse>(
          `/api/admin/maps/${plan}/versions/${version}/restore`
        )
      ).data,
    onSuccess: (map, version) => {
      toast.success(t('mapEditor.history.restored', { n: version }));
      onRestored(map);
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  return (
    <Dialog title={t('mapEditor.history.title')} onClose={onClose}>
      {isLoading ? (
        <p className="text-sm text-white/60">{t('common.loading')}</p>
      ) : (
        <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
          {(versions ?? []).map((v) => (
            <li key={v.version} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="text-sm">
                <div className="font-semibold">
                  {t('mapEditor.version', { n: v.version })}
                  {v.version === currentVersion && (
                    <span className="ms-2 rounded bg-white/15 px-1.5 py-0.5 text-xs">
                      {t('mapEditor.history.current')}
                    </span>
                  )}
                </div>
                {/* <bdi> keeps a Latin username and the date from scrambling the Arabic line. */}
                <div className="text-xs text-white/50">
                  {v.author ? (
                    <>
                      {t('admin.by', { name: '' })}
                      <bdi>{v.author}</bdi>
                    </>
                  ) : (
                    t('mapEditor.history.original')
                  )}
                  {v.createdAt && (
                    <>
                      {' · '}
                      <bdi>{new Date(v.createdAt).toLocaleString(locale)}</bdi>
                    </>
                  )}
                </div>
              </div>
              {v.version !== currentVersion && (
                <button
                  type="button"
                  disabled={restore.isPending}
                  onClick={() => {
                    if (window.confirm(t('mapEditor.history.confirm', { n: v.version })))
                      restore.mutate(v.version);
                  }}
                  className="shrink-0 cursor-pointer rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25 disabled:opacity-40"
                >
                  {t('mapEditor.history.restore')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
};
