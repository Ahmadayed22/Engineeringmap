import { createAsyncThunk } from '@reduxjs/toolkit';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';

const thunkAuthLogout = createAsyncThunk(
  'auth/thunkAuthLogout',
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await axios.post('/api/auth/logout');
      return true;
    } catch (error) {
      // Even if the logout request fails, we should clear local state
      rejectWithValue(AxiosErrorHandler(error));
      console.error('Logout request failed:', error);
      return true;
    }
  }
);

export default thunkAuthLogout;
