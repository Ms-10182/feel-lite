import { toast } from "@/hooks/use-toast";

const API_BASE_URL = "/api/v1";

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  includeCredentials?: boolean;
}

/**
 * Base API request function with error handling
 */
export const apiRequest = async (endpoint: string, options: ApiOptions = {}) => {
  const { 
    method = "GET", 
    body, 
    headers = {}, 
    includeCredentials = true 
  } = options;  try {
    // Get auth token from localStorage if available
    const accessToken = localStorage.getItem("accessToken");
    
    const requestHeaders = {
      "Content-Type": "application/json",
      ...headers
    };
    
    // Add Authorization header if token exists and not already set
    if (accessToken && !requestHeaders["Authorization"]) {
      requestHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: includeCredentials ? "include" : "omit"
    };

    if (body) {
      if (body instanceof FormData) {
        // For FormData, remove Content-Type to let browser set it with boundary
        delete config.headers["Content-Type"];
        config.body = body;
      } else if (method !== "GET") {
        config.body = JSON.stringify(body);
      }
    }

    console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      data = { message: "Server returned non-JSON response" };
    }
    
    console.log(`API Response (${response.status}):`, data);    if (!response.ok) {
      // Check if unauthorized (401) due to expired token
      if (response.status === 401 && endpoint !== "/users/loginUsingRefreshToken") {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Attempt token refresh if refresh token exists
        if (refreshToken) {
          try {
            console.log("Trying to refresh token due to 401...");
            
            // Call refresh token directly, not through apiRequest to avoid recursion
            const refreshResponse = await fetch(`${API_BASE_URL}/users/loginUsingRefreshToken`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${refreshToken}`
              },
              credentials: "include"
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              
              // Store new tokens
              if (refreshData.data?.accessToken) {
                localStorage.setItem("accessToken", refreshData.data.accessToken);
                localStorage.setItem("refreshToken", refreshData.data.refreshToken);
                
                // Retry the original request with new token
                console.log("Token refreshed, retrying original request...");
                return apiRequest(endpoint, options);
              }
            } else {
              // If refresh fails, clear tokens
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          } catch (error) {
            console.error("Token refresh failed:", error);
          }
        }
      }
      
      // Handle API errors with appropriate feedback
      toast({
        title: "Error",
        description: data.message || "Something went wrong",
        variant: "destructive",
      });
      return { success: false, data: null, error: data };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error("API request error:", error);
    toast({
      title: "Network Error",
      description: "Failed to connect to the server",
      variant: "destructive",
    });
    return { success: false, data: null, error };
  }
};

// User authentication service
export const authService = {
  register: (userData: {
    email: string;
    password: string;
    username: string;
    age: number;
  }) => {
    return apiRequest("/users/register", {
      method: "POST",
      body: userData,
    });
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest("/users/login", {
      method: "POST",
      body: credentials,
    });
    
    // Store tokens in localStorage if login successful
    if (response.success && response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    
    return response;
  },
  
  logout: async () => {
    const response = await apiRequest("/users/logout", {
      method: "POST",
    });
    
    // Clear tokens from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    return response;
  },
  
  refreshToken: async () => {
    // Get refresh token from localStorage
    const refreshToken = localStorage.getItem("refreshToken");
    
    // If no refresh token, return failure
    if (!refreshToken) {
      return { success: false, data: null, error: "No refresh token available" };
    }
    
    const response = await apiRequest("/users/loginUsingRefreshToken", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${refreshToken}`
      }
    });
    
    // Update tokens in localStorage if refresh successful
    if (response.success && response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    
    return response;
  },
  
  getCurrentUser: () => {
    // Add token from localStorage if available
    const accessToken = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {};
    
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    
    return apiRequest("/users/getUser", { headers });
  },
  
  updateProfile: (userData: { fullName?: string; bio?: string }) => {
    return apiRequest("/users/updateAccountDetails", {
      method: "PATCH",
      body: userData,
    });
  },
  
  updateAvatar: (formData: FormData) => {
    return apiRequest("/users/updateAvatar", {
      method: "PATCH",
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
  },
  
  updateCoverImage: (formData: FormData) => {
    return apiRequest("/users/updateCoverImage", {
      method: "PATCH",
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
  },
  
  changePassword: (passwordData: {
    oldPassword: string;
    newPassword: string;
  }) => {
    return apiRequest("/users/changePassword", {
      method: "PATCH",
      body: passwordData,
    });
  },
  
  changeUsername: (usernameData: { username: string }) => {
    return apiRequest("/users/changeUsername", {
      method: "PATCH",
      body: usernameData,
    });
  },
};

// Post service
export const postService = {
  createPost: (postData: FormData) => {
    // Log the FormData for debugging purposes
    console.log("Creating post with FormData:");
    for (const [key, value] of postData.entries()) {
      console.log(`${key}: ${value instanceof File ? `File: ${value.name}, size: ${value.size}` : value}`);
    }
    return apiRequest("/posts", {
      method: "POST",
      body: postData,
      headers: {} // Let browser set content-type for FormData
    });
  },
  
  getPosts: (limit = 10, page = 1) => {
    return apiRequest(`/posts/feed/recommended?limit=${limit}&page=${page}`);
  },
  
  getPostById: (postId: string) => {
    return apiRequest(`/posts/${postId}`);
  },
    getUserPosts: (userId: string, limit = 10, page = 1) => {
    return apiRequest(`/posts/user/${userId}?limit=${limit}&page=${page}`);
  },
  
  getArchivedPosts: (limit = 10, page = 1) => {
    return apiRequest(`/posts/archived?limit=${limit}&page=${page}`);
  },
  
  updatePost: (postId: string, postData: FormData) => {
    return apiRequest(`/posts/${postId}`, {
      method: "PATCH",
      body: postData,
      headers: {} // Let browser set content-type for FormData
    });
  },
  
  deletePost: (postId: string) => {
    return apiRequest(`/posts/${postId}`, {
      method: "DELETE",
    });
  },
  
  archivePost: (postId: string) => {
    return apiRequest(`/posts/${postId}/archive`, {
      method: "PATCH",
    });
  },
  
  unarchivePost: (postId: string) => {
    return apiRequest(`/posts/${postId}/unarchive`, {
      method: "PATCH",
    });
  },
  
  getPostsByHashtag: (hashtag: string, limit = 10, page = 1) => {
    return apiRequest(`/posts/hashtag/${hashtag}?limit=${limit}&page=${page}`);
  },
};

// Comment service
export const commentService = {
  getComments: (postId: string, limit = 10, page = 1) => {
    return apiRequest(`/comments/post/${postId}?limit=${limit}&page=${page}`);
  },
  
  addComment: (postId: string, content: string) => {
    return apiRequest(`/comments/post/${postId}`, {
      method: "POST",
      body: { content },
    });
  },
  
  updateComment: (commentId: string, content: string) => {
    return apiRequest(`/comments/${commentId}`, {
      method: "PATCH",
      body: { content },
    });
  },
  
  deleteComment: (commentId: string) => {
    return apiRequest(`/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};

// Like service
export const likeService = {
  likePost: (postId: string) => {
    return apiRequest(`/likes/toggle/post/${postId}`, {
      method: "POST",
    });
  },
  
  // Note: unlikePost is removed as the backend uses a toggle endpoint
  
  likeComment: (commentId: string) => {
    return apiRequest(`/likes/toggle/comment/${commentId}`, {
      method: "POST",
    });
  },
  
  // Note: unlikeComment is removed as the backend uses a toggle endpoint
  
  getLikedPosts: (limit = 10, page = 1) => {
    return apiRequest(`/likes/posts?limit=${limit}&page=${page}`);
  },
};

// Bookmark service
export const bookmarkService = {
  // Create a new bookmark collection
  createBookmark: (title: string, description?: string) => {
    return apiRequest(`/bookmarks`, {
      method: "POST",
      body: { title, description }
    });
  },
  
  // Add post to a bookmark - if bookmarkId is not provided, it will use default bookmark or create one
  bookmarkPost: async (postId: string, bookMarkId?: string) => {
    // If no bookmark ID is provided, try to get the user's bookmarks first
    if (!bookMarkId) {
      try {
        // Get user's bookmarks
        const bookmarksResponse = await apiRequest(`/bookmarks`);
        
        if (bookmarksResponse.success && bookmarksResponse.data?.length > 0) {
          // Use the first bookmark if one exists
          bookMarkId = bookmarksResponse.data[0]._id;
        } else {
          // Create a default bookmark if none exists
          const createResponse = await apiRequest(`/bookmarks`, {
            method: "POST",
            body: { title: "My Favorites", description: "Default bookmark collection" }
          });
          
          if (createResponse.success && createResponse.data?._id) {
            bookMarkId = createResponse.data._id;
          } else {
            throw new Error("Failed to create default bookmark");
          }
        }
      } catch (error) {
        console.error("Error handling bookmark:", error);
        return { success: false, data: null, error };
      }
    }
    
    // Now add the post to the bookmark
    return apiRequest(`/bookmarks/add/post`, {
      method: "POST",
      body: { postId, bookMarkId }
    });
  },
    unbookmarkPost: (postId: string, bookMarkId?: string) => {
    return apiRequest(`/bookmarks/remove/post`, {
      method: "DELETE",
      body: { postId, bookMarkId }
    });
  },
  
  getBookmarks: (limit = 10, page = 1) => {
    return apiRequest(`/bookmarks?limit=${limit}&page=${page}`);
  },
  
  getBookmarkedPosts: (bookmarkId: string, limit = 10, page = 1) => {
    return apiRequest(`/bookmarks/${bookmarkId}/posts?limit=${limit}&page=${page}`);
  },
};

// Thread service for comment threads
export const threadService = {
  getThreads: (commentId: string, limit = 10, page = 1) => {
    return apiRequest(`/threads/comment/${commentId}?limit=${limit}&page=${page}`);
  },
  
  addThread: (commentId: string, content: string) => {
    return apiRequest(`/threads/comment/${commentId}`, {
      method: "POST",
      body: { content },
    });
  },
  
  updateThread: (threadId: string, content: string) => {
    return apiRequest(`/threads/${threadId}`, {
      method: "PATCH",
      body: { content },
    });
  },
  
  deleteThread: (threadId: string) => {
    return apiRequest(`/threads/${threadId}`, {
      method: "DELETE",
    });
  },
};

// Admin service for moderation functions
export const adminService = {
  banUser: (userId: string, reason: string, duration?: number) => {
    return apiRequest(`/admin/users/${userId}/ban`, {
      method: "POST",
      body: { reason, duration }
    });
  },
  
  unbanUser: (userId: string) => {
    return apiRequest(`/admin/users/${userId}/unban`, {
      method: "POST"
    });
  },
  
  getBannedUsers: (limit = 10, page = 1) => {
    return apiRequest(`/admin/users/banned?limit=${limit}&page=${page}`);
  }
};
