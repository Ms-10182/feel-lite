import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import PostCard from './PostCard';
import PostForm from './PostForm';
import Button from '../ui/Button';
import { getFeed } from '../../api/posts';
import { Post } from '../../types';

const PostFeed: React.FC = () => {
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => getFeed(pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    
    if (element) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      });
      
      observerRef.current.observe(element);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const handlePostCreated = (newPost: Post) => {
    refetch();
  };

  const handlePostUpdate = (updatedPost: Post) => {
    // This would ideally update the post in the cache
    // For simplicity, we're not implementing the full cache update logic
  };

  const allPosts = data?.pages.flat() || [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-900 py-3 mb-4">
        <Button
          onClick={() => setIsPostFormOpen(true)}
          fullWidth
          className="flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Create Post</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-red-500">
          Error loading posts. Please try again.
        </div>
      ) : allPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No posts yet. Be the first to post!
        </div>
      ) : (
        <>
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdate={handlePostUpdate} />
          ))}
          
          {hasNextPage && (
            <div ref={loadMoreRef} className="py-4 text-center">
              {isFetchingNextPage ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Loading more posts...</p>
              )}
            </div>
          )}
          
          {!hasNextPage && allPosts.length > 0 && (
            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
              You've reached the end!
            </div>
          )}
        </>
      )}

      <PostForm
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default PostFeed;