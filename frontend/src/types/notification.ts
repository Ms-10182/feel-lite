export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'reply';
  userId: string;
  postId: string;
  commentId?: string;
  read: boolean;
  createdAt: string;
}