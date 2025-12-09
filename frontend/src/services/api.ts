import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type {
  AuthResponse,
  RegisterData,
  LoginData,
  User,
  DiscoverUser,
  Match,
  Message,
  SwipeData,
  SwipeResponse
} from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// User management
export const userAPI = {
  getUserProfile: async (userId: number): Promise<{ user: DiscoverUser }> => {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadPhoto: async (photoData: string): Promise<{ message: string; photos: string[] }> => {
    const response = await api.post('/users/upload-photo', { photoData });
    return response.data;
  },

  deletePhoto: async (photoIndex: number): Promise<{ message: string; photos: string[] }> => {
    const response = await api.delete(`/users/photo/${photoIndex}`);
    return response.data;
  }
};

// Swipe and matching
export const swipeAPI = {
  getDiscoverUsers: async (limit?: number): Promise<{ users: DiscoverUser[]; count: number }> => {
    const response = await api.get('/discover', { params: { limit } });
    return response.data;
  },

  swipe: async (data: SwipeData): Promise<SwipeResponse> => {
    const response = await api.post('/swipe', data);
    return response.data;
  },

  getMatches: async (): Promise<{ matches: Match[]; count: number }> => {
    const response = await api.get('/matches');
    return response.data;
  },

  unmatch: async (matchId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/matches/${matchId}`);
    return response.data;
  }
};

// Messages
export const messageAPI = {
  getMessages: async (matchId: number, limit?: number, offset?: number): Promise<{ messages: Message[]; count: number }> => {
    const response = await api.get(`/messages/${matchId}`, {
      params: { limit, offset }
    });
    return response.data;
  },

  sendMessage: async (matchId: number, messageText: string): Promise<{ message: string; data: Message }> => {
    const response = await api.post('/messages', { matchId, messageText });
    return response.data;
  },

  markAsRead: async (messageId: number): Promise<{ message: string }> => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  deleteMessage: async (messageId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }
};

export default api;
