export type CommentForList = {
  id: number;
  content: string;
  courseId: number;
  userId: number;
  /** Sent by the API with each comment; older responses may omit it. */
  username?: string;
  createdAt: string;
  updatedAt: string;
};
