import CommentSectionProps from '@customTypes/CommentSection';
import CommentList from './CommentList';

import useCommentSection from '@hooks/ReactQueryHook/comment/useCommentSection';
import React from 'react';

const CommentSection = ({ nodeName, courseId }: CommentSectionProps) => {
  const {
    commentCount,
    comments,
    isCommentsLoading,
    countError,
    commentsError,
    isCountLoading,
  } = useCommentSection({ nodeName, courseId });

  if (isCountLoading || isCommentsLoading) return <div>Loading...</div>;
  if (countError) return <div>Error: {countError.message}</div>;
  if (commentsError) return <div>Error: {commentsError.message}</div>;
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Comments ({commentCount})</h3>

      <CommentList comments={comments ?? []} isLoading={isCommentsLoading} />
    </div>
  );
};

export default React.memo(CommentSection);
