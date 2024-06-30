import axiosInstance from './axios';
import { getItemFromLocalStorage } from './index';

// Request interceptor to add the Authorization header to every request
export const setupInterceptors = () => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getItemFromLocalStorage('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
};
