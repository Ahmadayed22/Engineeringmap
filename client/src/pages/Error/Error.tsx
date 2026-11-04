import { LottieHandler } from '@components/feedbaks';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import '@styles/bgStyle.css';
import { useI18n } from '../../i18n/context';

const Error = () => {
  // Present when rendered as a route errorElement; undefined for the "*" not-found route.
  const routeError = useRouteError();
  const { t } = useI18n();
  const isNotFound =
    !routeError ||
    (isRouteErrorResponse(routeError) && routeError.status === 404);

  return (
    // As a route errorElement this renders outside MainLayOut, so it brings its own background.
    <div
      className={`flex flex-col items-center pb-16 ${routeError ? 'custom-bg' : ''}`}
    >
      <LottieHandler
        type={isNotFound ? 'notFound' : 'error'}
        message={isNotFound ? t('error.notFound') : t('error.generic')}
      />
      <p className="mt-2 max-w-md px-4 text-center text-sm text-white/70">
        {isNotFound ? t('error.notFoundBody') : t('error.genericBody')}
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {t('error.back')}
      </Link>
    </div>
  );
};

export default Error;
