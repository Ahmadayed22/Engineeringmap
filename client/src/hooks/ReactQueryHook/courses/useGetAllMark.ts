import { useAuth } from '@hooks/CustomHook/useAuth';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useGetAllMark = () => {
  const { accessToken } = useAuth();

  const getAllMarks = async (): Promise<Record<number, string>> => {
    const response = await axios.get('/api/courses/user/marks/batch', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  };

  const {
    data: allMarks = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ['allUserMarks'],
    queryFn: getAllMarks,
    enabled: !!accessToken,
    staleTime: 3000,
  });

  return { allMarks, isLoading, error };
};

export default useGetAllMark;
