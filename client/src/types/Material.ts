export type Material = {
  id: number;
  books: string | null;
  summaries: string | null;
  slides: string | null;
  labs: string | null;
  exams: string | null;
  videos: string | null;
  courseId: number;
  userId: number;
  name?: string | null;
  /** Sum of votes; absent on old API responses. */
  score?: number;
  /** The viewer's own vote: -1, 0 or 1. */
  myVote?: number;
  /** False while it waits for an admin (only its author sees it then). */
  approved?: boolean;
};
