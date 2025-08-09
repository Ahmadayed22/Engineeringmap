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
};
