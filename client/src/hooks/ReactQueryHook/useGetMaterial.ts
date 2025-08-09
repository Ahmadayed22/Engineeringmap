import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import { useAppSelector } from '@store/reduxHooks';
import { Material } from '@customTypes/Material';

const useGetMaterial = () => {
  const { courseId } = useTreeFlowContext();
  const { accessToken } = useAppSelector((state) => state.auth);

  return useQuery<Material[], Error>({
    queryKey: ['resource', courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/resource/course/${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    },
    enabled: !!courseId && !!accessToken,
    retry: 1,
  });
};
export default useGetMaterial;
