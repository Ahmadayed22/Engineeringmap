import { useTreeFlowContext } from '@context/TreeFlowContext';
import useAddMark from '@hooks/ReactQueryHook/courses/useAddMark';
import { Select, Button } from 'flowbite-react';

interface SelectMarkProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const SelectMark = ({
  onSuccess,
  onError,
  className = '',
}: SelectMarkProps) => {
  const { courseId } = useTreeFlowContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    isDisabled,
    buttonText,
    markOptions,
    validationRules,
  } = useAddMark({
    courseId,
    onSuccess,
    onError,
  });

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Select
            id="mark-select"
            {...register('mark', validationRules.mark)}
            className={errors.mark ? 'border-red-500' : ''}
            disabled={isDisabled}
          >
            {markOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </Select>

          {errors.mark && (
            <p className="mt-1 text-sm text-red-600">{errors.mark.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isDisabled}
            className="cursor-pointer"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SelectMark;
