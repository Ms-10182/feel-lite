export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  coverImage: string;
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  avatar: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  avatar: string;
  likesCount: number;
  isLiked: boolean;
  parentId: string | null;
  replies?: Comment[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}