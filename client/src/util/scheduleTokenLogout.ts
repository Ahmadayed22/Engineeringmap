// utils/scheduleTokenLogout.ts
import { jwtDecode } from 'jwt-decode';

import { authLogout } from '@store/auth/authSlice';

import { AppDispatch } from '@store/Store';

type DecodedToken = {
  exp: number; // in seconds
};

let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenLogout(token: string, dispatch: AppDispatch) {
  if (!token) return;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const exp = decoded.exp * 1000;
    const now = Date.now();
    const timeout = exp - now;

    if (logoutTimer) clearTimeout(logoutTimer);

    if (timeout <= 0) {
      // already expired
      dispatch(authLogout());

      return;
    }

    logoutTimer = setTimeout(() => {
      dispatch(authLogout());
    }, timeout);
  } catch (e) {
    console.error('Invalid token', e);
    dispatch(authLogout());
  }
}
