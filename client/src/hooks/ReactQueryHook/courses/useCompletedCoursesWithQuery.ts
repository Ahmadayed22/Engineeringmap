import { useMemo } from 'react';
import useCourseQueries from './useCourseQueries';
import useTrackingCompleteCourse from './useTrackingCompleteCourse';

const useCompletedCoursesWithQuery = () => {
  const { useCompletedCoursesQuery } = useCourseQueries();
  const {
    data: completedCoursesArray = [],
    isLoading,
    error,
    refetch,
  } = useCompletedCoursesQuery();

  const completionMutation = useTrackingCompleteCourse();

  // Convert array to Set for easy lookup
  const completedCourses = useMemo(
    () => new Set(completedCoursesArray),
    [completedCoursesArray]
  );

  // Toggle course completion
  const toggleCourseCompletion = async (courseId: number) => {
    const isCurrentlyCompleted = completedCourses.has(courseId);
    const newCompletionStatus = !isCurrentlyCompleted;

    try {
      await completionMutation.mutateAsync({
        courseId,
        completed: newCompletionStatus,
      });
    } catch (error) {
      console.error('Failed to update course completion:', error);
      // Error handling is done in the mutation's onError
    }
  };

  return {
    completedCourses,
    loading: isLoading,
    error: error?.message || null,
    toggleCourseCompletion,
    refreshCompletedCourses: refetch,
    isMutating: completionMutation.isPending,
    mutationError: completionMutation.error,
  };
};

export default useCompletedCoursesWithQuery;
