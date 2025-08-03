import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useCommentSection = (nodeName?: string | null) => {
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
      const res = await axios.get(
        `/api/comments/course/name/Data%20Structures`
      );

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
    // enabled: !!nodeName,
  });

  return {
    commentCount,
    comments,
    isCommentsLoading,
    countError,
    commentsError,
    isCountLoading,
  };
};

export default useCommentSection;
