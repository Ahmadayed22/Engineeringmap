import { EditCommentProps } from '@customTypes/CommentSection';
import useEditComment from '@hooks/ReactQueryHook/comment/useEditComment';
import { Button, Textarea } from 'flowbite-react';
import { useI18n } from '@i18n/context';

const EditComment = ({ comment, setOpenEdit }: EditCommentProps) => {
  const { register, handleSubmit, error, errors, onSubmit, mutation } =
    useEditComment({
      comment,
      setOpenEdit,
    });
  const { t } = useI18n();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="my-4 w-full">
      <div className="mb-4">
        <Textarea
          dir="auto"
          id="comment"
          rows={Math.max(1, comment.content.split('\n').length)}
          defaultValue={comment.content}
          {...register('comment', { required: t('comments.required') })}
        />
        {errors.comment && (
          <p className="text-red-500 text-sm">{errors.comment.message}</p>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex gap-2">
        <Button
          className="cursor-pointer"
          type="button"
          color={'alternative'}
          onClick={() => setOpenEdit(false)}
        >
          {t('common.cancel')}
        </Button>
        <Button
          className="cursor-pointer "
          type="submit"
          disabled={mutation.isPending}
        >
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default EditComment;
