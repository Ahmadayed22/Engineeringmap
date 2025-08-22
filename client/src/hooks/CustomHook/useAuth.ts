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

  const hasRole = (role: string): boolean => {
    return userInfo?.roles?.includes(`ROLE_${role}`) || false;
  };

  const isAdmin = userInfo?.roles.includes('ADMIN');
  const isUser = userInfo?.roles.includes('USER');

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
