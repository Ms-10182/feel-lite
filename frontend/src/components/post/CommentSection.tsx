
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "./Post";
import { Heart } from "lucide-react";
import TimeAgo from "../utils/TimeAgo";
import { commentService, likeService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection = ({ postId, comments }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get user info for the commenter
  const username = user?.username || "anonymous_user";
  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
  
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    setIsSubmitting(true);
    
    try {
      const { success, data } = await commentService.addComment(postId, newComment);
      
      if (success && data?.comment) {
        // Transform API response to match our Comment interface
        const comment: Comment = {
          id: data.comment._id,
          username: data.comment.owner.username,
          content: data.comment.content,
          timestamp: new Date(data.comment.createdAt),
          likes: data.comment.likeCount || 0,
          isLiked: false,
        };
        
        setLocalComments([comment, ...localComments]);
        setNewComment("");
      } else {
        toast({
          title: "Failed to add comment",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
    const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      // Use toggle endpoint instead of separate like/unlike methods
      await likeService.likeComment(commentId);
      
      // Update comment in state
      setLocalComments(
        localComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking/unliking comment:", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-t px-4 py-3">
      <div className="flex items-start space-x-2 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <Button
            onClick={handleAddComment}
            size="sm"
            disabled={newComment.trim() === "" || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {localComments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-2">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${comment.username}`}
                alt={comment.username}
              />
              <AvatarFallback>{comment.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-secondary/50 rounded-md p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">{comment.username}</span>
                  <TimeAgo
                    date={comment.timestamp}
                    className="text-xs text-muted-foreground"
                  />
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
              <div className="flex items-center mt-1 ml-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => handleLikeComment(comment.id, Boolean(comment.isLiked))}
                >
                  <Heart
                    size={14}
                    className={
                      comment.isLiked ? "fill-red-500 text-red-500" : ""
                    }
                  />
                  <span className="ml-1 text-xs">{comment.likes}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
