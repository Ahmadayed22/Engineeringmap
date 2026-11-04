import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { EditCommentProps, FormEdit } from '@customTypes/CommentSection';
import toast from 'react-hot-toast';
import { ErrorToast, SuccessToast } from '@components/common';
import { useI18n } from '@i18n/context';
const useEditComment = ({ comment, setOpenEdit }: EditCommentProps) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

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
    const res = await axios.put(`/api/comments/${comment.id}`, { content });
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
      toast.success(t('comments.updated'), {
        icon: '',
        style: SuccessToast,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: () => {
      toast.error(t('comments.updateFailed'), {
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
