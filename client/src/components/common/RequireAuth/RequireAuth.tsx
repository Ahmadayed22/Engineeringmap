import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/CustomHook/useAuth';

type Props = { children: ReactNode; role?: string };

/** Sends signed-out users to /login (and back afterwards); optional role check. */
const RequireAuth = ({ children, role }: Props) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (role && !hasRole(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
