import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8092/api',
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
      console.log('Unauthorized, redirecting to login...');
      window.location.href = 'http://localhost:8092/oauth2/authorization/keycloak';
    }
    return Promise.reject(error);
  }
);

// User API
export const userApi = {
  getUser: () => api.get('/user/info'), // Fixed: correct endpoint
};

// File API
export const fileApi = {
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAllFiles: () => api.get('/files'),
  downloadFile: (fileId) => api.get(`/files/${fileId}/download`, {
    responseType: 'blob',
  }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
};

export default api;