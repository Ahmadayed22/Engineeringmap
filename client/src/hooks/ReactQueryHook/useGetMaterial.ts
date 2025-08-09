import { useTreeFlowContext } from '@context/TreeFlowContext';
import axios from 'axios';

import { useQuery } from '@tanstack/react-query';
const useGetMaterial = () => {
  const { courseId } = useTreeFlowContext();

  const getMaterial = async () => {
    try {
      const response = await axios.get(`/api/resource/course/${courseId}`);
      console.log('Material fetched:', response.data, courseId);
      return response.data;
    } catch (error) {
      console.error('Error fetching material:', error);
      throw error;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['resource', courseId],
    queryFn: getMaterial,
    enabled: !!courseId, // Only run the query if courseId is available
  });
  return { data, isLoading, isError, courseId };
};

export default useGetMaterial;
