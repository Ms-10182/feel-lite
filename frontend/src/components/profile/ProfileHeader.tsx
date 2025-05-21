
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  username: string;
  avatarUrl: string;
  coverImage: string;
}

const ProfileHeader = ({ username, avatarUrl, coverImage }: ProfileHeaderProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  
  // Avatar and cover image upload refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);
    
    setIsUpdating(true);
    
    try {
      const { success } = await authService.updateAvatar(formData);
      
      if (success) {
        await refreshUser();
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated",
        });
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast({
        title: "Update failed",
        description: "Could not update your profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("coverImage", file);
    
    setIsUpdating(true);
    
    try {
      const { success } = await authService.updateCoverImage(formData);
      
      if (success) {
        await refreshUser();
        toast({
          title: "Cover image updated",
          description: "Your cover image has been updated",
        });
      }
    } catch (error) {
      console.error("Failed to update cover image:", error);
      toast({
        title: "Update failed",
        description: "Could not update your cover image",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="relative h-48 md:h-64 w-full rounded-lg overflow-hidden mb-16">
      <img 
        src={coverImage} 
        alt="Cover" 
        className="w-full h-full object-cover"
      />
      <Button 
        size="icon" 
        variant="secondary" 
        className="absolute top-4 right-4 rounded-full opacity-80 hover:opacity-100"
        onClick={() => coverInputRef.current?.click()}
        disabled={isUpdating}
      >
        <Camera size={18} />
      </Button>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
        ref={coverInputRef}
      />
      
      {/* Avatar positioned at the bottom of the cover image */}
      <div className="absolute -bottom-12 left-6 border-4 border-background rounded-full">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-background">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUpdating}
          >
            <Camera size={14} />
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            ref={avatarInputRef}
          />
        </div>
      </div>
      
      {/* Theme toggle and edit button */}
      <div className="absolute top-4 left-4 flex space-x-2">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default ProfileHeader;
