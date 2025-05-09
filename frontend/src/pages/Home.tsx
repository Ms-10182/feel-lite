import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Post as PostType } from '../types/post';
import { CreatePost } from '../components/CreatePost';
import { Post } from '../components/Post';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { Bell, Bookmark, Home as HomeIcon, LogOut, TrendingUp as Trending, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

type FeedType = 'dashboard' | 'for-you' | 'trending';

export function Home() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [feedType, setFeedType] = useState<FeedType>('dashboard');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const { data: posts = [] } = useQuery<PostType[]>({
    queryKey: ['posts', feedType],
    queryFn: async () => {
      const { data } = await api.get(`/posts?feed=${feedType}`);
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow fixed top-0 left-0 right-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setFeedType('dashboard')}
              className={`flex items-center gap-2 ${
                feedType === 'dashboard' ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              <HomeIcon size={24} />
              <span className="font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => setFeedType('for-you')}
              className={`flex items-center gap-2 ${
                feedType === 'for-you' ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              <User size={24} />
              <span className="font-medium">For You</span>
            </button>
            <button
              onClick={() => setFeedType('trending')}
              className={`flex items-center gap-2 ${
                feedType === 'trending' ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              <Trending size={24} />
              <span className="font-medium">Trending</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-600 hover:text-blue-500 relative"
            >
              <Bell size={24} />
            </button>
            <div className="relative group">
              <button className="text-gray-600 hover:text-blue-500">
                <User size={24} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                <a
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <User size={20} />
                  Profile
                </a>
                <a
                  href="/bookmarks"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Bookmark size={20} />
                  Bookmarks
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-20">
        <div className="relative">
          <CreatePost />
          <div className="space-y-4">
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>

          {showNotifications && (
            <div className="fixed top-16 right-4">
              <NotificationsPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}