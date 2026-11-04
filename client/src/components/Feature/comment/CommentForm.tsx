import useCommentForm from '@hooks/ReactQueryHook/comment/useCommentForm';
import { Button, Spinner, Textarea } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@i18n/context';

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
  const { t } = useI18n();

  if (!accessToken) {
    return (
      <div className="w-full border-t border-neutral-800 p-4 text-center">
        <p className="mb-3 text-sm text-neutral-400">
          {t('comments.signInPrompt')}
        </p>
        <Button as={Link} to="/login" className="w-full cursor-pointer">
          {t('comments.signInBtn')}
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
        {t('comments.label')}
      </label>
      <Textarea
        id="comment"
        dir="auto"
        placeholder={t('comments.placeholder')}
        rows={2}
        maxLength={MAX_LENGTH}
        aria-invalid={!!errors.comment}
        aria-describedby={errors.comment ? 'comment-error' : undefined}
        {...register('comment', {
          required: t('comments.required'),
          validate: (value) =>
            value.trim().length >= 2 || t('comments.tooShort'),
          maxLength: {
            value: MAX_LENGTH,
            message: t('comments.tooLong', { n: MAX_LENGTH }),
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
            {t('comments.posting')}
          </>
        ) : (
          t('comments.post')
        )}
      </Button>
    </form>
  );
};

export default CommentForm;
