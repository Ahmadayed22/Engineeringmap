import { TLoading } from './TLoading';

type TAuthState = {
  userInfo: {
    id: number;
    email: string;
    username: string;
  } | null;
  accessToken: string | null;
  loading: TLoading;
  error: string | null;
};

export default TAuthState;
