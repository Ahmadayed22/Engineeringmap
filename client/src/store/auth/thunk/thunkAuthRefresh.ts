import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@store/Store';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios, { isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  roles: string[];
  sub: string;
  exp: number;
  iat: number;
  userId: number;
};

type TRefreshResponse = {
  accessToken: string;
  refreshToken: string;
  userInfo: {
    id: number;
    username: string;
    email: string;
  };
};

/**
 * Why a refresh failed. Only `sessionExpired` means the server rejected the refresh token;
 * anything else (offline, server cold-starting) is temporary and must not sign the user out.
 */
export type RefreshFailure = { message: string; sessionExpired: boolean };

export const isSessionExpired = (e: unknown) =>
  typeof e === 'object' &&
  e !== null &&
  (e as RefreshFailure).sessionExpired === true;

const thunkAuthRefresh = createAsyncThunk<
  {
    accessToken: string;
    refreshToken: string;
    userInfo: TRefreshResponse['userInfo'] & { roles: string[] };
  },
  void,
  { rejectValue: RefreshFailure }
>('auth/thunkAuthRefresh', async (_, thunkAPI) => {
  const { rejectWithValue, getState } = thunkAPI;
  const state = getState() as RootState;
  const refreshToken = state.auth.refreshToken;

  if (!refreshToken) {
    return rejectWithValue({
      message: 'No refresh token available',
      sessionExpired: true,
    });
  }

  try {
    const res = await axios.post<TRefreshResponse>('/api/auth/refresh', {
      refreshToken,
    });

    const decoded = jwtDecode<DecodedToken>(res.data.accessToken);
    const roles = decoded.roles || [];

    return {
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
      userInfo: {
        ...res.data.userInfo,
        roles,
      },
    };
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    return rejectWithValue({
      message: AxiosErrorHandler(error),
      // 400/401/403 = token unknown, expired or revoked. No response = network problem.
      sessionExpired: status !== undefined && status >= 400 && status < 500,
    });
  }
});

export default thunkAuthRefresh;
