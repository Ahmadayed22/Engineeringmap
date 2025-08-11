import axios, { AxiosInstance } from 'axios';

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
      console.log('🔍 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        token: token ? `Bearer ${token.substring(0, 20)}...` : 'No token',
        headers: config.headers,
      });

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
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error('🚨 API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });

      // Handle specific error cases
      if (error.response?.status === 401) {
        console.error('🚨 Unauthorized - Token might be expired');
        // You might want to dispatch a logout action here
      } else if (error.response?.status === 403) {
        console.error('🚨 Forbidden - User might not have permission');
      }

      return Promise.reject(error);
    }
  );

  return client;
};
