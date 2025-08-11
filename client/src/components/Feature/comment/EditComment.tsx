import { EditCommentProps } from '@customTypes/CommentSection';
import useEditComment from '@hooks/ReactQueryHook/comment/useEditComment';
import { Button, Textarea } from 'flowbite-react';

const EditComment = ({ comment, setOpenEdit }: EditCommentProps) => {
  const { register, handleSubmit, error, errors, onSubmit, mutation } =
    useEditComment({
      comment,
      setOpenEdit,
    });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="my-4">
      <div className="mb-4">
        <Textarea
          id="comment"
          rows={2}
          {...register('comment', { required: 'Comment is required' })}
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
          onClick={() => setOpenEdit(false)}
        >
          Close
        </Button>
        <Button
          className="cursor-pointer"
          type="submit"
          disabled={mutation.isPending}
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default EditComment;
