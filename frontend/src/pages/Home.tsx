import React from 'react';
import Layout from '../components/layout/Layout';
import PostFeed from '../components/post/PostFeed';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
      <PostFeed />
    </Layout>
  );
};

export default Home;