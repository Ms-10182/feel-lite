import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Reply } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Comment } from '../../types';
import { getComments, addComment, likeComment } from '../../api/posts';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onCommentAdded: (newCommentCount: number) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  postId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedComments = await getComments(postId);
      
      // Organize comments into a nested structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];
      
      // First pass: create a map of all comments
      fetchedComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });
      
      // Second pass: organize into parent-child relationships
      fetchedComments.forEach(comment => {
        const processedComment = commentMap.get(comment.id)!;
        
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            if (!parent.replies) {
              parent.replies = [];
            }
            parent.replies.push(processedComment);
          } else {
            rootComments.push(processedComment);
          }
        } else {
          rootComments.push(processedComment);
        }
      });
      
      setComments(rootComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const parentId = replyTo ? replyTo.id : undefined;
      await addComment(postId, newComment, parentId);
      
      // Refresh comments
      await fetchComments();
      
      // Update comment count in parent component
      onCommentAdded(comments.length + 1);
      
      // Reset form
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await likeComment(commentId);
      
      // Update the comment in our state
      const updateCommentLike = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: response.isLiked,
              likesCount: response.likesCount,
            };
          }
          
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLike(comment.replies),
            };
          }
          
          return comment;
        });
      };
      
      setComments(updateCommentLike(comments));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const CommentItem: React.FC<{ comment: Comment; level?: number }> = ({ comment, level = 0 }) => {
    return (
      <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''} mb-4`}>
        <div className="flex items-start space-x-3">
          <Avatar src={comment.avatar} alt={comment.username} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{comment.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center space-x-1 text-xs ${
                  comment.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                } hover:text-red-500 transition-colors`}
              >
                <Heart size={14} className={comment.isLiked ? 'fill-current' : ''} />
                <span>{comment.likesCount}</span>
              </button>
              
              <button
                onClick={() => setReplyTo(comment)}
                className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <Reply size={14} />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comments"
      size="lg"
    >
      <div className="max-h-[60vh] overflow-y-auto mb-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        )}
        
        {error && (
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmitComment} className="mt-4">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Replying to <span className="font-medium">{replyTo.username}</span>
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !newComment.trim()}
          >
            Post
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CommentModal;