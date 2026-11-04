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
const CourseRedirect = lazy(() => import('@features/community/CourseRedirect'));
const Planner = lazy(() => import('@pages/Planner/Planner'));
const ShareProgress = lazy(() => import('@pages/Share/ShareProgress'));
const SharedProgress = lazy(() => import('@pages/Share/SharedProgress'));
const Admin = lazy(() => import('@pages/Admin/Admin'));
import RequireAuth from '@components/common/RequireAuth/RequireAuth';
import Error from '@pages/Error/Error';
import { PageLoader } from '@components/feedbaks';
import { scheduleToken } from '@util/scheduleToken';
import { useAppDispatch, useAppSelector } from '@store/reduxHooks';
import { Home } from '@pages/index';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Course data changes rarely; avoid refetching on every tab switch.
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
      {
        path: 'course/:id',
        element: <CourseRedirect />,
      },
      {
        path: 'planner',
        element: (
          <RequireAuth>
            <Planner />
          </RequireAuth>
        ),
      },
      {
        path: 'share',
        element: (
          <RequireAuth>
            <ShareProgress />
          </RequireAuth>
        ),
      },
      {
        path: 'progress/:token',
        element: <SharedProgress />,
      },
      {
        path: 'admin',
        element: (
          <RequireAuth role="ADMIN">
            <Admin />
          </RequireAuth>
        ),
      },
      {
        path: '*',
        element: <Error />,
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
    <Suspense fallback={<PageLoader />}>
      <QueryClientProvider client={queryClient}>
        <div className="bg-[#F0F2F5] fixed inset-0 -z-10"></div>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Suspense>
  );
};

export default AppRouter;
