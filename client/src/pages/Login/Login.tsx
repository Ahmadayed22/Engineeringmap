import InputForm from '@components/common/InputForm/InputForm';
import { useLogin } from '@hooks/index';
import { resetUI } from '@store/auth/authSlice';

import { Alert, Button, Spinner } from 'flowbite-react';
import { useEffect } from 'react';

const Login = () => {
  const {
    register,
    handleSubmit,
    errors,
    submitForm,
    searchParams,
    loading,
    error,
    dispatch,
  } = useLogin();

  useEffect(() => {
    dispatch(resetUI());
  }, [dispatch]);

  return (
    <div className="max-w-md mx-auto h-screen mt-[15%]">
      <div className="mb-4">
        {searchParams.get('message') === 'accountCreated' && (
          <Alert className="text-green-500 text-center">
            Account created successfully, please log in.
          </Alert>
        )}
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(submitForm)}>
        {/* email */}
        <InputForm
          register={register}
          label="Your Email"
          id="email"
          name="email"
          type="email"
          placeholder="aboayed22@gmail.com"
          error={errors.email?.message}
        />

        {/* password */}
        <InputForm
          register={register}
          label="Your Password"
          id="password"
          name="password"
          type="password"
          placeholder="***********"
          error={errors.password?.message}
        />

        <Button type="submit" className="cursor-pointer">
          {loading === 'pending' ? (
            <>
              <Spinner></Spinner>
              <span className="ml-2">Logging ...</span>
            </>
          ) : (
            'Login'
          )}
        </Button>
        {error && (
          <Alert color="failure" className="text-red-500 text-center">
            {error}
          </Alert>
        )}
      </form>
    </div>
  );
};

export default Login;
