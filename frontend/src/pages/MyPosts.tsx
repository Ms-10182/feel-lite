
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Post, { PostProps } from "@/components/post/Post";
import CreatePost from "@/components/post/CreatePost";
import { MessageSquare } from "lucide-react";
import { postService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const MyPosts = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [myPosts, setMyPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const response = await postService.getUserPosts(user._id);
        
        if (response.success) {
          // Transform the data to match our PostProps format
          const formattedPosts = response.data.docs?.map((post: any) => ({
            id: post._id,
            username: post.owner?.username || 'Anonymous',
            content: post.content,
            images: post.images || [],
            timestamp: new Date(post.createdAt),
            likes: post.likesCount || 0,
            comments: post.comments || [],
            isLiked: post.isLiked || false,
            isBookmarked: post.isBookmarked || false,
          })) || [];
          
          setMyPosts(formattedPosts);
        } else {
          setError(response.error?.message || 'Could not fetch posts');
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [user?._id]);
  
  const handleCreatePost = async (content: string, images: string[]) => {
    // This function will be called after successful post creation in CreatePost component
    // Refresh the posts list
    if (user?._id) {
      const response = await postService.getUserPosts(user._id);
      if (response.success) {
        const formattedPosts = response.data.docs?.map((post: any) => ({
          id: post._id,
          username: post.owner?.username || 'Anonymous',
          content: post.content,
          images: post.images || [],
          timestamp: new Date(post.createdAt),
          likes: post.likesCount || 0,
          comments: post.comments || [],
          isLiked: post.isLiked || false,
          isBookmarked: post.isBookmarked || false,
        })) || [];
        
        setMyPosts(formattedPosts);
      }
    }
  };
    return (
    <>
      <Layout onCreatePost={() => setIsCreatePostOpen(true)}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <MessageSquare className="mr-2" /> My Posts
            </h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading posts...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : myPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-medium mb-2">No posts yet</h2>
              <p className="text-muted-foreground mb-6">
                Share your thoughts anonymously
              </p>
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Create your first post
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myPosts.map((post) => (
                <Post key={post.id} {...post} />
              ))}
            </div>
          )}
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

export default MyPosts;
