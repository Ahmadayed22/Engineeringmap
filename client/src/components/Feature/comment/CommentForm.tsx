import useCommentForm from '@hooks/ReactQueryHook/comment/useCommentForm';
import { Button, Spinner, Textarea } from 'flowbite-react';
import { Link } from 'react-router-dom';

interface CommentFormProps {
  courseId: number | unknown | null;
}

const MAX_LENGTH = 4000; // matches the API limit

const CommentForm = ({ courseId }: CommentFormProps) => {
  const {
    register,
    handleSubmit,
    errors,
    submitComment,
    accessToken,
    isSubmitting,
  } = useCommentForm({ courseId });

  if (!accessToken) {
    return (
      <div className="w-full border-t border-neutral-800 p-4 text-center">
        <p className="mb-3 text-sm text-neutral-400">
          Sign in to join the discussion about this course.
        </p>
        <Button as={Link} to="/login" className="w-full cursor-pointer">
          Sign in to comment
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submitComment)}
      className="w-full border-t border-neutral-800 p-4"
      noValidate
    >
      <label htmlFor="comment" className="sr-only">
        Your comment
      </label>
      <Textarea
        id="comment"
        dir="auto"
        placeholder="Share a tip, question or experience…"
        rows={2}
        maxLength={MAX_LENGTH}
        aria-invalid={!!errors.comment}
        aria-describedby={errors.comment ? 'comment-error' : undefined}
        {...register('comment', {
          required: 'Comment is required',
          validate: (value) =>
            value.trim().length >= 2 || 'Comment must be at least 2 characters',
          maxLength: {
            value: MAX_LENGTH,
            message: `Comment cannot exceed ${MAX_LENGTH} characters`,
          },
        })}
      />
      {errors.comment && (
        <p
          id="comment-error"
          role="alert"
          className="mt-1 text-sm text-red-500"
        >
          {errors.comment.message}
        </p>
      )}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 w-full cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="me-2" aria-hidden="true" />
            Posting…
          </>
        ) : (
          'Post comment'
        )}
      </Button>
    </form>
  );
};

export default CommentForm;
