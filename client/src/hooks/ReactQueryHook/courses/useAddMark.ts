import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useI18n } from '@i18n/context';

type FormData = {
  mark: string;
};

interface UseAddMarkProps {
  courseId: number | unknown | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const useAddMark = ({ courseId, onSuccess, onError }: UseAddMarkProps) => {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const form = useForm<FormData>({
    defaultValues: {
      mark: '',
    },
  });

  const addMark = async (data: FormData): Promise<void> => {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    await axios.post(`/api/courses/${courseId}/mark`, data);
  };

  const mutation = useMutation<void, Error, FormData>({
    mutationFn: addMark,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['allUserMarks'],
      });
      queryClient.invalidateQueries({
        queryKey: ['oneMark', courseId],
      });

      toast.success(t('grade.added'));
      form.reset(); // Reset form after successful submission

      // Call custom success handler if provided
      onSuccess?.();
    },
    onError: (error) => {
      const errorMessage =
        error.message === 'Course ID is required'
          ? t('grade.noCourse')
          : t('grade.failed');

      toast.error(errorMessage);

      // Call custom error handler if provided
      onError?.(error);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!data.mark) {
      toast.error(t('grade.required'));
      return;
    }
    mutation.mutate(data);
  });

  const markOptions = [
    { value: '', label: t('grade.select'), disabled: true },
    { value: 'A', label: 'A' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B', label: 'B' },
    { value: 'B-', label: 'B-' },
    { value: 'C+', label: 'C+' },
    { value: 'C', label: 'C' },
    { value: 'C-', label: 'C-' },
    { value: 'D+', label: 'D+' },
    { value: 'D', label: 'D' },
    { value: 'D-', label: 'D-' },
    { value: 'F', label: 'F' },
  ];

  return {
    // Form methods
    register: form.register,
    handleSubmit,
    formState: form.formState,
    reset: form.reset,
    watch: form.watch,

    // Mutation state
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,

    // Computed values
    isDisabled: mutation.isPending || !courseId,
    buttonText: mutation.isPending ? t('grade.adding') : t('grade.add'),

    // Data
    markOptions,

    // Validation rules
    validationRules: {
      mark: {
        required: t('grade.required'),
        validate: (value: string) => value !== '' || t('grade.required'),
      },
    },
  };
};

export default useAddMark;
