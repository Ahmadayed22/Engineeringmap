import { useAppSelector } from '@store/reduxHooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { EditCommentProps, FormEdit } from '@customTypes/CommentSection';
import toast from 'react-hot-toast';
import { ErrorToast, SuccessToast } from '@components/common';
const useEditComment = ({ comment, setOpenEdit }: EditCommentProps) => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormEdit>({
    defaultValues: {
      comment: comment.content,
    },
  });

  const updateComment = async ({ content }: { content: string }) => {
    const res = await axios.put(
      `/api/comments/${comment.id}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['CourseByCourseId', comment.courseId],
      });

      setOpenEdit(false);
      setError(null);
      toast.success('Comment updated successfully!', {
        icon: '',
        style: SuccessToast,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: () => {
      toast.error(`Failed to Update comment. ${mutation.error?.message}`, {
        icon: '❌',
        style: ErrorToast,
      });
    },
  });

  const onSubmit = (data: FormEdit) => {
    mutation.mutate({ content: data.comment });
  };
  return { register, handleSubmit, error, errors, onSubmit, mutation };
};

export default useEditComment;
