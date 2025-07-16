import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Suspense } from 'react';
// layouts
import { lazy } from 'react';

const MainLayOut = lazy(() => import('@layouts/Main/MainLayOut'));
const Home = lazy(() => import('@pages/Home/Home'));
const Error = lazy(() => import('@pages/Error/Error'));
import { LottieHandler } from '@components/feedbaks';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayOut />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);

const AppRouter = () => {
  return (
    <Suspense
      fallback={<LottieHandler type="loading" message="Loading Pleas Wait" />}
    >
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;
