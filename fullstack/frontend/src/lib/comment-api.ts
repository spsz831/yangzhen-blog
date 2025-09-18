import { apiClient } from '@/lib/api';
import { Comment, CreateCommentRequest, PaginatedResponse, PaginationParams } from '@/types';

export const commentApi = {
  // 创建评论
  createComment: async (data: CreateCommentRequest) => {
    return apiClient.post<Comment>('/comments', data);
  },

  // 获取文章评论列表
  getCommentsByPost: async (postId: string, params?: PaginationParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return apiClient.get<PaginatedResponse<Comment>>(`/comments/post/${postId}${query ? `?${query}` : ''}`);
  },

  // 更新评论
  updateComment: async (id: string, content: string) => {
    return apiClient.put<Comment>(`/comments/${id}`, { content });
  },

  // 删除评论
  deleteComment: async (id: string) => {
    return apiClient.delete(`/comments/${id}`);
  },

  // 点赞/取消点赞评论
  toggleCommentLike: async (id: string) => {
    return apiClient.post<{ liked: boolean }>(`/comments/${id}/like`);
  },
};