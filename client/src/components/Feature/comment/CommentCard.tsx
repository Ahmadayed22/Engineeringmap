import ModalDelete from '@components/common/Modal/ModalDelete';
import {
  CommentCardContentProps,
  CommentCardHeaderProps,
  CommentCardProps,
} from '@customTypes/CommentSection';
import UseCommentDelete from '@hooks/ReactQueryHook/comment/UseCommentDelete';
import useGetUserName from '@hooks/ReactQueryHook/material/useGetUserName';
import React, { useState } from 'react';
import EditComment from './EditComment';
import { useAuth } from '@hooks/CustomHook/useAuth';

const CommentCard = ({ comment }: CommentCardProps) => {
  const { username } = useGetUserName({ comment });
  const [openEdit, setOpenEdit] = useState(false);
  return (
    <article className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
      <CommentCardHeader username={username} comment={comment} />
      <CommentCardContent comment={comment} openEdit={openEdit} />
      <CommentCardButtons
        comment={comment}
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
      />
    </article>
  );
};

function CommentCardHeader({ username, comment }: CommentCardHeaderProps) {
  return (
    <header className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-sm font-semibold uppercase text-blue-300"
      >
        {username?.charAt(0) ?? '?'}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-neutral-100">
          {username ?? 'Student'}
        </span>
        <time dateTime={comment.createdAt} className="text-xs text-neutral-500">
          {new Date(comment.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
          {comment.updatedAt && comment.updatedAt !== comment.createdAt
            ? ' · edited'
            : ''}
        </time>
      </div>
    </header>
  );
}

type CommentCardContent = {
  openEdit: boolean;
} & CommentCardContentProps;

function CommentCardContent({ comment, openEdit }: CommentCardContent) {
  return (
    <>
      {!openEdit && (
        <p
          dir="auto"
          className="whitespace-pre-line break-words text-sm leading-relaxed text-neutral-200"
        >
          {comment.content}
        </p>
      )}
    </>
  );
}
type CommentCardButtons = {
  setOpenEdit: (value: boolean) => void;
} & CommentCardContent;

function CommentCardButtons({
  comment,
  openEdit,
  setOpenEdit,
}: CommentCardButtons) {
  const { openModal, setOpenModal, mutation } = UseCommentDelete({ comment });

  const { isAdmin, userInfo } = useAuth();

  const isOwnComment = comment.userId === userInfo?.id;
  return (
    <div className="flex justify-start">
      {!openEdit && (isOwnComment || isAdmin) && (
        <div className="flex items-center gap-1">
          {isOwnComment && (
            <button
              type="button"
              className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-500"
              onClick={() => setOpenEdit(true)}
            >
              Edit
            </button>
          )}
          <button
            type="button"
            className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/60 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-red-500"
            onClick={() => setOpenModal(true)}
          >
            Delete
          </button>
        </div>
      )}

      {openEdit && <EditComment comment={comment} setOpenEdit={setOpenEdit} />}

      <ModalDelete
        openModal={openModal}
        setOpenModal={setOpenModal}
        onDelete={mutation.mutate}
      />
    </div>
  );
}

export default React.memo(CommentCard);
