import { useQuery } from '@tanstack/react-query';
import CommentList from './CommentList';
import axios from 'axios';

type CommentSectionProps = {
  nodeName: string | null;
};
const CommentSection = ({ nodeName }: CommentSectionProps) => {
  const getCommentCount = async () => {
    try {
      const res = await axios.get('/api/comments/course/1/count');

      return res.data;
    } catch (error) {
      throw new Error(`Failed to fetch comment count , ${error}`);
    }
  };
  const getCourseByName = async () => {
    try {
      const res = await axios.get(`/api/comments/course/name/${nodeName}`);
      console.log(res.data);
      return res.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(`Failed to fetch course Comment`);
    }
  };
  const {
    data: commentCount,
    isLoading: isCountLoading,
    error: countError,
  } = useQuery({
    queryKey: ['commentsCount'],
    queryFn: getCommentCount,
  });

  const {
    data: comments,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['courseByName', nodeName],
    queryFn: getCourseByName,
    enabled: !!nodeName,
  });
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

export default CommentSection;
