import AuthCard from '@components/common/AuthCard/AuthCard';
import InputForm from '@components/common/InputForm/InputForm';
import { useSiginUp } from '@hooks/index';
import { resetUI } from '@store/auth/authSlice';
import { Alert, Button, Spinner } from 'flowbite-react';
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useI18n } from '../../i18n/context';

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
  const { t, tMaybe } = useI18n();

  useEffect(() => {
    dispatch(resetUI());
  }, [dispatch]);

  // Was navigate('/') during render, which React warns about and can loop.
  if (accessToken) return <Navigate to="/" replace />;

  const isPending = loading === 'pending';

  return (
    <AuthCard
      title={t('auth.signupTitle')}
      subtitle={t('auth.signupSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:underline"
          >
            {t('common.signIn')}
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
          label={t('auth.username')}
          name="username"
          autoComplete="username"
          placeholder={t('auth.usernamePh')}
          error={errors.username?.message}
        />
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
          autoComplete="new-password"
          placeholder={t('auth.passwordPh')}
          error={errors.password?.message}
        />
        <InputForm
          register={register}
          label={t('auth.confirmPassword')}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder={t('auth.confirmPh')}
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
              {t('auth.creating')}
            </>
          ) : (
            t('auth.createBtn')
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

export default SignUp;
