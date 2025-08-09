import { useAppSelector } from '@store/reduxHooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';

interface CommentInput {
  comment: string;
}

interface CreateCommentProps {
  content: string;
  courseId: number | unknown | null;
}

interface CommentFormProps {
  courseId: number | unknown | null;
}

const useCommentForm = ({ courseId }: CommentFormProps) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAppSelector((state) => state.auth);
  // const { comments, commentCount } = useCommentSection();

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

  // Optional: Log comments for debugging
  // console.log('Comments:', comments);
  //   console.log('courseId:', courseId);
  const createComment = async ({ content, courseId }: CreateCommentProps) => {
    const res = await axios.post(
      '/api/comments',
      {
        courseId,
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.data;
  };

  const mutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['CourseByCourseId', courseId],
      });
      reset();
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });

  const submitComment: SubmitHandler<CommentInput> = (data) => {
    if (!accessToken) {
      // console.error('No access token available');
      return;
    }

    // if (!courseId) {
    //   console.error('Course ID is not available');
    //   return;
    // }

    mutation.mutate({
      content: data.comment,
      courseId, // Use courseId prop
    });
  };
  return { register, handleSubmit, errors, submitComment, accessToken };
};

export default useCommentForm;
