import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormData, materialSchema } from '@validation/materialSchema';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MaterialModalProps } from '@components/common/Modal/MaterialModal';
import toast from 'react-hot-toast';

const useMaterial = ({ setOpenModal }: MaterialModalProps) => {
  const { courseId } = useTreeFlowContext();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    mode: 'onBlur',
    resolver: zodResolver(materialSchema),
  });

  const submitMaterial: SubmitHandler<FormData> = async (data) => {
    try {
      const payload = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(data).filter(([_, value]) => value !== '')
      );
      await axios.post(`/api/resource/course/${courseId}`, {
        ...payload,
        courseId,
      });

      await queryClient.invalidateQueries({
        queryKey: ['resource', courseId],
      });
      setOpenModal(false);
      reset();
      toast.success('Material added successfully');
    } catch (error) {
      console.error('Error submitting material:', error);
      toast.error('Failed to add material');
      throw error;
    }
  };
  const onCloseModal = () => {
    setOpenModal(false);
    reset(); // Clear form on close
  };
  return { register, handleSubmit, errors, submitMaterial, onCloseModal };
};

export default useMaterial;
