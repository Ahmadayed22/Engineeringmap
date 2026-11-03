import { isAxiosError } from 'axios';

/**
 * Turns any thrown value into a message that is safe to show to the user.
 * The API answers errors as {"message": "..."}; older endpoints sent plain strings.
 */
const AxiosErrorHandler = (error: unknown): string => {
  if (!isAxiosError(error)) return 'An unexpected error occurred.';

  const data = error.response?.data as unknown;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (!error.response)
    return 'Cannot reach the server. Check your connection and try again.';
  return error.message || 'Request failed.';
};

export default AxiosErrorHandler;
