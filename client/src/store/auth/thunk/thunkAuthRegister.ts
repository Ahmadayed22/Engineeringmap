import { createAsyncThunk } from '@reduxjs/toolkit';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';

type TFormData = {
  username: string;
  email: string;
  password: string;
};

const thunkAuthRegister = createAsyncThunk(
  'auth/thunkAuthRegister',
  async (formData: TFormData, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await axios.post('/api/auth/signup', formData);
      console.log(res);
      return res.data;
    } catch (error) {
      return rejectWithValue(AxiosErrorHandler(error));
    }
  }
);

export default thunkAuthRegister;
