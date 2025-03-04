import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Predefined avatars and cover images
const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
];

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554034483-04fda0d3507b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
];

const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-64 rounded-xl overflow-hidden relative">
            <img
              src={user?.coverImage || COVER_IMAGES[0]}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setIsEditingCover(true)}
              className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <Avatar
                src={user?.avatar || AVATARS[0]}
                alt={user?.username || 'User'}
                size="xl"
                className="border-4 border-white dark:border-gray-800 shadow-lg"
              />
              <button
                onClick={() => setIsEditingAvatar(true)}
                className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Camera size={16} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-16 px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.username}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Anonymous User</p>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Posts</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">0</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Comments</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">0</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Likes</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">0</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Avatar Selection Modal */}
        {isEditingAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Choose Avatar</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {AVATARS.map((avatar, index) => (
                    <button
                      key={index}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsEditingAvatar(false)}
                    >
                      <Avatar src={avatar} alt={`Avatar ${index + 1}`} size="lg" />
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setIsEditingAvatar(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Cover Image Selection Modal */}
        {isEditingCover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Choose Cover Image</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {COVER_IMAGES.map((cover, index) => (
                    <button
                      key={index}
                      className="rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                      onClick={() => setIsEditingCover(false)}
                    >
                      <img src={cover} alt={`Cover ${index + 1}`} className="w-full h-32 object-cover" />
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setIsEditingCover(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;