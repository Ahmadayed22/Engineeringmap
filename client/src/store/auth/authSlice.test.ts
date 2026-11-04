import { describe, expect, it } from 'vitest';
import { authReducer, thunkAuthRefresh } from './authSlice';
import { isSessionExpired } from './thunk/thunkAuthRefresh';

const signedIn = {
  userInfo: { id: 1, email: 'a@example.com', username: 'a', roles: ['USER'] },
  accessToken: 'access',
  refreshToken: 'refresh',
  loading: 'idle' as const,
  error: null,
};

const rejected = (payload: { message: string; sessionExpired: boolean }) =>
  thunkAuthRefresh.rejected(null, 'req', undefined, payload);

describe('token refresh failures', () => {
  it('keeps the user signed in when the server could not be reached', () => {
    const state = authReducer(
      signedIn,
      rejected({ message: 'Cannot reach the server', sessionExpired: false })
    );
    expect(state.accessToken).toBe('access');
    expect(state.refreshToken).toBe('refresh');
    expect(state.userInfo?.username).toBe('a');
  });

  it('signs the user out when the server rejected the refresh token', () => {
    const state = authReducer(
      signedIn,
      rejected({ message: 'Your session has expired', sessionExpired: true })
    );
    expect(state.accessToken).toBeNull();
    expect(state.userInfo).toBeNull();
    expect(state.error).toBe('Your session has expired');
  });

  it('recognises only explicit session-expired failures', () => {
    expect(isSessionExpired({ message: 'x', sessionExpired: true })).toBe(true);
    expect(isSessionExpired({ message: 'x', sessionExpired: false })).toBe(
      false
    );
    expect(isSessionExpired(new Error('boom'))).toBe(false);
    expect(isSessionExpired(undefined)).toBe(false);
  });
});
