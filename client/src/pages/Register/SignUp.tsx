import AuthCard from '@components/common/AuthCard/AuthCard';
import InputForm from '@components/common/InputForm/InputForm';
import { useSiginUp } from '@hooks/index';
import { resetUI } from '@store/auth/authSlice';
import { Alert, Button, Spinner } from 'flowbite-react';
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';

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
  } = useSiginUp();

  useEffect(() => {
    dispatch(resetUI());
  }, [dispatch]);

  // Was navigate('/') during render, which React warns about and can loop.
  if (accessToken) return <Navigate to="/" replace />;

  const isPending = loading === 'pending';

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save your progress on the study plan and join course discussions."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(submitForm)}
        noValidate
      >
        <InputForm
          register={register}
          label="Username"
          name="username"
          autoComplete="username"
          placeholder="e.g. ahmad22"
          error={errors.username?.message}
        />
        <InputForm
          register={register}
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
        />
        <InputForm
          register={register}
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
        />
        <InputForm
          register={register}
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <Spinner size="sm" className="me-2" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
        {error && (
          <Alert color="failure" role="alert" className="text-center">
            {error}
          </Alert>
        )}
      </form>
    </AuthCard>
  );
};

export default SignUp;
