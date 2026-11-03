import { LottieHandler } from '@components/feedbaks';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import '@styles/bgStyle.css';

const Error = () => {
  // Present when rendered as a route errorElement; undefined for the "*" not-found route.
  const routeError = useRouteError();
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
        message={isNotFound ? 'Page not found' : 'Something went wrong'}
      />
      <p className="mt-2 max-w-md px-4 text-center text-sm text-white/70">
        {isNotFound
          ? "The page you're looking for doesn't exist or has moved."
          : 'Please try again. If it keeps happening, reload the page.'}
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Back to study plans
      </Link>
    </div>
  );
};

export default Error;
