import useCommentSection from '@hooks/CustomHook/useCommentSection';
import { useAppSelector } from '@store/reduxHooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Textarea } from 'flowbite-react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface CommentInput {
  comment: string;
}

interface CreateCommentProps {
  content: string;
  courseId: number;
}

interface CommentFormProps {
  courseId: number; // Add courseId as a prop
}

const CommentForm = ({ courseId }: CommentFormProps) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAppSelector((state) => state.auth);
  const { comments, commentCount } = useCommentSection();

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
  console.log('Comments:', comments);

  const createComment = async ({ content, courseId }: CreateCommentProps) => {
    console.log('Sending POST request:', {
      content,
      courseId,
      accessToken,
    });

    const res = await axios.post(
      '/api/comments',
      {
        courseId: 1,
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
        queryKey: ['comments', courseId], // Use courseId prop
      });
      reset();
      console.log('Comment created successfully');
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });

  const submitComment: SubmitHandler<CommentInput> = (data) => {
    if (!accessToken) {
      console.error('No access token available');
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

  return (
    <form
      onSubmit={handleSubmit(submitComment)}
      className="p-4 border-t w-full"
    >
      {accessToken ? (
        <>
          <div className="mb-4">
            <Textarea
              id="comment"
              placeholder="Write Comment..."
              rows={2}
              {...register('comment', {
                required: 'Comment is required',
                minLength: {
                  value: 2,
                  message: 'Comment must be at least 2 characters',
                },
              })}
            />
          </div>
          {errors.comment && (
            <p className="text-red-600 text-sm mt-1">
              {errors.comment.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full"
          >
            {mutation.isLoading ? 'Submitting...' : 'Comment'}
          </Button>
        </>
      ) : (
        <>
          <div className="mb-4 text-sm text-center text-red-600 font-medium">
            You must be logged in to comment.
          </div>
          <Button disabled type="button" className="w-full cursor-not-allowed">
            Login to Comment
          </Button>
        </>
      )}
    </form>
  );
};

export default CommentForm;
