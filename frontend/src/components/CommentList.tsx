import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Comment } from '../types/post';
import { Heart, Reply } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
  postId: string;
  parentId?: string;
}

export function CommentList({ comments, postId, parentId }: CommentListProps) {
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [showReplyForm, setShowReplyForm] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await api.post(`/comments/${commentId}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const createReply = useMutation({
    mutationFn: async ({
      content,
      commentId,
    }: {
      content: string;
      commentId: string;
    }) => {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content,
        parentId: commentId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setReplyContent({});
      setShowReplyForm({});
    },
  });

  const handleSubmitReply = (commentId: string) => {
    const content = replyContent[commentId];
    if (content?.trim()) {
      createReply.mutate({ content, commentId });
    }
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="pl-4 border-l-2 border-gray-200">
          <div className="mb-2">
            <p className="text-gray-800">{comment.content}</p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => toggleLike.mutate(comment.id)}
                className={`flex items-center gap-1 ${
                  comment.hasLiked ? 'text-red-500' : 'text-gray-500'
                } hover:text-red-500`}
              >
                <Heart
                  size={16}
                  fill={comment.hasLiked ? 'currentColor' : 'none'}
                />
                <span className="text-sm">{comment.likes}</span>
              </button>

              <button
                onClick={() =>
                  setShowReplyForm((prev) => ({
                    ...prev,
                    [comment.id]: !prev[comment.id],
                  }))
                }
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
              >
                <Reply size={16} />
                <span className="text-sm">Reply</span>
              </button>
            </div>
          </div>

          {showReplyForm[comment.id] && (
            <div className="mb-4">
              <input
                type="text"
                value={replyContent[comment.id] || ''}
                onChange={(e) =>
                  setReplyContent((prev) => ({
                    ...prev,
                    [comment.id]: e.target.value,
                  }))
                }
                placeholder="Write a reply..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitReply(comment.id);
                  }
                }}
              />
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-2">
              <CommentList
                comments={comment.replies}
                postId={postId}
                parentId={comment.id}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}