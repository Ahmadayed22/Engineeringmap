import { useQuery } from '@tanstack/react-query';
import useGetCourses from './useGetCourses';
import { useAppSelector } from '@store/reduxHooks';
export const courseQueryKeys = {
  all: ['courses'] as const,
  lists: () => [...courseQueryKeys.all, 'list'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: (filters: Record<string, any>) =>
    [...courseQueryKeys.lists(), { filters }] as const,
  details: () => [...courseQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...courseQueryKeys.details(), id] as const,
  completed: () => [...courseQueryKeys.all, 'completed'] as const,
} as const;

const useCourseQueries = () => {
  const { getCompletedCourses, getAllCourses, getCourseById } = useGetCourses();
  const { accessToken } = useAppSelector((state) => state.auth);
  const useCoursesQuery = () => {
    return useQuery({
      queryKey: courseQueryKeys.lists(),
      queryFn: getAllCourses,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!accessToken,
      retry: 1,
    });
  };
  const useCourseQuery = (courseId: number) => {
    return useQuery({
      queryKey: courseQueryKeys.detail(courseId),
      queryFn: () => getCourseById(courseId),
      enabled: !!courseId && !!accessToken,
      staleTime: 5 * 60 * 1000,
    });
  };
  const useCompletedCoursesQuery = () => {
    return useQuery({
      queryKey: courseQueryKeys.completed(),
      queryFn: getCompletedCourses,
      staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for user progress
      gcTime: 5 * 60 * 1000,
      enabled: !!accessToken,
    });
  };
  return {
    useCoursesQuery,
    useCourseQuery,
    useCompletedCoursesQuery,
  };
};

export default useCourseQueries;
