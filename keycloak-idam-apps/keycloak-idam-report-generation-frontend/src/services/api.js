import axios from 'axios';

const API_BASE_URL = 'http://localhost:8091';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = `${API_BASE_URL}/oauth2/authorization/keycloak`;
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  getUser: () => api.get('/user/user'), // Fixed: was '/user', now '/user/user'
  getUserInfo: () => api.get('/user/info'),
};

export const reportApi = {
  generateReport: (data) => api.post('/reports/generate', data),
  getAllReports: () => api.get('/reports'),
  getReportById: (id) => api.get(`/reports/${id}`),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

export default api;