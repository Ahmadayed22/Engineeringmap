import { createAsyncThunk } from '@reduxjs/toolkit';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';

const thunkAuthLogout = createAsyncThunk(
  'auth/thunkAuthLogout',
  async (_, thunkAPI) => {
    try {
      // Revokes the refresh token on the server (the access token is attached by apiClient).
      await axios.post('/api/auth/logout');
    } catch (error) {
      // Local state is cleared either way; the server token also expires on its own.
      console.warn('Logout request failed:', AxiosErrorHandler(error));
    }
    return thunkAPI.fulfillWithValue(true);
  }
);

export default thunkAuthLogout;
