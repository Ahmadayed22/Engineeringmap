// utils/scheduleTokenLogout.ts
import { jwtDecode } from 'jwt-decode';
import { AppDispatch } from '@store/Store';
import {
  authLogout,
  updateTokens,
  thunkAuthRefresh,
} from '@store/auth/authSlice';

type DecodedToken = {
  exp: number; // in seconds
};

let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleToken(token: string, dispatch: AppDispatch) {
  if (!token) return;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const exp = decoded.exp * 1000;
    const now = Date.now();

    // Refresh token 1 minute before expiration
    const refreshThreshold = 60_000;
    const timeUntilRefresh = exp - now - refreshThreshold;

    if (logoutTimer) clearTimeout(logoutTimer);

    if (exp <= now) {
      // Already expired — logout
      dispatch(authLogout());
      return;
    }

    if (timeUntilRefresh <= 0) {
      // Token is expiring soon, refresh immediately
      triggerRefresh(dispatch);
    } else {
      // Schedule refresh
      logoutTimer = setTimeout(() => {
        triggerRefresh(dispatch);
      }, timeUntilRefresh);
    }
  } catch (e) {
    console.error('Invalid token', e);
    dispatch(authLogout());
  }
}

async function triggerRefresh(dispatch: AppDispatch) {
  try {
    const result = await dispatch(thunkAuthRefresh()).unwrap();
    dispatch(updateTokens(result));

    // Reschedule logout/refresh for new token
    scheduleToken(result.accessToken, dispatch);
  } catch (error) {
    console.error('Token refresh failed:', error);
    dispatch(authLogout());
  }
}
