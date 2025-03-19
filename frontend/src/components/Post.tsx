import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Post as PostType, Comment } from '../types/post';
import { Heart, MessageCircle } from 'lucide-react';
import { CommentList } from './CommentList';

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/posts/${post.id}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const createComment = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/posts/${post.id}/comments`, { content });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setComment('');
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      createComment.mutate(comment);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <p className="text-gray-800 mb-4">{post.content}</p>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => toggleLike.mutate()}
          className={`flex items-center gap-1 ${
            post.hasLiked ? 'text-red-500' : 'text-gray-500'
          } hover:text-red-500`}
        >
          <Heart size={20} fill={post.hasLiked ? 'currentColor' : 'none'} />
          <span>{post.likes}</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
        >
          <MessageCircle size={20} />
          <span>{post.comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <form onSubmit={handleSubmitComment} className="mb-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          
          <CommentList comments={post.comments} postId={post.id} />
        </div>
      )}
    </div>
  );
}