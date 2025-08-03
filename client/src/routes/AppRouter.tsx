import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Suspense } from 'react';
// layouts
import { lazy } from 'react';

const MainLayOut = lazy(() => import('@layouts/Main/MainLayOut'));
const Home = lazy(() => import('@pages/Home/Home'));
const Error = lazy(() => import('@pages/Error/Error'));
const SignUp = lazy(() => import('@pages/Register/SignUp'));
const Login = lazy(() => import('@pages/Login/Login'));
import { LottieHandler } from '@components/feedbaks';
const queryClient = new QueryClient();
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
      {
        path: 'signup',
        element: <SignUp />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
]);

const AppRouter = () => {
  return (
    <Suspense
      fallback={<LottieHandler type="loading" message="Loading Pleas Wait" />}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Suspense>
  );
};

export default AppRouter;
