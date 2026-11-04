export type CommentForList = {
  id: number;
  content: string;
  courseId: number;
  userId: number;
  /** Sent by the API with each comment; older responses may omit it. */
  username?: string;
  /** Set on replies: the top-level comment they answer. */
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
};
