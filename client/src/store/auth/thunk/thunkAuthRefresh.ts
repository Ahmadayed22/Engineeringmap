import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@store/Store';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';
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

const thunkAuthRefresh = createAsyncThunk(
  'auth/thunkAuthRefresh',
  async (_, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const state = getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken) {
      return rejectWithValue('No refresh token available');
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
      return rejectWithValue(AxiosErrorHandler(error));
    }
  }
);

export default thunkAuthRefresh;
