import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getErrorMessage = (err: unknown, defaultMessage = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.response?.data?.message || err.message || defaultMessage;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return defaultMessage;
};

export default api;
