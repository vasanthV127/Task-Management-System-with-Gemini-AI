import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
  
  login: (username, password) => 
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// Tasks API
export const tasksAPI = {
  getAllTasks: () => api.get('/tasks'),
  
  getTasksByState: (state) => api.get('/tasks', { params: { state } }),
  
  getTask: (id) => api.get(`/tasks/${id}`),
  
  createTask: (title, description = '') => 
    api.post('/tasks', { title, description }),
  
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// AI API
export const aiAPI = {
  processCommand: (command) => api.post('/ai/command', { command }),
};

export default api;
