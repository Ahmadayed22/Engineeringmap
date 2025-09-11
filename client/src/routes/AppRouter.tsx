import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Suspense, useEffect } from 'react';
// layouts
import { lazy } from 'react';

const MainLayOut = lazy(() => import('@layouts/Main/MainLayOut'));
const SignUp = lazy(() => import('@pages/Register/SignUp'));
const Login = lazy(() => import('@pages/Login/Login'));
const GPACalculator = lazy(() => import('@pages/GPA/GPACalculator'));
const Sehedule = lazy(() => import('@pages/schedule/Schedule'));
const DrEmail = lazy(() => import('@pages/DrEmail/DrEmail'));
const About = lazy(() => import('@pages/about/About'));
const CpeFlow = lazy(() => import('@pages/computerEngineering/CpeFlow'));
const EeFlow = lazy(() => import('@pages/electricalEngineering/EeFlow'));
import Error from '@pages/Error/Error';
import { LottieHandler } from '@components/feedbaks';
import { scheduleToken } from '@util/scheduleToken';
import { useAppDispatch, useAppSelector } from '@store/reduxHooks';
import { Home } from '@pages/index';

// import ParticlesBackground from '@components/common/Background/ParticlesBackground';

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
      {
        path: 'computerEngineer',
        element: <CpeFlow />,
      },
      {
        path: 'electricalEngineer',
        element: <EeFlow />,
      },
      {
        path: 'gpa',
        element: <GPACalculator />,
      },
      {
        path: 'schedule',
        element: <Sehedule />,
      },
      {
        path: 'dremail',
        element: <DrEmail />,
      },
      {
        path: 'about',
        element: <About />,
      },
    ],
  },
]);

const AppRouter = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (accessToken) {
      scheduleToken(accessToken, dispatch);
    }
  }, [accessToken, dispatch]);
  return (
    <Suspense
      fallback={<LottieHandler type="loading" message="Loading Pleas Wait" />}
    >
      <QueryClientProvider client={queryClient}>
        {/* <ParticlesBackground className="fixed inset-0 -z-10" /> */}
        {/* <FireParticles /> */}
        <div className="bg-[#F0F2F5] fixed inset-0 -z-10"></div>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Suspense>
  );
};

export default AppRouter;
