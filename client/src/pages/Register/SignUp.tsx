import InputForm from '@components/common/InputForm/InputForm';
import { useSiginUp } from '@hooks/index';
import { resetUI } from '@store/auth/authSlice';

import { Alert, Button, Spinner } from 'flowbite-react';
import { useEffect } from 'react';

const SignUp = () => {
  const {
    register,
    handleSubmit,
    errors,
    submitForm,
    dispatch,
    loading,
    error,
    accessToken,
    navigate,
  } = useSiginUp();

  useEffect(() => {
    dispatch(resetUI());
  }, [dispatch]);

  if (accessToken) {
    navigate('/');
  }
  return (
    <div>
      <form
        className="flex max-w-md flex-col gap-4 mx-auto h-screen justify-center "
        onSubmit={handleSubmit(submitForm)}
      >
        {/* username */}
        <InputForm
          register={register}
          label="Your UserName"
          id="username"
          name="username"
          type="text"
          placeholder="aboayed22"
          error={errors.username?.message}
        />

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

        {/* Confirm password */}
        <InputForm
          register={register}
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="***********"
          error={errors.confirmPassword?.message}
        />

        <Button type="submit" className="cursor-pointer">
          {loading === 'pending' ? (
            <>
              <Spinner></Spinner>
              <span className="ml-2">Logging ...</span>
            </>
          ) : (
            'Register new account'
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

export default SignUp;
