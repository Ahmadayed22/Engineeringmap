import AuthCard from '@components/common/AuthCard/AuthCard';
import InputForm from '@components/common/InputForm/InputForm';
import { useLogin } from '@hooks/index';
import { resetUI } from '@store/auth/authSlice';
import { Alert, Button, Spinner } from 'flowbite-react';
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';

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
    accessToken,
  } = useLogin();

  useEffect(() => {
    dispatch(resetUI());
  }, [dispatch]);

  if (accessToken) return <Navigate to="/" replace />;

  const isPending = loading === 'pending';

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to track your courses, grades and comments."
      footer={
        <>
          New here?{' '}
          <Link
            to="/signup"
            className="font-medium text-blue-400 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {searchParams.get('message') === 'accountCreated' && (
        <Alert color="success" className="mb-4 text-center">
          Account created. Please sign in.
        </Alert>
      )}

      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(submitForm)}
        noValidate
      >
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
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <Spinner size="sm" className="me-2" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Sign in'
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

export default Login;
