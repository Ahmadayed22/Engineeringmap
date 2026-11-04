import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';
import Dialog from './Dialog';
import {
  roadmapName,
  roadmapPath,
  roadmapPicture,
  type Roadmap,
} from './useRoadmaps';
import { studyMapKey } from './useStudyMap';
import { shrinkImage } from './shrinkImage';

const input =
  'w-full rounded-lg border border-white/15 bg-neutral-950 px-3 py-2 text-white';
const primary =
  'cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40';

/** Admin: create a roadmap from a copy of another one or from an empty map. It starts hidden. */
export const CreateRoadmapDialog = ({
  roadmaps,
  onClose,
}: {
  roadmaps: Roadmap[];
  onClose: () => void;
}) => {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [start, setStart] = useState<'copy' | 'blank'>('copy');
  const [copyFrom, setCopyFrom] = useState(roadmaps[0]?.slug ?? '');

  const create = useMutation({
    mutationFn: async () =>
      (
        await axios.post<Roadmap>('/api/admin/plans', {
          nameAr: nameAr.trim(),
          nameEn: nameEn.trim(),
          copyFrom: start === 'copy' && copyFrom ? copyFrom : null,
        })
      ).data,
    onSuccess: (roadmap) => {
      void queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success(t('roadmaps.created'), { duration: 6000 });
      // Straight into the editor of the new roadmap.
      navigate(`${roadmapPath(roadmap.slug)}?edit=1`);
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const valid = nameAr.trim() && nameEn.trim() && (start === 'blank' || copyFrom);

  return (
    <Dialog title={t('roadmaps.createTitle')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !create.isPending) create.mutate();
        }}
      >
        <label className="block space-y-1">
          <span className="text-xs text-white/60">{t('roadmaps.nameAr')}</span>
          <input
            autoFocus
            dir="rtl"
            value={nameAr}
            maxLength={150}
            onChange={(e) => setNameAr(e.target.value)}
            className={input}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-white/60">{t('roadmaps.nameEn')}</span>
          <input
            dir="ltr"
            value={nameEn}
            maxLength={150}
            onChange={(e) => setNameEn(e.target.value)}
            className={input}
          />
          <span className="block text-xs text-white/50">{t('roadmaps.nameEnHint')}</span>
        </label>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs text-white/60">{t('roadmaps.start')}</legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="roadmap-start"
              checked={start === 'copy'}
              onChange={() => setStart('copy')}
            />
            {t('roadmaps.copyOf')}
            <select
              value={copyFrom}
              onChange={(e) => {
                setCopyFrom(e.target.value);
                setStart('copy');
              }}
              aria-label={t('roadmaps.copyOf')}
              className="rounded-lg border border-white/15 bg-neutral-950 px-2 py-1 text-white"
            >
              {roadmaps.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {roadmapName(r, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="roadmap-start"
              checked={start === 'blank'}
              onChange={() => setStart('blank')}
            />
            {t('roadmaps.blank')}
          </label>
        </fieldset>
        <p className="text-xs text-white/50">{t('roadmaps.startsHidden')}</p>
        <button type="submit" disabled={!valid || create.isPending} className={primary}>
          {t('roadmaps.create')}
        </button>
      </form>
    </Dialog>
  );
};

const secondary =
  'cursor-pointer rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40';

/** The card picture: upload (shrunk in the browser first) or remove. Saved right away. */
const PictureSection = ({ roadmap }: { roadmap: Roadmap }) => {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const picture = roadmapPicture(roadmap);
  const slug = encodeURIComponent(roadmap.slug);
  const done = () => {
    void queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    toast.success(t('roadmaps.pictureSaved'));
  };

  const upload = useMutation({
    mutationFn: async (file: File) => {
      let blob: Blob;
      try {
        blob = await shrinkImage(file);
      } catch {
        throw new Error('unreadable');
      }
      const form = new FormData();
      form.append(
        'file',
        blob,
        blob.type === 'image/webp' ? 'card.webp' : 'card.jpg'
      );
      return axios.put(`/api/admin/plans/${slug}/image`, form);
    },
    onSuccess: done,
    onError: (e) =>
      toast.error(
        e instanceof Error && e.message === 'unreadable'
          ? t('roadmaps.pictureUnreadable')
          : AxiosErrorHandler(e)
      ),
  });

  const remove = useMutation({
    mutationFn: () => axios.delete(`/api/admin/plans/${slug}/image`),
    onSuccess: done,
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const busy = upload.isPending || remove.isPending;
  return (
    <section className="space-y-2 border-t border-white/10 pt-4">
      <h3 className="text-sm font-semibold">{t('roadmaps.picture')}</h3>
      {picture ? (
        <img
          src={picture}
          alt={t('home.planAlt', { plan: roadmapName(roadmap, lang) })}
          className="aspect-[3/2] w-full rounded-lg border border-white/10 object-cover object-top"
        />
      ) : (
        <p className="text-xs text-white/50">{t('roadmaps.noPicture')}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label
          className={`${secondary} ${busy ? 'pointer-events-none opacity-40' : ''}`}
        >
          {upload.isPending
            ? t('roadmaps.uploading')
            : t('roadmaps.uploadPicture')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) upload.mutate(file);
            }}
          />
        </label>
        {roadmap.imageVersion ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => remove.mutate()}
            className={secondary}
          >
            {t('roadmaps.removePicture')}
          </button>
        ) : null}
      </div>
      <p className="text-xs text-white/50">{t('roadmaps.pictureHint')}</p>
    </section>
  );
};

/** Removing a roadmap: the admin types its name first. Courses and their data stay. */
const RemoveSection = ({
  roadmap,
  canRemove,
  onRemoved,
}: {
  roadmap: Roadmap;
  canRemove: boolean;
  onRemoved: () => void;
}) => {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const name = roadmapName(roadmap, lang);
  const matches = typed.trim() === name.trim();

  const remove = useMutation({
    mutationFn: () =>
      axios.delete(`/api/admin/plans/${encodeURIComponent(roadmap.slug)}`),
    onSuccess: () => {
      // Forget what this browser kept about it.
      try {
        localStorage.removeItem(`engmap.map.${roadmap.slug}`);
        localStorage.removeItem(`engmap.mapDraft.${roadmap.slug}`);
      } catch {
        // ignore
      }
      queryClient.removeQueries({ queryKey: studyMapKey(roadmap.slug) });
      void queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success(t('roadmaps.removed', { name }));
      onRemoved();
      navigate('/');
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  if (!canRemove) {
    return (
      <section className="border-t border-white/10 pt-4 text-xs text-white/50">
        {t('roadmaps.cantRemoveLast')}
      </section>
    );
  }

  return (
    <section className="space-y-2 border-t border-red-500/30 pt-4">
      <h3 className="text-sm font-semibold text-red-300">
        {t('roadmaps.remove')}
      </h3>
      <p className="text-xs text-white/60">{t('roadmaps.removeExplain')}</p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-lg border border-red-500/60 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
        >
          {t('roadmaps.remove')}
        </button>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (matches && !remove.isPending) remove.mutate();
          }}
        >
          <label className="block space-y-1">
            <span className="text-xs text-white/70">
              {t('roadmaps.typeToConfirm', { name })}
            </span>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className={input}
            />
          </label>
          <button
            type="submit"
            disabled={!matches || remove.isPending}
            className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('roadmaps.removeForever')}
          </button>
        </form>
      )}
    </section>
  );
};

/** Admin: rename, reorder, show or hide a roadmap; its card picture; removing it. */
export const RoadmapSettingsDialog = ({
  roadmap,
  canRemove,
  onClose,
}: {
  roadmap: Roadmap;
  /** False for the last remaining roadmap. */
  canRemove: boolean;
  onClose: () => void;
}) => {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [nameAr, setNameAr] = useState(roadmap.nameAr);
  const [nameEn, setNameEn] = useState(roadmap.nameEn);
  const [visible, setVisible] = useState(roadmap.visible);
  const [order, setOrder] = useState(String(roadmap.sortOrder));

  const save = useMutation({
    mutationFn: () =>
      axios.put(`/api/admin/plans/${encodeURIComponent(roadmap.slug)}`, {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        visible,
        sortOrder: Number(order),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success(t('admin.saved'));
      onClose();
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const valid = nameAr.trim() && nameEn.trim() && /^\d{1,4}$/.test(order);

  return (
    <Dialog
      title={`${t('roadmaps.settings')}: ${roadmapName(roadmap, lang)}`}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !save.isPending) save.mutate();
        }}
      >
        <label className="block space-y-1">
          <span className="text-xs text-white/60">{t('roadmaps.nameAr')}</span>
          <input dir="rtl" value={nameAr} maxLength={150} onChange={(e) => setNameAr(e.target.value)} className={input} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-white/60">{t('roadmaps.nameEn')}</span>
          <input dir="ltr" value={nameEn} maxLength={150} onChange={(e) => setNameEn(e.target.value)} className={input} />
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="mt-1" />
          <span>
            {t('roadmaps.visible')}
            <span className="block text-xs text-white/50">{t('roadmaps.visibleHint')}</span>
          </span>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-white/60">{t('roadmaps.order')}</span>
          <input
            inputMode="numeric"
            value={order}
            onChange={(e) => setOrder(e.target.value.trim())}
            className="w-24 rounded-lg border border-white/15 bg-neutral-950 px-3 py-2 text-white"
          />
          <span className="block text-xs text-white/50">{t('roadmaps.orderHint')}</span>
        </label>
        <button type="submit" disabled={!valid || save.isPending} className={primary}>
          {t('common.save')}
        </button>
      </form>
      <div className="mt-5 space-y-5">
        <PictureSection roadmap={roadmap} />
        <RemoveSection
          roadmap={roadmap}
          canRemove={canRemove}
          onRemoved={onClose}
        />
      </div>
    </Dialog>
  );
};
