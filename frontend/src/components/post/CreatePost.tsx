
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { postService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, images: string[]) => void;
}

const CreatePost = ({ isOpen, onClose, onSubmit }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const maxChars = 280;
  const maxImages = 5;
  
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxChars) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };
  
  const handleSubmit = async () => {
    if (content.trim() === "" && images.length === 0) {
      toast({
        title: "Empty post",
        description: "Please write something or add an image before posting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData to send to the API
      const formData = new FormData();
      formData.append("content", content);

      // Extract hashtags from content
      const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
      hashtags.forEach((tag) => {
        formData.append("tags", tag.substring(1)); // Remove the # symbol
      });
      
      // Add image files
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
      
      const { success, data } = await postService.createPost(formData);
      
      if (success) {
        // Pass the post data from the API response to the onSubmit callback
        onSubmit(content, images);
        setContent("");
        setCharCount(0);
        setImages([]);
        setImageFiles([]);
        onClose();
        
        toast({
          title: "Post created",
          description: "Your post has been shared!",
        });
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Failed to create post",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images per post.`,
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [...prev, e.target!.result as string]);
          setImageFiles(prev => [...prev, file]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Get user info for the post creator
  const username = user?.username || "anonymous_user";
  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>
        <div className="flex items-start space-x-3 pt-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <span className="text-sm font-medium">{username}</span>
            <Textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={content}
              onChange={handleContentChange}
              className="mt-2 min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group aspect-square rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Uploaded ${index + 1}`}
                      className="object-cover h-full w-full" 
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                disabled={images.length >= maxImages || isSubmitting}
                className={cn(
                  "flex items-center gap-2",
                  images.length >= maxImages && "opacity-50 cursor-not-allowed"
                )}
              >
                <ImagePlus size={18} />
                <span>Add Photos</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting}
              />
              <span className={`text-xs ${charCount >= maxChars * 0.8 ? "text-amber-500" : "text-muted-foreground"}`}>
                {charCount}/{maxChars}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground mt-1">
              {images.length > 0 && (
                <p>{images.length} of {maxImages} images</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
