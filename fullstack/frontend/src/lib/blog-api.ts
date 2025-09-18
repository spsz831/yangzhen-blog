import { apiClient } from '@/lib/api';
import {
  Post,
  Category,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  PaginatedResponse
} from '@/types';

export const postApi = {
  // 创建文章
  createPost: async (data: CreatePostRequest) => {
    return apiClient.post<Post>('/posts', data);
  },

  // 获取文章列表
  getPosts: async (filters?: PostFilters) => {
    const searchParams = new URLSearchParams();

    if (filters?.page) searchParams.append('page', filters.page.toString());
    if (filters?.limit) searchParams.append('limit', filters.limit.toString());
    if (filters?.sortBy) searchParams.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) searchParams.append('sortOrder', filters.sortOrder);
    if (filters?.search) searchParams.append('search', filters.search);
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.tag) searchParams.append('tag', filters.tag);
    if (filters?.published !== undefined) searchParams.append('published', filters.published.toString());
    if (filters?.featured !== undefined) searchParams.append('featured', filters.featured.toString());
    if (filters?.author) searchParams.append('author', filters.author);

    const query = searchParams.toString();
    return apiClient.get<PaginatedResponse<Post>>(`/posts${query ? `?${query}` : ''}`);
  },

  // 通过 slug 获取文章
  getPostBySlug: async (slug: string) => {
    return apiClient.get<Post>(`/posts/${slug}`);
  },

  // 更新文章
  updatePost: async (id: string, data: Partial<CreatePostRequest>) => {
    return apiClient.put<Post>(`/posts/${id}`, data);
  },

  // 删除文章
  deletePost: async (id: string) => {
    return apiClient.delete(`/posts/${id}`);
  },

  // 点赞/取消点赞文章
  toggleLike: async (id: string) => {
    return apiClient.post<{ liked: boolean }>(`/posts/${id}/like`);
  },
};

export const categoryApi = {
  // 创建分类 (管理员)
  createCategory: async (data: { name: string; description?: string; color?: string }) => {
    return apiClient.post<Category>('/categories', data);
  },

  // 获取分类列表
  getCategories: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get<PaginatedResponse<Category>>(`/categories${query ? `?${query}` : ''}`);
  },

  // 通过 slug 获取分类
  getCategoryBySlug: async (slug: string) => {
    return apiClient.get<Category & { posts: Post[] }>(`/categories/${slug}`);
  },

  // 更新分类 (管理员)
  updateCategory: async (id: string, data: { name?: string; description?: string; color?: string }) => {
    return apiClient.put<Category>(`/categories/${id}`, data);
  },

  // 删除分类 (管理员)
  deleteCategory: async (id: string) => {
    return apiClient.delete(`/categories/${id}`);
  },
};