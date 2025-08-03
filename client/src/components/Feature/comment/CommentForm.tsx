import { useAppSelector } from '@store/reduxHooks';
import { Button, Textarea } from 'flowbite-react';
import React from 'react';

const CommentForm = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!accessToken) return;
      }}
      className="p-4 border-t w-full"
    >
      {accessToken ? (
        <>
          <div className="mb-4">
            <Textarea
              id="message"
              name="message"
              placeholder="Write Comment..."
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full">
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
