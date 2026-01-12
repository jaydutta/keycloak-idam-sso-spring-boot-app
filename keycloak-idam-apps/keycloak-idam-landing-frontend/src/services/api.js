import axios from 'axios';

// Backend API URL
const API_BASE_URL = 'http://localhost:8090/api';

const api = axios.create({
  //baseURL: '/api',
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't show alert, just redirect to login
      console.log('Unauthorized, redirecting to login...');
      window.location.href = 'http://localhost:8090/oauth2/authorization/keycloak';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  getUser: () => api.get('/auth/user'),
  checkAuth: () => api.get('/auth/check'),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.post('/user/change-password', data),
  getUserInfo: () => api.get('/user/info'),
};

// Admin API
export const adminApi = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  resetPassword: (userId, password) => 
    api.post(`/admin/users/${userId}/reset-password`, { password }),
  getUserRoles: (userId) => api.get(`/admin/users/${userId}/roles`),
  assignRoles: (userId, roles) => api.put(`/admin/users/${userId}/roles`, roles),
  getAllRoles: () => api.get('/admin/roles'),
};

export default api;