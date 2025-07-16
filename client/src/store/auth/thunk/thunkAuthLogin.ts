import { createAsyncThunk } from '@reduxjs/toolkit';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';

type TFormData = {
  email: string;
  password: string;
};

type TResponse = {
  accessToken: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

const thunkAuthLogin = createAsyncThunk(
  'auth/thunkAuthLogin',
  async (formData: TFormData, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await axios.post<TResponse>('/login', formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(AxiosErrorHandler(error));
    }
  }
);

export default thunkAuthLogin;
