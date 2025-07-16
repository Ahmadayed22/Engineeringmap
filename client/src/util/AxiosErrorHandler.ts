import { isAxiosError } from 'axios';

const AxiosErrorHandler = (error: unknown) => {
  return isAxiosError(error)
    ? error.response?.data || error.response?.data.message || error.message
    : 'An unexpected error';
};

export default AxiosErrorHandler;
