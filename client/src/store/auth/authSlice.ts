import { createSlice } from '@reduxjs/toolkit';
import thunkAuthRegister from './thunk/thunkAuthRegister';
import thunkAuthLogin from './thunk/thunkAuthLogin';
import TAuthState from '@customTypes/TAuthState';

const initialState: TAuthState = {
  userInfo: null,
  accessToken: null,
  loading: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetUI: (state) => {
      state.loading = 'idle';
      state.error = null;
    },
    authLogout: (state) => {
      state.userInfo = null;
      state.accessToken = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(thunkAuthRegister.pending, (state) => {
      state.error = null;
      state.loading = 'pending';
    });
    builder.addCase(thunkAuthRegister.fulfilled, (state) => {
      state.loading = 'succeeded';
    });
    builder.addCase(thunkAuthRegister.rejected, (state, action) => {
      state.loading = 'failed';
      if (action.payload && typeof action.payload === 'string') {
        state.error = action.payload;
      }
    });
    //   LogIn
    builder.addCase(thunkAuthLogin.pending, (state) => {
      state.error = null;
      state.loading = 'pending';
    });
    builder.addCase(thunkAuthLogin.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      state.accessToken = action.payload.accessToken;
      state.userInfo = action.payload.user;
    });
    builder.addCase(thunkAuthLogin.rejected, (state, action) => {
      state.loading = 'failed';
      if (action.payload && typeof action.payload === 'string') {
        state.error = action.payload;
      }
    });
  },
});

const authReducer = authSlice.reducer;
export const { resetUI, authLogout } = authSlice.actions;
export { authReducer, thunkAuthRegister, thunkAuthLogin };
