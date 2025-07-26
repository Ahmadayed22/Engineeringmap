import { HelperText, Label, TextInput } from 'flowbite-react';
// import { UseFormRegister } from 'react-hook-form';

type InputFormProps = {
  label: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  register: any;
  error?: string;
};
const InputForm = ({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  register,
  error,
}: InputFormProps) => {
  return (
    <div>
      <div className="mb-2 block">
        <Label>{label}</Label>
      </div>
      <TextInput
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        shadow
        {...register(name)}
        color={error ? 'failure' : undefined}
      />
      {error && <HelperText color="failure">{error}</HelperText>}
    </div>
  );
};

export default InputForm;
