import api from './index';
import { Post, ApiResponse, Comment } from '../types';

export const getFeed = async (page = 1, limit = 10): Promise<Post[]> => {
  const response = await api.get<ApiResponse<Post[]>>(`/api/feed?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const createPost = async (content: string): Promise<Post> => {
  const response = await api.post<ApiResponse<Post>>('/api/post/create', { content });
  return response.data.data;
};

export const likePost = async (postId: string): Promise<{ likesCount: number; isLiked: boolean }> => {
  const response = await api.post<ApiResponse<{ likesCount: number; isLiked: boolean }>>(`/api/like/${postId}`);
  return response.data.data;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  const response = await api.get<ApiResponse<Comment[]>>(`/api/comment/${postId}`);
  return response.data.data;
};

export const addComment = async (postId: string, content: string, parentId?: string): Promise<Comment> => {
  const response = await api.post<ApiResponse<Comment>>('/api/comment/add', {
    postId,
    content,
    parentId,
  });
  return response.data.data;
};

export const likeComment = async (commentId: string): Promise<{ likesCount: number; isLiked: boolean }> => {
  const response = await api.post<ApiResponse<{ likesCount: number; isLiked: boolean }>>(`/api/comment/like/${commentId}`);
  return response.data.data;
};