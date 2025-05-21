
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  role: "user" | "moderator" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; username: string; age: number }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Checking auth status...");
        
        // Check if we have tokens in localStorage
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!accessToken && !refreshToken) {
          console.log("No tokens found in localStorage");
          setIsLoading(false);
          return;
        }
        
        // Try to get current user with accessToken
        const { success, data } = await authService.getCurrentUser();
        
        if (success && data?.user) {
          console.log("User authenticated:", data.user.username);
          setUser(data.user);
        } else if (refreshToken) {
          // If getCurrentUser fails but we have a refreshToken, try refreshing
          console.log("Using refresh token to restore session...");
          try {
            const refreshResult = await authService.refreshToken();
            
            if (refreshResult.success) {
              // If refresh successful, try to get the user info again
              const userData = await authService.getCurrentUser();
              
              if (userData.success && userData.data?.user) {
                setUser(userData.data.user);
                console.log("Authentication restored via refresh token");
              } else {
                // Still failed, clear tokens
                console.log("Failed to get user after refresh token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
              }
            } else {
              // Refresh failed, clear tokens
              console.log("Refresh token failed");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  // Set up token refresh interval
  useEffect(() => {
    if (!user) return;
    
    // Refresh token every 14 minutes to ensure it doesn't expire
    // Assuming JWT expires in 15 minutes
    const refreshInterval = setInterval(async () => {
      try {
        console.log("Attempting scheduled token refresh...");
        const { success } = await authService.refreshToken();
        
        if (!success) {
          // If refresh fails, log user out
          console.log("Scheduled token refresh failed, logging out...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        } else {
          console.log("Token refreshed successfully");
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      }
    }, 14 * 60 * 1000); // 14 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { success, data, error } = await authService.login({ email, password });
      
      if (success && data?.user) {
        setUser(data.user);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.username}`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: error?.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; username: string; age: number }) => {
    setIsLoading(true);
    try {
      const { success, data, error } = await authService.register(userData);
      
      if (success && data?.user) {
        setUser(data.user);
        toast({
          title: "Registration successful",
          description: "Your account has been created",
        });
        return true;
      } else {
        toast({
          title: "Registration failed",
          description: error?.message || "Could not create account",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  const refreshUser = async () => {
    try {
      const { success, data } = await authService.getCurrentUser();
      if (success && data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("User refresh failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
