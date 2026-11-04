import { jwtDecode } from 'jwt-decode';
import { AppDispatch } from '@store/Store';
import { authLogout } from '@store/auth/authSlice';
import { refreshAccessToken } from '../service/apiClient';
import { isSessionExpired } from '@store/auth/thunk/thunkAuthRefresh';

const RETRY_AFTER_NETWORK_ERROR_MS = 30_000;

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

    // Expired or about to expire: use the refresh token (valid for days) instead of
    // signing the user out every time they come back after the 15-minute access window.
    if (exp <= now || timeUntilRefresh <= 0) {
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
    // Shared with the 401 interceptor, so simultaneous triggers make one request.
    // The new token lands in the store, and AppRouter reschedules from there.
    await refreshAccessToken();
  } catch (error) {
    if (isSessionExpired(error)) {
      dispatch(authLogout());
      return;
    }
    // Offline or the server is waking up: keep the user signed in and try again.
    console.warn('Token refresh failed, retrying shortly:', error);
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(
      () => triggerRefresh(dispatch),
      RETRY_AFTER_NETWORK_ERROR_MS
    );
  }
}
