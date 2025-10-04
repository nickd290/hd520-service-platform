import axios from 'axios';
import { TrainingModule, ModuleWithContent, ProgressSummary, Certificate } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Training API
export const trainingApi = {
  getModulesByPath: (path: 'operator' | 'technician') =>
    api.get<TrainingModule[]>(`/training/modules/${path}`),

  getModuleById: (id: string) =>
    api.get<ModuleWithContent>(`/training/module/${id}`),

  updateProgress: (moduleId: string, data: {
    status: string;
    progress_percentage: number;
    last_section_viewed: number;
  }) =>
    api.post(`/training/progress/${moduleId}`, data),

  submitQuiz: (moduleId: string, answers: string[]) =>
    api.post(`/training/quiz/${moduleId}`, { answers }),

  getProgressSummary: (path: 'operator' | 'technician') =>
    api.get<ProgressSummary>(`/training/progress/${path}`),

  generateCertificate: (path: 'operator' | 'technician') =>
    api.post<Certificate>(`/training/certificate/${path}`),

  getCertificates: () =>
    api.get<Certificate[]>('/training/certificates'),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) =>
    api.post('/auth/register', data),

  getProfile: () =>
    api.get('/auth/profile'),
};

export default api;
