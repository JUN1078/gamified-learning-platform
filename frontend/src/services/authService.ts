import api from './api';
import { User, ApiResponse } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return data.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData
    );
    return data.data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
