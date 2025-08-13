import { createSlice } from '@reduxjs/toolkit';
import thunkAuthRegister from './thunk/thunkAuthRegister';
import thunkAuthLogin from './thunk/thunkAuthLogin';
import TAuthState from '@customTypes/TAuthState';
import thunkAuthRefresh from './thunk/thunkAuthRefresh';
import thunkAuthLogout from './thunk/thunkAuthLogout';

const initialState: TAuthState = {
  userInfo: null,
  accessToken: null,
  refreshToken: null,
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
      state.refreshToken = null;
    },
    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
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
      state.refreshToken = action.payload.refreshToken;
      state.userInfo = action.payload.userInfo;
    });
    builder.addCase(thunkAuthLogin.rejected, (state, action) => {
      state.loading = 'failed';
      if (action.payload && typeof action.payload === 'string') {
        state.error = action.payload;
      }
    });
    builder.addCase(thunkAuthRefresh.pending, (state) => {
      state.error = null;
    });
    builder.addCase(thunkAuthRefresh.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.userInfo = action.payload.userInfo;
    });
    builder.addCase(thunkAuthRefresh.rejected, (state, action) => {
      state.userInfo = null;
      state.accessToken = null;
      state.refreshToken = null;
      if (action.payload && typeof action.payload === 'string') {
        state.error = action.payload;
      }
    });

    // Logout cases
    builder.addCase(thunkAuthLogout.pending, (state) => {
      state.loading = 'pending';
    });
    builder.addCase(thunkAuthLogout.fulfilled, (state) => {
      state.loading = 'idle';
      state.userInfo = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    });
    builder.addCase(thunkAuthLogout.rejected, (state) => {
      // Clear state even if logout request fails
      state.loading = 'idle';
      state.userInfo = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    });
  },
});

const authReducer = authSlice.reducer;
export const { resetUI, authLogout, updateTokens } = authSlice.actions;
export {
  authReducer,
  thunkAuthRegister,
  thunkAuthLogin,
  thunkAuthRefresh,
  thunkAuthLogout,
};
