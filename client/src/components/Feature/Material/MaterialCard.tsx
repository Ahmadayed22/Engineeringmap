import { SlBookOpen } from 'react-icons/sl';
import { MdDeleteOutline, MdOutlineFlag } from 'react-icons/md';
import { IoMdAddCircleOutline } from 'react-icons/io';
import {
  BiDownvote,
  BiSolidDownvote,
  BiSolidUpvote,
  BiUpvote,
} from 'react-icons/bi';
import MaterialModal from '@components/common/Modal/MaterialModal';
import React, { useMemo, useState } from 'react';
import { useDeleteMaterial } from '@hooks/index';
import { Material } from '@customTypes/Material';
import { useAuth } from '@hooks/CustomHook/useAuth';
import useMaterialFeedback from '@hooks/ReactQueryHook/material/useMaterialFeedback';
import { safeHref } from '@util/safeHref';
import { useI18n } from '@i18n/context';

type MaterialCardProps = {
  item: { label: string; key: string };
  data: Material[] | undefined;
  isLoading: boolean;
  isError: boolean;
  deleteMaterial: ReturnType<typeof useDeleteMaterial>['deleteMaterial'];
  userId: number | undefined;
  courseId: unknown;
};

const REPORT_REASONS = [
  'mat.reason.broken',
  'mat.reason.wrongCourse',
  'mat.reason.spam',
  'mat.reason.copyright',
] as const;

const truncateUrl = (url: string): string => {
  const baseUrl = url.split('?')[0];
  return baseUrl.length > 50 ? `${baseUrl.substring(0, 47)}...` : baseUrl;
};

const iconBtn =
  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

const MaterialCard = ({
  item,
  data,
  isLoading,
  isError,
  deleteMaterial,
  userId,
  courseId,
}: MaterialCardProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const { userInfo, isAdmin } = useAuth();
  const { vote, report } = useMaterialFeedback(courseId);
  const { t } = useI18n();
  const key = item.key as keyof Material;

  // Only materials of this category, best-rated first.
  const links = useMemo(
    () =>
      (data ?? [])
        .filter((m) => typeof m[key] === 'string' && m[key])
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [data, key]
  );

  const castVote = (m: Material, value: 1 | -1) => {
    if (!userInfo) return;
    vote.mutate({ id: m.id, value: m.myVote === value ? 0 : value });
  };

  return (
    <div className="mb-2 flex flex-col gap-1">
      <div className="relative mb-3 flex flex-row items-center justify-start gap-2">
        {userInfo && (
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="absolute end-0 cursor-pointer text-white/80 hover:text-white"
            aria-label={t('mat.addLinkTo', { cat: item.label })}
            title={t('mat.addLink')}
          >
            <IoMdAddCircleOutline className="text-2xl" />
          </button>
        )}
        <span className="font-semibold text-white">{item.label}</span>
        <SlBookOpen className="text-lg text-white" aria-hidden="true" />
      </div>
      <MaterialModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        item={item}
      />

      {isLoading ? (
        <span className="text-start text-sm text-gray-500">
          {t('common.loading')}
        </span>
      ) : isError ? (
        <span className="text-start text-sm text-red-500">
          {t('mat.loadError')}
        </span>
      ) : links.length === 0 ? (
        <span className="text-start text-sm text-gray-400">
          {t('mat.empty')}
          {userInfo ? t('mat.emptyAdd') : ''}
        </span>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {links.map((material) => {
            const url = material[key] as string;
            const href = safeHref(url);
            const canDelete = userId && (material.userId === userId || isAdmin);
            return (
              <li
                key={`${item.key}-${material.id}`}
                className="flex flex-col gap-1"
              >
                <div className="flex flex-row items-center justify-start gap-1">
                  {userInfo && (
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() =>
                        setReportingId(
                          reportingId === material.id ? null : material.id
                        )
                      }
                      aria-label={t('mat.reportLabel')}
                      title={t('mat.report')}
                    >
                      <MdOutlineFlag />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => deleteMaterial.mutate(material.id)}
                      disabled={deleteMaterial.isPending}
                      className={`${iconBtn} hover:text-red-400`}
                      aria-label={t('mat.deleteLabel')}
                      title={t('common.delete')}
                    >
                      <MdDeleteOutline className="text-xl" />
                    </button>
                  )}
                  <div
                    className="flex items-center gap-0.5 rounded-md bg-white/5 px-1"
                    aria-label={t('mat.votes')}
                  >
                    <button
                      type="button"
                      className={iconBtn}
                      disabled={!userInfo}
                      onClick={() => castVote(material, 1)}
                      aria-pressed={material.myVote === 1}
                      aria-label={t('mat.helpful')}
                      title={
                        userInfo ? t('mat.helpful') : t('mat.signInToVote')
                      }
                    >
                      {material.myVote === 1 ? (
                        <BiSolidUpvote className="text-green-400" />
                      ) : (
                        <BiUpvote />
                      )}
                    </button>
                    <span className="min-w-5 text-center text-xs tabular-nums text-white/80">
                      {material.score ?? 0}
                    </span>
                    <button
                      type="button"
                      className={iconBtn}
                      disabled={!userInfo}
                      onClick={() => castVote(material, -1)}
                      aria-pressed={material.myVote === -1}
                      aria-label={t('mat.notHelpful')}
                      title={
                        userInfo ? t('mat.notHelpful') : t('mat.signInToVote')
                      }
                    >
                      {material.myVote === -1 ? (
                        <BiSolidDownvote className="text-red-400" />
                      ) : (
                        <BiDownvote />
                      )}
                    </button>
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      dir="auto"
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {material.name || truncateUrl(url)}
                    </a>
                  ) : (
                    <span
                      className="text-sm text-white/40"
                      title={t('mat.invalidLinkTitle')}
                    >
                      {material.name || t('mat.invalidLink')}
                    </span>
                  )}
                </div>
                {reportingId === material.id && (
                  <div
                    className="flex flex-wrap justify-start gap-1.5"
                    role="group"
                    aria-label={t('mat.whyReport')}
                  >
                    {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        disabled={report.isPending}
                        onClick={() =>
                          report.mutate(
                            { id: material.id, reason: t(reason) },
                            { onSettled: () => setReportingId(null) }
                          )
                        }
                        className="cursor-pointer rounded-full border border-amber-500/40 px-2.5 py-0.5 text-xs text-amber-200 hover:bg-amber-500/15"
                      >
                        {t(reason)}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default React.memo(MaterialCard);
