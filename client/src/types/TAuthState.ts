import { TLoading } from './TLoading';

type TAuthState = {
  userInfo: {
    id: number;
    email: string;
    username: string;
    roles: string[];
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: TLoading;
  error: string | null;
};

export default TAuthState;
