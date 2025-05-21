
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProfileInfoProps {
  username: string;
  email?: string;
}

const ProfileInfo = ({ username, email }: ProfileInfoProps) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { success } = await authService.changeUsername({ username: newUsername });
      
      if (success) {
        await refreshUser();
        setIsEditingUsername(false);
        toast({
          title: "Username updated",
          description: "Your username has been changed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to update username:", error);
      toast({
        title: "Update failed",
        description: "Could not update your username",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-4">
        {isEditingUsername ? (
          <form onSubmit={handleChangeUsername} className="flex items-center space-x-2 flex-1">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="New username"
              className="max-w-[200px]"
              disabled={isUpdating}
              autoFocus
            />
            <Button 
              type="submit"
              size="sm" 
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditingUsername(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">{username}</h1>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8"
              onClick={() => {
                setNewUsername(username);
                setIsEditingUsername(true);
              }}
            >
              <Edit size={15} />
            </Button>
          </div>
        )}
      </div>
      
      {email && (
        <p className="text-muted-foreground mb-6">{email}</p>
      )}
    </div>
  );
};

export default ProfileInfo;
