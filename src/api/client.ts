import axios from 'axios';
import type { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { ProblemDetails } from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = uuidv4();
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    if (error.response?.data) {
      const problem = error.response.data;
      console.error(`[RFC 7807 Error] ${problem.title}: ${problem.detail} (Correlation: ${problem.correlationId})`);
    }
    return Promise.reject(error);
  }
);