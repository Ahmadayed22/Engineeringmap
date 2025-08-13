import axios, { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with base configuration
export const createApiClient = (token?: string | null): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      // Debug logging
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      console.error('🚨 Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Unauthorized - Please log in again');
        // You might want to dispatch a logout action here
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this resource');
        console.error('🚨 Forbidden - User might not have permission');
      }

      return Promise.reject(error);
    }
  );

  return client;
};
