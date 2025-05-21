
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";
  
  useEffect(() => {
    console.log(`Login page: isAuthenticated=${isAuthenticated}, isLoading=${isLoading}`);
    console.log(`Will redirect to: ${from} after login`);
  }, [isAuthenticated, isLoading, from]);
  
  // If user is already logged in, redirect to home or the page they were trying to access
  if (isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }

  return (
    <Layout onCreatePost={() => {}}>
      <div className="max-w-lg mx-auto py-8">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome to Feel-Lite</h1>
        <LoginForm />
        {location.state?.from && (
          <p className="text-sm text-center mt-4 text-muted-foreground">
            You'll be redirected back to your previous page after login.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default Login;
