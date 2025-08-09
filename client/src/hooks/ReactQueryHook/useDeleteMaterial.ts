import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import toast from 'react-hot-toast';
import { useGetMaterial } from '@hooks/index';
import { useAppSelector } from '@store/reduxHooks';

const useDeleteMaterial = () => {
  const { courseId } = useTreeFlowContext();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetMaterial();
  const { accessToken, userInfo } = useAppSelector((state) => state.auth);

  const deleteMaterial = useMutation({
    mutationFn: (materialId: number) =>
      axios.delete(`/api/resource/${materialId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', courseId] });
      toast.success('Material deleted successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message =
        error.response?.status === 403
          ? 'You are not authorized to delete this material'
          : error.response?.status === 404
            ? 'Material not found'
            : 'Failed to delete material';
      toast.error(message);
    },
  });

  return {
    data,
    isLoading,
    isError,
    courseId,
    deleteMaterial,
    userId: userInfo?.id,
  };
};

export default useDeleteMaterial;
