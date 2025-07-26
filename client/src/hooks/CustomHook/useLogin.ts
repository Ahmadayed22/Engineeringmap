import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, signInType } from '@validation/signInSchema';
import { useAppDispatch, useAppSelector } from '@store/reduxHooks';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { thunkAuthLogin } from '@store/auth/authSlice';

const useLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInType>({
    mode: 'onBlur',
    resolver: zodResolver(signInSchema),
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, accessToken } = useAppSelector((state) => state.auth);
  const submitForm: SubmitHandler<signInType> = (data) => {
    if (searchParams.get('message') === 'accountCreated') {
      setSearchParams('');
    }
    dispatch(thunkAuthLogin(data))
      .unwrap()
      .then(() => {
        navigate('/');
      });
  };

  return {
    register,
    handleSubmit,
    errors,
    submitForm,
    searchParams,
    loading,
    error,
    dispatch,
    navigate,
    accessToken,
  };
};

export default useLogin;
