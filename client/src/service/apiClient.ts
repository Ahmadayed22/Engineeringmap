import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@store/Store';
import { authLogout, thunkAuthRefresh } from '@store/auth/authSlice';

/**
 * One place that configures every request the app makes.
 *
 * - Base URL comes from VITE_API_URL. Set it to an empty string when the React build is
 *   served by Spring Boot itself (same origin). Unset keeps the previous default.
 * - The current access token is attached automatically, so hooks never pass stale tokens.
 * - A 401 triggers one token refresh (shared by all requests that fail at the same time),
 *   then the original request is retried. If the refresh fails the user is signed out.
 */
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ?? 'https://engineeringmap.onrender.com';

const AUTH_FREE_PATHS = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/refresh',
];

const isAuthFree = (url?: string) =>
  !!url && AUTH_FREE_PATHS.some((path) => url.includes(path));

axios.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token && !isAuthFree(config.url)) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshInFlight: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = store
      .dispatch(thunkAuthRefresh())
      .unwrap()
      .then((result) => result.accessToken)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const canRetry =
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !isAuthFree(original.url) &&
      !!store.getState().auth.refreshToken;

    if (!canRetry) {
      return Promise.reject(error);
    }

    original._retried = true;
    try {
      const newToken = await refreshAccessToken();
      original.headers.set('Authorization', `Bearer ${newToken}`);
      return axios(original);
    } catch {
      store.dispatch(authLogout());
      return Promise.reject(error);
    }
  }
);

export default axios;
