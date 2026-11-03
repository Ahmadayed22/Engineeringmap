import axios from 'axios';
import { TrackingRequest } from '@customTypes/Tracking';

type CourseResponseDto = {
  id: number;
  name: string;
  label: string;
  description?: string;
  creditHours?: number;
};

const useGetCourses = () => {
  const completeCourse = async ({
    courseId,
    completed,
  }: {
    courseId: number;
    completed: boolean;
  }): Promise<void> => {
    const payload: TrackingRequest = { completed };
    const response = await axios.post(
      `/api/courses/${courseId}/complete`,
      payload
    );
    return response.data;
  };

  const getCompletedCourses = async (): Promise<number[]> => {
    const response = await axios.get('/api/courses/user/completed');
    return response.data;
  };

  const getMarkCourses = async (): Promise<number[]> => {
    const response = await axios.get('/api/courses/user/mark');
    return response.data;
  };

  const getAllCourses = async (): Promise<CourseResponseDto[]> => {
    const response = await axios.get('/api/courses');
    return response.data;
  };

  const getCourseById = async (
    courseId: number
  ): Promise<CourseResponseDto> => {
    const response = await axios.get(`/api/courses/${courseId}`);
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
