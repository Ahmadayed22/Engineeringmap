import { createAsyncThunk } from '@reduxjs/toolkit';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

type TFormData = {
  email: string;
  password: string;
};

type DecodedToken = {
  roles: string[]; // ["ROLE_USER"], ["ROLE_ADMIN"],
  sub: string;
  exp: number;
  iat: number;
};

type TResponse = {
  accessToken: string;
  userInfo: {
    id: number;
    username: string;
    email: string;
    roles: string[];
  };
};

const thunkAuthLogin = createAsyncThunk(
  'auth/thunkAuthLogin',
  async (formData: TFormData, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await axios.post<TResponse>('/api/auth/signin', formData);

      const decoded = jwtDecode<DecodedToken>(res.data.accessToken);
      const roles = decoded.roles || [];
      return {
        accessToken: res.data.accessToken,
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
export default thunkAuthLogin;
