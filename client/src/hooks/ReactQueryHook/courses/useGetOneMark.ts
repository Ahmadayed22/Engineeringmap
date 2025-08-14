import { useAuth } from '@hooks/CustomHook/useAuth';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useGetOneMark = (courseId: number | null) => {
  const { accessToken } = useAuth();

  const getMarkCourses = async (): Promise<string> => {
    if (!courseId) throw new Error('No course ID provided');

    const response = await axios.get(`/api/courses/${courseId}/mark`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  };

  const {
    data: oneMark,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['oneMark', courseId],
    queryFn: getMarkCourses,
    enabled: !!accessToken && !!courseId,
    retry: false,
    staleTime: 5000,
  });

  return { oneMark, isLoading, error };
};

export default useGetOneMark;
