import ModalDelete from '@components/common/Modal/ModalDelete';
import {
  CommentCardContentProps,
  CommentCardHeaderProps,
  CommentCardProps,
} from '@customTypes/CommentSection';
import UseCommentDelete from '@hooks/ReactQueryHook/UseCommentDelete';
import useGetUserName from '@hooks/ReactQueryHook/useGetUserName';
import { useState } from 'react';
import EditComment from './EditComment';
import { useAppSelector } from '@store/reduxHooks';

const CommentCard = ({ comment }: CommentCardProps) => {
  const { username } = useGetUserName({ comment });
  console.log(comment);
  return (
    <div className="space-y-4 rounded-lg border-2 border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900 ">
      <CommentCardHeader username={username} comment={comment} />
      <CommentCardContent comment={comment} />
      <CommentCardButtons comment={comment} />
    </div>
  );
};

function CommentCardHeader({ username, comment }: CommentCardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <div>{username}</div>
      <time className="text-sm text-neutral-500">
        {new Date(comment.createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}

function CommentCardContent({ comment }: CommentCardContentProps) {
  return <p>{comment.content}</p>;
}

function CommentCardButtons({ comment }: CommentCardContentProps) {
  const { openModal, setOpenModal, mutation } = UseCommentDelete({ comment });
  const [openEdit, setOpenEdit] = useState(false);
  const { userInfo } = useAppSelector((state) => state.auth); // Get current user's ID

  const isOwnComment = comment.userId === userInfo?.id;
  return (
    <div className="">
      {!openEdit && isOwnComment && (
        <>
          <button className="cursor-pointer" onClick={() => setOpenEdit(true)}>
            Edit
          </button>
          <button
            className="text-red-800 cursor-pointer 
        p-4"
            onClick={() => setOpenModal(true)}
          >
            Delete
          </button>
        </>
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

export default CommentCard;
