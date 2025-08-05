// import useCommentSection from '@hooks/CustomHook/useCommentSection';

import useCommentForm from '@hooks/ReactQueryHook/useCommentForm';
import { Button, Textarea } from 'flowbite-react';

interface CommentFormProps {
  courseId: number | unknown | null;
}

const CommentForm = ({ courseId }: CommentFormProps) => {
  const { register, handleSubmit, errors, submitComment, accessToken } =
    useCommentForm({ courseId });

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
            // disabled={mutation.isLoading}
            className="w-full cursor-pointer"
          >
            {/* {mutation.isLoading ? 'Submitting...' : 'Comment'} */}
            Comment
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
