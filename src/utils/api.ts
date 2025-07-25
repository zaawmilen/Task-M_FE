import axios from 'axios';

console.log('API Configuration:', {
  envVar: import.meta.env.VITE_API_BASE,
  mode: import.meta.env.MODE,
  allEnvVars: import.meta.env
});

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://task-m-be.onrender.com/api',
  withCredentials: true,
});

// Don't attach interceptors in test environment
if (import.meta.env.MODE !== 'test') {
  // Request logging
  api.interceptors.request.use(
    (config: any) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    },
    error => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response logging
  api.interceptors.response.use(
    response => {
      console.log(`API Response Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      return response;
    },
    error => {
      if (error.response) {
        console.error(`API Response Error (${error.response.status}):`, error.response.data);
      } else if (error.request) {
        console.error('API No Response Received:', error.request);
      } else {
        console.error('API Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  // Token injection
  api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export default api;