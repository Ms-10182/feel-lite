
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Post, { PostProps } from "@/components/post/Post";
import CreatePost from "@/components/post/CreatePost";
import { useAuth } from "@/contexts/AuthContext";
import { postService, likeService, bookmarkService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      const { success, data } = await postService.getPosts(10, pageNum);
      
      if (success && data?.posts) {
        // Transform API response to match our PostProps interface
        const transformedPosts: PostProps[] = data.posts.map((post: any) => ({
          id: post._id,
          username: post.owner.username,
          content: post.content,
          images: post.images || [],
          timestamp: new Date(post.createdAt),
          likes: post.likeCount || 0,
          comments: post.comments || [],
          isLiked: post.isLiked || false,
          isBookmarked: post.isBookmarked || false,
        }));
        
        if (append) {
          setPosts(prev => [...prev, ...transformedPosts]);
        } else {
          setPosts(transformedPosts);
        }
        
        // Check if we have more posts to load
        setHasMore(transformedPosts.length === 10);
      } else {
        toast({
          title: "Couldn't load posts",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const handleCreatePost = async (content: string, images: string[]) => {
    // The actual post creation is done in the CreatePost component
    // Here we just refresh the posts list
    fetchPosts();
  };
  
  const handleLikePost = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await likeService.unlikePost(postId);
      } else {
        await likeService.likePost(postId);
      }
      
      // Update the post in the state
      setPosts(posts.map(post => 
        post.id === postId ? {
          ...post,
          isLiked: !isLiked,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        } : post
      ));
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike post",
        variant: "destructive",
      });
    }
  };
  
  const handleBookmarkPost = async (postId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await bookmarkService.unbookmarkPost(postId);
      } else {
        await bookmarkService.bookmarkPost(postId);
      }
      
      // Update the post in the state
      setPosts(posts.map(post => 
        post.id === postId ? {
          ...post,
          isBookmarked: !isBookmarked
        } : post
      ));
    } catch (error) {
      console.error("Error bookmarking/unbookmarking post:", error);
      toast({
        title: "Error",
        description: "Failed to bookmark/unbookmark post",
        variant: "destructive",
      });
    }
  };
  
  const loadMorePosts = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  return (
    <>
      <Layout onCreatePost={() => setIsCreatePostOpen(true)}>
        <div className="max-w-xl mx-auto">
          <h1 className="sr-only">Feel-Lite Feed</h1>
          
          {isLoading && posts.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-lg font-medium mb-2">No posts yet</h2>
              <p className="text-muted-foreground mb-6">
                Be the first to create a post!
              </p>
              <Button onClick={() => setIsCreatePostOpen(true)}>
                Create your first post
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Post 
                  key={post.id} 
                  {...post} 
                  onLike={() => handleLikePost(post.id, post.isLiked || false)}
                  onBookmark={() => handleBookmarkPost(post.id, post.isBookmarked || false)}
                />
              ))}
              
              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={loadMorePosts}
                    disabled={isLoading}
                    className="w-full max-w-[200px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
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

export default Index;
