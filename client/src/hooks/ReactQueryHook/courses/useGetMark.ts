import { useAuth } from '@hooks/CustomHook/useAuth';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useGetMark = () => {
  const { accessToken } = useAuth();
  const getMarkCourses = async (): Promise<number[]> => {
    const response = await axios.get('/api/courses/user/mark', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  };

  const { data: marks } = useQuery({
    queryKey: ['mark'],
    queryFn: getMarkCourses,
    enabled: !!accessToken,
  });
  return { marks };
};

export default useGetMark;
