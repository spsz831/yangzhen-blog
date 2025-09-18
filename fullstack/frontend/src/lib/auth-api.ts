import { apiClient } from '@/lib/api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  PaginatedResponse,
  PaginationParams
} from '@/types';

export const authApi = {
  // 用户注册
  register: async (data: RegisterRequest) => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  // 用户登录
  login: async (data: LoginRequest) => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  // 刷新 Token
  refreshToken: async (refreshToken: string) => {
    return apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    });
  },

  // 获取用户信息
  getProfile: async () => {
    return apiClient.get<User>('/auth/profile');
  },

  // 更新用户信息
  updateProfile: async (data: Partial<Pick<User, 'displayName' | 'bio' | 'avatar'>>) => {
    return apiClient.put<User>('/auth/profile', data);
  },

  // 验证 Token
  verifyToken: async () => {
    return apiClient.get<{ user: User; valid: boolean }>('/auth/verify');
  },
};

export const userApi = {
  // 获取用户列表 (管理员)
  getUsers: async (params?: PaginationParams & { search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return apiClient.get<PaginatedResponse<User>>(`/users${query ? `?${query}` : ''}`);
  },

  // 通过用户名获取用户
  getUserByUsername: async (username: string) => {
    return apiClient.get<{ user: User; recentPosts: any[] }>(`/users/username/${username}`);
  },

  // 通过 ID 获取用户
  getUserById: async (id: string) => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // 切换用户状态 (管理员)
  toggleUserStatus: async (id: string) => {
    return apiClient.patch<User>(`/users/${id}/toggle-status`);
  },
};