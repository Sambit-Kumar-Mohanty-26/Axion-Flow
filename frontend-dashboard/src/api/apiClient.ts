import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

console.log("API Client is configured to use base URL:", baseURL);

const apiClient = axios.create({
  baseURL: baseURL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;