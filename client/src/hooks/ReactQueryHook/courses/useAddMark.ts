import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@hooks/CustomHook/useAuth';
import toast from 'react-hot-toast';

type FormData = {
  mark: string;
};

interface UseAddMarkProps {
  courseId: number | unknown | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const useAddMark = ({ courseId, onSuccess, onError }: UseAddMarkProps) => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    defaultValues: {
      mark: '',
    },
  });

  const addMark = async (data: FormData): Promise<void> => {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    await axios.post(`/api/courses/${courseId}/mark`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
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

      toast.success('Mark has been added successfully!');
      form.reset(); // Reset form after successful submission

      // Call custom success handler if provided
      onSuccess?.();
    },
    onError: (error) => {
      const errorMessage =
        error.message === 'Course ID is required'
          ? 'Please select a valid course'
          : 'Failed to add mark. Please try again.';

      toast.error(errorMessage);

      // Call custom error handler if provided
      onError?.(error);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!data.mark) {
      toast.error('Please select a mark');
      return;
    }
    mutation.mutate(data);
  });

  const markOptions = [
    { value: '', label: '-- Select a Mark --', disabled: true },
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
    buttonText: mutation.isPending ? 'Adding...' : 'Add Mark',

    // Data
    markOptions,

    // Validation rules
    validationRules: {
      mark: {
        required: 'Please select a mark',
        validate: (value: string) =>
          value !== '' || 'Please select a valid mark',
      },
    },
  };
};

export default useAddMark;
