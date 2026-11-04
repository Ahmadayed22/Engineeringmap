import { HelperText, Label, TextInput } from 'flowbite-react';
import { useI18n } from '../../../i18n/context';

type InputFormProps = {
  label: string;
  id?: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: string;
};

const InputForm = ({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  register,
  error,
}: InputFormProps) => {
  const { tMaybe } = useI18n();
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;
  return (
    <div>
      <div className="mb-2 block">
        <Label htmlFor={inputId} className="!text-neutral-300">
          {label}
        </Label>
      </div>
      <TextInput
        id={inputId}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        shadow
        {...register(name)}
        color={error ? 'failure' : undefined}
      />
      {error && (
        <HelperText id={errorId} color="failure" role="alert">
          {tMaybe(error)}
        </HelperText>
      )}
    </div>
  );
};

export default InputForm;
