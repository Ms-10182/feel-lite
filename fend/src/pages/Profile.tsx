
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import CreatePost from "@/components/post/CreatePost";
import { useAuth } from "@/contexts/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import AccountInfoCard from "@/components/profile/AccountInfoCard";

const Profile = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { user } = useAuth();
  
  // Handle user data and default values
  const username = user?.username || "User";
  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
  const coverImage = user?.coverImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

  const handleCreatePost = (content: string, images: string[]) => {
    // Post handling is done in CreatePost component
  };

  return (
    <>
      <Layout onCreatePost={() => setIsCreatePostOpen(true)}>
        <div className="max-w-3xl mx-auto">
          {/* Cover Image and Avatar */}
          <ProfileHeader 
            username={username}
            avatarUrl={avatarUrl}
            coverImage={coverImage}
          />
          
          {/* User Info Section */}
          <ProfileInfo 
            username={username}
            email={user?.email}
          />
          
          {/* Profile Content */}
          <div className="px-6">
            <AccountInfoCard
              username={username}
              email={user?.email}
              role={user?.role}
              onEditProfile={() => setIsCreatePostOpen(true)}
            />
          </div>
        </div>
      </Layout>
      
      <CreatePost
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePost}
      />
    </>
  );
};

export default Profile;
