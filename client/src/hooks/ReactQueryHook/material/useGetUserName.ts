import { CommentCardProps } from '@customTypes/CommentSection';
import { useQuery } from '@tanstack/react-query';

import axios from 'axios';
const useGetUserName = ({ comment }: CommentCardProps) => {
  const getUserName = async () => {
    try {
      const res = await axios.get(`/api/users/${comment.userId}`);

      return res.data.username;
    } catch (error) {
      throw new Error(`User Not Found , ${error}`);
    }
  };
  const { data: username } = useQuery({
    queryKey: ['userName', comment.userId],
    queryFn: getUserName,
  });
  return { username };
};

export default useGetUserName;
