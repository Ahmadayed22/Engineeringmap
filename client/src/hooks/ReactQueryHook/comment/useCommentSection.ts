import { useTreeFlowContext } from '@context/TreeFlowContext';
// import CommentSectionProps from '@customTypes/CommentSection';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useCommentSection = () => {
  const { courseId } = useTreeFlowContext();
  const getCommentCount = async () => {
    try {
      const res = await axios.get(`/api/comments/course/${courseId}/count`);

      return res.data;
    } catch (error) {
      throw new Error(`Failed to fetch comment count , ${error}`);
    }
  };

  const getCommentCourseByCourseId = async () => {
    try {
      const res = await axios.get(`/api/comments/course/${courseId}`);

      return res.data;
    } catch (error) {
      throw new Error(`Failed to fetch course Comment, ${error}`);
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
    queryFn: getCommentCourseByCourseId,
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
