import { useAuth } from '@hooks/CustomHook/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AxiosErrorHandler } from '@util/index';

interface CommentInput {
  comment: string;
}

interface CreateCommentProps {
  content: string;
  courseId: number | unknown | null;
  parentId?: number;
}

interface CommentFormProps {
  courseId: number | unknown | null;
  /** When set, the form posts a reply to this comment. */
  parentId?: number;
  /** Called after a successful post (e.g. to close an inline reply box). */
  onPosted?: () => void;
}

const useCommentForm = ({ courseId, parentId, onPosted }: CommentFormProps) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    defaultValues: {
      comment: '',
    },
  });

  const createComment = async ({
    content,
    courseId,
    parentId,
  }: CreateCommentProps) => {
    const res = await axios.post('/api/comments', {
      courseId,
      content,
      parentId,
    });

    return res.data;
  };

  const mutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      // Invalidate both the comments and comment count queries
      queryClient.invalidateQueries({
        queryKey: ['CourseByCourseId', courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['commentsCount', courseId],
      });
      reset();
      onPosted?.();
    },
    onError: (error) => {
      toast.error(AxiosErrorHandler(error) || 'Could not post your comment.');
    },
  });

  const submitComment: SubmitHandler<CommentInput> = (data) => {
    if (!accessToken || mutation.isPending) return;

    mutation.mutate({
      content: data.comment.trim(),
      courseId,
      parentId,
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    submitComment,
    accessToken,
    isSubmitting: mutation.isPending,
  };
};

export default useCommentForm;
