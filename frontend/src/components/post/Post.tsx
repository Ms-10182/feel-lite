
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Bookmark, Heart, MessageSquare, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import TimeAgo from "../utils/TimeAgo";
import CommentSection from "./CommentSection";

export interface PostProps {
  id: string;
  username: string;
  content: string;
  images?: string[];
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
}

export interface Comment {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
}

const Post = ({
  id,
  username,
  content,
  images = [],
  timestamp,
  likes,
  comments,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onBookmark
}: PostProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
  
  const handleLike = () => {
    if (onLike) {
      onLike();
    } else {
      if (liked) {
        setLikeCount(likeCount - 1);
      } else {
        setLikeCount(likeCount + 1);
      }
      setLiked(!liked);
    }
  };
  
  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark();
    } else {
      setBookmarked(!bookmarked);
    }
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  // Extract hashtags from content for highlighting
  const renderContent = () => {
    if (!content) return null;
    
    // Split content by hashtags and render them differently
    const parts = content.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-primary font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card className="mb-6 overflow-hidden animate-fade-in glass-card">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start space-y-0 space-x-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{username}</p>
              <TimeAgo date={timestamp} className="text-xs text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Hide</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-3">
        {content && <p className="whitespace-pre-wrap mb-3">{renderContent()}</p>}
        
        {images.length > 0 && (
          <div className="relative rounded-md overflow-hidden">
            <img 
              src={images[currentImageIndex]} 
              alt={`Post image ${currentImageIndex + 1}`}
              className="w-full object-contain max-h-96"
            />
            
            {images.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
                  onClick={prevImage}
                >
                  &lt;
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
                  onClick={nextImage}
                >
                  &gt;
                </Button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-2 w-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-2 border-t flex justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 h-8 px-2"
            onClick={handleLike}
          >
            <Heart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : ""}
            />
            <span>{likeCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 h-8 px-2"
            onClick={toggleComments}
          >
            <MessageSquare size={18} />
            <span>{comments.length}</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleBookmark}
        >
          <Bookmark
            size={18}
            className={bookmarked ? "fill-primary text-primary" : ""}
          />
        </Button>
      </CardFooter>
      
      {showComments && <CommentSection postId={id} comments={comments} />}
    </Card>
  );
};

export default Post;
