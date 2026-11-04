import CommentList from './CommentList';
import useCommentSection from '@hooks/ReactQueryHook/comment/useCommentSection';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useI18n } from '@i18n/context';

const Skeleton = () => (
  <div className="space-y-3" aria-hidden="true">
    {[0, 1].map((i) => (
      <div
        key={i}
        className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-neutral-800" />
          <div className="h-3 w-24 rounded bg-neutral-800" />
        </div>
        <div className="h-3 w-full rounded bg-neutral-800" />
        <div className="mt-2 h-3 w-2/3 rounded bg-neutral-800" />
      </div>
    ))}
  </div>
);

const CommentSection = () => {
  const {
    commentCount,
    comments,
    isCommentsLoading,
    countError,
    commentsError,
    isCountLoading,
  } = useCommentSection();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  if (isCountLoading || isCommentsLoading) {
    return (
      <div role="status" aria-label={t('comments.loading')}>
        <Skeleton />
      </div>
    );
  }

  if (countError || commentsError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-center text-sm"
      >
        <p className="text-red-300">{t('comments.loadError')}</p>
        <button
          type="button"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['CourseByCourseId'] });
            queryClient.invalidateQueries({ queryKey: ['commentsCount'] });
          }}
          className="mt-2 cursor-pointer rounded-md border border-red-800 px-3 py-1 text-red-200 hover:bg-red-900/40"
        >
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">
        {t('comments.count', { n: commentCount ?? 0 })}
      </h3>
      <CommentList comments={comments ?? []} isLoading={isCommentsLoading} />
    </div>
  );
};

export default React.memo(CommentSection);
