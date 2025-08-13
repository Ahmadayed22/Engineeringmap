import { useMutation, useQueryClient } from '@tanstack/react-query';
import useGetCourses from './useGetCourses';
import { courseQueryKeys } from './useCourseQueries';

const useMutationCompleteCourse = () => {
  const { completeCourse } = useGetCourses();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      completed,
    }: {
      courseId: number;
      completed: boolean;
    }) => {
      await completeCourse({ courseId, completed });
      return { courseId, completed };
    },
    onMutate: async ({ courseId, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: courseQueryKeys.completed(),
      });

      // Snapshot the previous value
      const previousCompleted = queryClient.getQueryData<number[]>(
        courseQueryKeys.completed()
      );

      // Optimistically update
      queryClient.setQueryData<number[]>(
        courseQueryKeys.completed(),
        (old = []) => {
          if (completed) {
            return [...old, courseId];
          } else {
            return old.filter((id) => id !== courseId);
          }
        }
      );

      // Return context with previous and new data
      return { previousCompleted };
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousCompleted) {
        queryClient.setQueryData(
          courseQueryKeys.completed(),
          context.previousCompleted
        );
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.completed(),
      });
    },
  });
};

export default useMutationCompleteCourse;
