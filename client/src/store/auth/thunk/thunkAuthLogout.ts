import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@store/Store';
import AxiosErrorHandler from '@util/AxiosErrorHandler';
import axios from 'axios';

const thunkAuthLogout = createAsyncThunk(
  'auth/thunkAuthLogout',
  async (_, thunkAPI) => {
    const { refreshToken } = (thunkAPI.getState() as RootState).auth;
    try {
      // Revokes this device's refresh token on the server (the access token is attached by
      // apiClient). The user's other devices stay signed in.
      await axios.post('/api/auth/logout', { refreshToken });
    } catch (error) {
      // Local state is cleared either way; the server token also expires on its own.
      console.warn('Logout request failed:', AxiosErrorHandler(error));
    }
    return thunkAPI.fulfillWithValue(true);
  }
);

export default thunkAuthLogout;
