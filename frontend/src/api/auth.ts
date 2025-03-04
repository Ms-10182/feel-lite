import api from './index';
import { AuthResponse, ApiResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', {
    email,
    password,
  });
  return response.data.data;
};

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', {
    email,
    password,
  });
  return response.data.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/api/auth/me');
  return response.data.data;
};