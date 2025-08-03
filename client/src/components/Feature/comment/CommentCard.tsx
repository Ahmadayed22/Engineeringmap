import { CommentForList } from '@customTypes/CommentForList';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type CommentCardProps = {
  comment: CommentForList;
};

const CommentCard = ({ comment }: CommentCardProps) => {
  const getUserName = async () => {
    try {
      const res = await axios.get(`/api/users/${comment.userId}`);
      console.log(res.data);
      return res.data.username;
    } catch (error) {
      throw new Error(`User Not Found , ${error}`);
    }
  };
  const { data: username } = useQuery({
    queryKey: ['userName'],
    queryFn: getUserName,
  });
  return (
    <div className="space-y-4 rounded-lg border-2 border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900 ">
      <CommentCardHeader username={username} comment={comment} />
      <CommentCardContent comment={comment} />
    </div>
  );
};

type CommentCardHeaderProps = {
  username: string;
} & Pick<CommentCardProps, 'comment'>;

function CommentCardHeader({ username, comment }: CommentCardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <div>{username}</div>
      <time className="text-sm text-neutral-500">
        · {new Date(comment.createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}

type CommentCardContentProps = Pick<CommentCardProps, 'comment'>;
function CommentCardContent({ comment }: CommentCardContentProps) {
  return <p>{comment.content}</p>;
}

export default CommentCard;
