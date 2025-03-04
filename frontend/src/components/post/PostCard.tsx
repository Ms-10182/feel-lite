import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Post } from '../../types';
import { likePost } from '../../api/posts';
import CommentModal from './CommentModal';

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      
      const response = await likePost(post.id);
      
      // Update with actual server response
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
      
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          isLiked: response.isLiked,
          likesCount: response.likesCount,
        });
      }
    } catch (error) {
      // Revert on error
      console.error('Failed to like post:', error);
      setIsLiked(post.isLiked);
      setLikesCount(post.likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar src={post.avatar} alt={post.username} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900 dark:text-gray-100">{post.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-line">{post.content}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            } hover:text-red-500 transition-colors`}
            disabled={isLiking}
          >
            <Heart
              size={18}
              className={isLiked ? 'fill-current' : ''}
            />
            <span>{likesCount}</span>
          </button>
          
          <button
            onClick={toggleComments}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
          >
            <MessageCircle size={18} />
            <span>{post.commentsCount}</span>
          </button>
          
          <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">
            <Share size={18} />
          </button>
        </div>
      </div>
      
      <CommentModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        postId={post.id}
        onCommentAdded={(newCount) => {
          if (onPostUpdate) {
            onPostUpdate({
              ...post,
              commentsCount: newCount,
            });
          }
        }}
      />
    </motion.div>
  );
};

export default PostCard;