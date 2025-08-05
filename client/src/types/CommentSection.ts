import { CommentForList } from './CommentForList';

type CommentSectionProps = {
  nodeName?: string | null | undefined;
  courseId?: number | unknown | null;
};
export type CommentCardProps = {
  comment: CommentForList;
};
export type CommentCardContentProps = Pick<CommentCardProps, 'comment'>;

export type CommentCardHeaderProps = {
  username: string;
} & Pick<CommentCardProps, 'comment'>;
export default CommentSectionProps;
