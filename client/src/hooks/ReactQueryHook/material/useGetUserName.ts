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
  // The comment already carries the author's name; only look it up when it's missing.
  const { data: fetchedName } = useQuery({
    queryKey: ['userName', comment.userId],
    queryFn: getUserName,
    enabled: !comment.username,
    staleTime: 30 * 60 * 1000,
  });
  return { username: comment.username ?? fetchedName };
};

export default useGetUserName;
