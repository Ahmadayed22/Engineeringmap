import CommentSectionProps from '@customTypes/CommentSection';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useCommentSection = ({ nodeName, courseId }: CommentSectionProps) => {
  const getCommentCount = async () => {
    try {
      const res = await axios.get(`/api/comments/course/${courseId}/count`);

      return res.data;
    } catch (error) {
      throw new Error(`Failed to fetch comment count , ${error}`);
    }
  };

  const getCourseByCourseId = async () => {
    try {
      const res = await axios.get(`/api/comments/course/${courseId}`);

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
    queryKey: ['commentsCount', courseId],
    queryFn: getCommentCount,
    enabled: !!courseId,
  });

  const {
    data: comments,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['CourseByCourseId', courseId],
    queryFn: getCourseByCourseId,
    enabled: !!courseId,
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
