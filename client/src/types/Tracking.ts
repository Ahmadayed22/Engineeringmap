export type TrackingRequest = {
  completed: boolean;
};

export type CourseResponseDto = {
  id: number;
  name: string;
  label: string;
  description?: string;
  creditHours?: number;
};
