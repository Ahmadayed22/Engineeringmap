import { createAsyncThunk } from '@reduxjs/toolkit';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';

type TFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const thunkAuthRegister = createAsyncThunk(
  'auth/thunkAuthRegister',
  async (formData: TFormData, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await axios.post('/register', formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(AxiosErrorHandler(error));
    }
  }
);

export default thunkAuthRegister;
