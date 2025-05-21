
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoader, setShowLoader] = useState(true);
  const location = useLocation();
  
  // Add a slight delay before showing loader to prevent flashing on quick auth checks
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(isLoading);
    }, 500); // Only show loader if isLoading for more than 500ms
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Debug info
  useEffect(() => {
    console.log(`ProtectedRoute (${location.pathname}): isAuthenticated=${isAuthenticated}, isLoading=${isLoading}`);
  }, [isAuthenticated, isLoading, location]);
  
  // Show loading state while checking authentication
  if (showLoader && isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
