import { ErrorToast, SuccessToast } from '@components/common';
import { useAppSelector } from '@store/reduxHooks';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { CommentCardContentProps } from '@customTypes/CommentSection';

const UseCommentDelete = ({ comment }: CommentCardContentProps) => {
  const [openModal, setOpenModal] = useState(false);

  const { accessToken } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const DeleteComment = async () => {
    try {
      const res = await axios.delete(
        `/api/comments/${comment.id}?userId=${comment.userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Delete Comment Succes');
    }
  };

  const mutation = useMutation({
    mutationFn: DeleteComment,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ['CourseByCourseId', comment.courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['commentsCount', comment.courseId],
      });
      setOpenModal(false);
      toast.success('Comment deleted successfully!', {
        icon: '🗑️',
        style: SuccessToast,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (error) => {
      toast.error(`Failed to delete comment. Please try again.`, {
        icon: '❌',
        style: ErrorToast,
      });
    },
  });
  return { openModal, setOpenModal, mutation };
};

export default UseCommentDelete;
