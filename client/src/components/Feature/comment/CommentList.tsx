import { Button, Spinner, Textarea } from 'flowbite-react';
import CommentCard from './CommentCard';
import { CommentForList } from '@customTypes/CommentForList';
import React, { useMemo, useState } from 'react';
import useCommentForm from '@hooks/ReactQueryHook/comment/useCommentForm';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { useI18n } from '@i18n/context';

type CommentListProps = {
  comments: CommentForList[];
  isLoading: boolean;
  noCommentsMessage?: string;
};

/** Inline reply box under a comment. */
const ReplyBox = ({
  parent,
  onDone,
}: {
  parent: CommentForList;
  onDone: () => void;
}) => {
  const { register, handleSubmit, errors, submitComment, isSubmitting } =
    useCommentForm({
      courseId: parent.courseId,
      parentId: parent.id,
      onPosted: onDone,
    });
  const id = `reply-${parent.id}`;
  const { t } = useI18n();
  return (
    <form
      onSubmit={handleSubmit(submitComment)}
      className="flex flex-col gap-2"
      noValidate
    >
      <label htmlFor={id} className="sr-only">
        {t('comments.replyLabel')}
      </label>
      <Textarea
        id={id}
        dir="auto"
        rows={2}
        autoFocus
        placeholder={t('comments.replyPh')}
        maxLength={4000}
        {...register('comment', {
          validate: (v) => v.trim().length >= 2 || t('comments.replyShort'),
        })}
      />
      {errors.comment && (
        <p role="alert" className="text-sm text-red-500">
          {errors.comment.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          color="alternative"
          type="button"
          onClick={onDone}
          className="cursor-pointer"
        >
          {t('common.cancel')}
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? t('comments.posting') : t('comments.reply')}
        </Button>
      </div>
    </form>
  );
};

const CommentList = ({
  comments,
  isLoading,
  noCommentsMessage,
}: CommentListProps) => {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // Top-level comments keep the API order (newest first); replies read oldest first.
  const { topLevel, repliesByParent } = useMemo(() => {
    const ids = new Set(comments.map((c) => c.id));
    const replies = new Map<number, CommentForList[]>();
    const top: CommentForList[] = [];
    for (const c of comments) {
      // A reply whose parent is missing is shown as a normal comment rather than lost.
      if (c.parentId && ids.has(c.parentId)) {
        replies.set(c.parentId, [...(replies.get(c.parentId) ?? []), c]);
      } else {
        top.push(c);
      }
    }
    for (const list of replies.values()) {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    return { topLevel: top, repliesByParent: replies };
  }, [comments]);

  return (
    <div className="space-y-4">
      {topLevel.map((comment) => {
        const replies = repliesByParent.get(comment.id) ?? [];
        return (
          <div key={comment.id} className="space-y-2">
            <CommentCard
              comment={comment}
              onReply={
                isAuthenticated ? () => setReplyingTo(comment.id) : undefined
              }
            />
            {(replies.length > 0 || replyingTo === comment.id) && (
              <div className="ms-6 space-y-2 border-s-2 border-neutral-800 ps-3">
                {replies.map((reply) => (
                  <CommentCard key={reply.id} comment={reply} isReply />
                ))}
                {replyingTo === comment.id && (
                  <ReplyBox
                    parent={comment}
                    onDone={() => setReplyingTo(null)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && comments.length === 0 && (
        <p className="py-6 text-center text-sm text-neutral-400">
          {noCommentsMessage ?? t('comments.empty')}
        </p>
      )}
    </div>
  );
};

export default React.memo(CommentList);
