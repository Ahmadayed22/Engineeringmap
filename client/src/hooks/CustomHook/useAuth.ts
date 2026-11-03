import {
  resetUI,
  thunkAuthLogout,
  thunkAuthRefresh,
} from '@store/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@store/reduxHooks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { userInfo, accessToken, refreshToken, loading, error } =
    useAppSelector((state) => state.auth);

  const logout = async () => {
    return dispatch(thunkAuthLogout());
  };

  const refreshTokens = async () => {
    return dispatch(thunkAuthRefresh());
  };

  const clearError = () => {
    dispatch(resetUI());
  };

  const isAuthenticated = !!(accessToken && userInfo);

  // The access token's "roles" claim holds bare names ("ADMIN", "USER"), not "ROLE_ADMIN".
  const hasRole = (role: string): boolean => {
    const name = role.replace(/^ROLE_/, '');
    return userInfo?.roles?.includes(name) ?? false;
  };

  const isAdmin = hasRole('ADMIN');
  const isUser = hasRole('USER');

  return {
    // State
    userInfo,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isUser,
    // Actions
    logout,
    refreshTokens,
    clearError,
    hasRole,
  };
};
