import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { Select, Button } from 'flowbite-react';
import toast from 'react-hot-toast';

type FormData = {
  mark: string;
};

const SelectMark = () => {
  const { courseId } = useTreeFlowContext();
  const { accessToken } = useAuth();

  const { register, handleSubmit } = useForm<FormData>();

  const addMark = async (data: FormData): Promise<void> => {
    await axios.post(`/api/courses/${courseId}/mark`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const mutation = useMutation<void, Error, FormData>({
    mutationFn: addMark,
    onSuccess: () => {
      toast.success('Mark have been Added');
      console.log('Mark submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed adding mark');
      console.error('Failed to submit mark:', error);
    },
  });

  return (
    <form className="" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Select id="mark-select" {...register('mark', { required: true })}>
        <option value="">-- Select a Mark --</option>
        <option>A</option>
        <option>A-</option>
        <option>B+</option>
        <option>B</option>
        <option>B-</option>
        <option>C+</option>
        <option>C</option>
        <option>C-</option>
        <option>D+</option>
        <option>D</option>
        <option>D-</option>
        <option>F</option>
      </Select>
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          className="mt-3 cursor-pointer  "
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Adding...' : 'Add '}
        </Button>
      </div>
    </form>
  );
};

export default SelectMark;
