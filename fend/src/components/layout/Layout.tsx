
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  onCreatePost: () => void;
  requireAuth?: boolean;
}

const Layout = ({ children, onCreatePost, requireAuth = false }: LayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onCreatePost={onCreatePost} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-6">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
