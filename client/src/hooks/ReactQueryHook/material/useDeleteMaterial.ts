import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import toast from 'react-hot-toast';
import { useGetMaterial } from '@hooks/index';
import { useAppSelector } from '@store/reduxHooks';
import { useI18n } from '@i18n/context';

const useDeleteMaterial = () => {
  const { courseId } = useTreeFlowContext();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { data, isLoading, isError } = useGetMaterial();
  const { userInfo } = useAppSelector((state) => state.auth);

  const deleteMaterial = useMutation({
    mutationFn: (materialId: number) =>
      axios.delete(`/api/resource/${materialId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', courseId] });
      toast.success(t('mat.deleted'));
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message =
        error.response?.status === 403
          ? t('mat.deleteForbidden')
          : error.response?.status === 404
            ? t('mat.notFound')
            : t('mat.deleteFailed');
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
