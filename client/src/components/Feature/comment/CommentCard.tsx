import ModalDelete from '@components/common/Modal/ModalDelete';
import {
  CommentCardContentProps,
  CommentCardHeaderProps,
  CommentCardProps,
} from '@customTypes/CommentSection';
import UseCommentDelete from '@hooks/ReactQueryHook/UseCommentDelete';
import useGetUserName from '@hooks/ReactQueryHook/useGetUserName';

const CommentCard = ({ comment }: CommentCardProps) => {
  const { username } = useGetUserName({ comment });
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
        · {new Date(comment.createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}

function CommentCardContent({ comment }: CommentCardContentProps) {
  return <p>{comment.content}</p>;
}

function CommentCardButtons({ comment }: CommentCardContentProps) {
  const { openModal, setOpenModal, mutation } = UseCommentDelete({ comment });
  return (
    <div className="">
      <button className="cursor-pointer">Edit</button>
      <button
        className="text-red-800 cursor-pointer 
        p-4"
        onClick={() => setOpenModal(true)}
      >
        Delete
      </button>
      <ModalDelete
        openModal={openModal}
        setOpenModal={setOpenModal}
        onDelete={mutation.mutate}
      />
    </div>
  );
}

export default CommentCard;
