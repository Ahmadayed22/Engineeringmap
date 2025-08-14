import { TrackingRequest } from '@customTypes/Tracking';
import { createApiClient } from '@services/createApiClient';
import { useAppSelector } from '@store/reduxHooks';

type CourseResponseDto = {
  id: number;
  name: string;
  label: string;
  description?: string;
  creditHours?: number;
};

const useGetCourses = () => {
  const { accessToken } = useAppSelector((state) => state.auth);

  const apiClient = createApiClient(accessToken);

  const completeCourse = async ({
    courseId,
    completed,
  }: {
    courseId: number;
    completed: boolean;
  }): Promise<void> => {
    const payload: TrackingRequest = { completed };
    const response = await apiClient.post(
      `/courses/${courseId}/complete`,
      payload
    );
    return response.data;
  };

  const getCompletedCourses = async (): Promise<number[]> => {
    const response = await apiClient.get('/courses/user/completed');
    return response.data;
  };
  const getMarkCourses = async (): Promise<number[]> => {
    const response = await apiClient.get('/courses/user/mark');
    return response.data;
  };

  const getAllCourses = async (): Promise<CourseResponseDto[]> => {
    const response = await apiClient.get('/courses');
    return response.data;
  };

  const getCourseById = async (
    courseId: number
  ): Promise<CourseResponseDto> => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  };

  return {
    completeCourse,
    getCompletedCourses,
    getAllCourses,
    getCourseById,
    getMarkCourses,
  };
};

export default useGetCourses;
