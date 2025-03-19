export interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  likes: number;
  hasLiked: boolean;
  parentId: string | null;
  replies: Comment[];
}

export interface CreatePostInput {
  content: string;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}