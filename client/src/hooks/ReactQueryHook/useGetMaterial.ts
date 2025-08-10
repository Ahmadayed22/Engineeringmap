import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTreeFlowContext } from '@context/TreeFlowContext';

import { Material } from '@customTypes/Material';

const useGetMaterial = () => {
  const { courseId } = useTreeFlowContext();

  return useQuery<Material[], Error>({
    queryKey: ['resource', courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/resource/course/${courseId}`, {});

      return response.data;
    },
    enabled: !!courseId,
    retry: 1,
  });
};
export default useGetMaterial;
