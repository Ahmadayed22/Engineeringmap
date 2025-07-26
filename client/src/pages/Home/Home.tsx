import { authLogout } from '@store/auth/authSlice';
import { useAppDispatch } from '@store/reduxHooks';
import { useEffect } from 'react';

const Home = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(authLogout());
  });
  return <div>Home</div>;
};

export default Home;
