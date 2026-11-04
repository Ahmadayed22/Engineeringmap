import AuthCard from '@components/common/AuthCard/AuthCard';
import InputForm from '@components/common/InputForm/InputForm';
import { useLogin } from '@hooks/index';
import { resetUI } from '@store/auth/authSlice';
import { Alert, Button, Spinner } from 'flowbite-react';
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { safeNext } from '@util/safeNext';
import { useI18n } from '../../i18n/context';

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
  const { t, tMaybe } = useI18n();

  useEffect(() => {
    dispatch(resetUI());
  }, [dispatch]);

  if (accessToken)
    return <Navigate to={safeNext(searchParams.get('next'))} replace />;

  const isPending = loading === 'pending';

  return (
    <AuthCard
      title={t('auth.welcome')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <>
          {t('auth.newHere')}{' '}
          <Link
            to="/signup"
            className="font-medium text-blue-400 hover:underline"
          >
            {t('auth.createAccount')}
          </Link>
        </>
      }
    >
      {searchParams.get('message') === 'accountCreated' && (
        <Alert color="success" className="mb-4 text-center">
          {t('auth.accountCreated')}
        </Alert>
      )}

      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(submitForm)}
        noValidate
      >
        <InputForm
          register={register}
          label={t('auth.email')}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
        />
        <InputForm
          register={register}
          label={t('auth.password')}
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
              {t('auth.signingIn')}
            </>
          ) : (
            t('common.signIn')
          )}
        </Button>
        {error && (
          <Alert color="failure" role="alert" className="text-center">
            {tMaybe(error)}
          </Alert>
        )}
      </form>
    </AuthCard>
  );
};

export default Login;
