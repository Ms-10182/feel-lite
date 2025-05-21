
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Post, { PostProps } from "@/components/post/Post";
import CreatePost from "@/components/post/CreatePost";
import { Bookmark, Loader2 } from "lucide-react";
import { bookmarkService, apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Bookmarks = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      
      // Get all bookmarks first
      const bookmarksResponse = await bookmarkService.getBookmarks();
      
      if (!bookmarksResponse.success || !bookmarksResponse.data?.length) {
        setBookmarkedPosts([]);
        return;
      }      
      // Use the first bookmark to get posts
      const bookmarkId = bookmarksResponse.data[0]._id;
      const postsResponse = await bookmarkService.getBookmarkedPosts(bookmarkId);
      
      if (postsResponse.success) {
        // Transform the data to match our PostProps format
        const formattedPosts = postsResponse.data.docs?.map((post: any) => ({
          id: post._id,
          username: post.owner?.username || 'Anonymous',
          content: post.content,
          images: post.images || [],
          timestamp: new Date(post.createdAt),
          likes: post.likesCount || 0,
          comments: post.comments || [],
          isLiked: post.isLiked || false,
          isBookmarked: true,
        })) || [];
        
        setBookmarkedPosts(formattedPosts);
      } else {
        setError(postsResponse.error?.message || 'Could not fetch bookmarked posts');
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?._id) {
      fetchBookmarks();
    }
  }, [user?._id]);
  
  const handleCreatePost = (content: string, images: string[]) => {
    // Post creation is handled by CreatePost component
    // After successful post creation, refetch bookmarks
    if (user?._id) {
      fetchBookmarks();
    }
  };
    return (
    <>
      <Layout onCreatePost={() => setIsCreatePostOpen(true)}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Bookmark className="mr-2" /> Bookmarks
            </h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading bookmarks...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <button 
                onClick={() => fetchBookmarks()} 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : bookmarkedPosts.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-medium mb-2">No bookmarks yet</h2>
              <p className="text-muted-foreground mb-6">
                Save posts to find them easily later
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookmarkedPosts.map((post) => (
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

export default Bookmarks;
