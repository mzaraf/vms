// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vms-z5iz.onrender.com/api',
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.error('No refresh token available');
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('https://vms-z5iz.onrender.com/api/auth/token/refresh/', 
          {refresh: refreshToken},
          { withCredentials: true }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error('Token refresh failed:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;