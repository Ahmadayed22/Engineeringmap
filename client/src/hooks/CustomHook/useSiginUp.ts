import { signUpInputsType, signUpSchema } from '@validation/signUpSchema';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@store/reduxHooks';
import { thunkAuthRegister } from '@store/auth/authSlice';
import { useNavigate } from 'react-router';

const useSiginUp = () => {
  const { loading, error, accessToken } = useAppSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpInputsType>({
    mode: 'onBlur',
    resolver: zodResolver(signUpSchema),
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const submitForm: SubmitHandler<signUpInputsType> = (data) => {
    const { confirmPassword, ...rest } = data;
    dispatch(thunkAuthRegister(rest))
      .unwrap()
      .then(() => {
        navigate('/login?message=accountCreated');
      });
  };
  return {
    register,
    handleSubmit,
    loading,
    accessToken,
    error,
    errors,
    submitForm,
    dispatch,
    navigate,
  };
};

export default useSiginUp;
