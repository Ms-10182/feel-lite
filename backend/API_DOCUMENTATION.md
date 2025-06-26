# Feel-Lite Backend API Documentation

## Overview
Feel-Lite is a social media platform backend built with Node.js, Express.js, and MongoDB. This API provides comprehensive functionality for user management, posts, comments, likes, bookmarks, and administrative features.

## Base URL
```
http://localhost:<PORT>/api/v1
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication with both access tokens and refresh tokens.

### Headers Required for Protected Routes
```
Authorization: Bearer <access_token>
```

### Cookies (Auto-managed)
- `accessToken`: JWT access token (httpOnly)
- `refreshToken`: JWT refresh token (httpOnly)

---

## API Endpoints

### 🔐 Authentication & User Management

#### **POST** `/users/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "age": 18
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "user registered successfully",
  "success": true
}
```

**Notes:**
- Minimum age requirement: 16 years
- Auto-generates username, avatar, and cover image
- Returns success message without user data for security

---

#### **POST** `/users/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "userId",
      "username": "generatedUsername",
      "email": "user@example.com",
      "avatar": "avatarUrl",
      "coverImage": "coverImageUrl",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "User logged in successfully",
  "success": true
}
```

**Notes:**
- Sets httpOnly cookies for tokens
- Checks for banned users and ban expiration

---

#### **POST** `/users/loginUsingRefreshToken`
Login using refresh token (auto-refresh access token).

**Authentication Required:** Refresh Token

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "userId",
      "username": "username",
      "email": "user@example.com"
    },
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  },
  "message": "Tokens refreshed successfully",
  "success": true
}
```

---

#### **POST** `/users/logout`
Logout current session.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "user logged out",
  "success": true
}
```

---

#### **POST** `/users/logoutFromEveryWhere`
Logout from all devices.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "user logged out from every where",
  "success": true
}
```

---

#### **GET** `/users/getUser`
Get current user profile.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "userId",
    "username": "username",
    "email": "user@example.com",
    "avatar": "avatarUrl",
    "coverImage": "coverImageUrl",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "user retrieved successfully",
  "success": true
}
```

---

#### **PATCH** `/users/changePassword`
Change user password.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "oldPassword": "currentPassword",
  "newPassword": "newSecurePassword"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "password changed successfully",
  "success": true
}
```

---

#### **PATCH** `/users/updateAccountDetails`
Update user email.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "newEmail": "newemail@example.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "account updated successfully",
  "success": true
}
```

---

#### **PATCH** `/users/updateAvatar`
Update user avatar.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "avatarIdx": 2
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "avatar updated successfully",
  "success": true
}
```

---

#### **PATCH** `/users/updateCoverImage`
Update user cover image.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "coverImageIdx": 3
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "cover image updated successfully",
  "success": true
}
```

---

#### **PATCH** `/users/changeUsername`
Generate a new random username.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "username updated successfully",
  "success": true
}
```

---

### 📝 Posts Management

#### **POST** `/posts`
Create a new post.

**Authentication Required:** Yes

**Request Body (multipart/form-data):**
```
content: "Post content here"
tags: "tag1,tag2,tag3"
postImage: [file1, file2, ...] (max 5 images)
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "postId",
    "content": "Post content here",
    "owner": "userId",
    "tags": ["tag1", "tag2", "tag3"],
    "images": ["imageUrl1", "imageUrl2"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Post created successfully",
  "success": true
}
```

**Notes:**
- Images are automatically compressed
- Content is analyzed for inappropriate content
- Max 5 images per post
- Supports PNG, JPEG, JPG, HEIC formats

---

#### **GET** `/posts/:postId`
Get a specific post by ID.

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "postId",
    "content": "Post content",
    "owner": "userId",
    "tags": ["tag1", "tag2"],
    "images": ["imageUrl1"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Post retrieved successfully",
  "success": true
}
```

---

#### **PATCH** `/posts/:postId`
Edit a post (owner only).

**Authentication Required:** Yes

**Request Body:**
```json
{
  "content": "Updated post content",
  "tags": "newtag1,newtag2"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "postId",
    "content": "Updated post content",
    "tags": ["newtag1", "newtag2"]
  },
  "message": "post updated successfully",
  "success": true
}
```

---

#### **DELETE** `/posts/:postId`
Delete a post (owner only).

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "post deleted successfully",
  "success": true
}
```

---

#### **PATCH** `/posts/:postId/archive`
Archive a post (owner only).

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 201,
  "data": {},
  "message": "post archived successfully",
  "success": true
}
```

---

#### **PATCH** `/posts/:postId/unarchive`
Unarchive a post (owner only).

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "post unarchived successfully",
  "success": true
}
```

---

#### **GET** `/posts/feed/recommended`
Get recommended posts based on user preferences.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "posts": [
      {
        "_id": "postId",
        "content": "Post content",
        "images": ["imageUrl"],
        "tags": ["tag1"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "owner": {
          "_id": "userId",
          "username": "username",
          "avatar": "avatarUrl"
        }
      }
    ],
    "preferredTags": [
      {"tag": "technology", "count": 5},
      {"tag": "coding", "count": 3}
    ]
  },
  "message": "New posts retrieved successfully",
  "success": true
}
```

**Notes:**
- Algorithm analyzes user's liked and commented posts
- Returns personalized recommendations
- Falls back to recent posts if insufficient data

---

#### **GET** `/posts/hashtag/:hashTag`
Get posts by hashtag with pagination.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "docs": [
      {
        "_id": "postId",
        "content": "Post content",
        "images": ["imageUrl"],
        "tags": ["hashtag"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "owner": {
          "_id": "userId",
          "username": "username",
          "avatar": "avatarUrl"
        }
      }
    ],
    "totalDocs": 50,
    "limit": 20,
    "page": 1,
    "totalPages": 3
  },
  "message": "Posts fetched successfully",
  "success": true
}
```

---

### 💬 Comments Management

#### **GET** `/comments/post/:postId`
Get comments for a specific post with pagination.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "comments": [
      {
        "_id": "commentId",
        "content": "Comment content",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "owner": {
          "_id": "userId",
          "username": "username",
          "avatar": "avatarUrl"
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "message": "Comments retrieved successfully",
  "success": true
}
```

---

#### **POST** `/comments/post/:postId`
Create a comment on a post.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "content": "This is my comment"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "commentId",
    "content": "This is my comment",
    "owner": "userId",
    "post": "postId",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Comment added successfully",
  "success": true
}
```

---

#### **PATCH** `/comments/:commentId`
Update a comment (owner only).

**Authentication Required:** Yes

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "commentId",
    "content": "Updated comment content"
  },
  "message": "Comment updated successfully",
  "success": true
}
```

---

#### **DELETE** `/comments/:commentId`
Delete a comment (owner only).

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Comment deleted successfully",
  "success": true
}
```

---

### ❤️ Likes Management

#### **POST** `/likes/toggle/post/:postId`
Toggle like on a post.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "post like toggled successfully",
  "success": true
}
```

**Notes:**
- If post is already liked, it will be unliked
- If post is not liked, it will be liked

---

#### **POST** `/likes/toggle/comment/:commentId`
Toggle like on a comment.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Comment like toggled successfully",
  "success": true
}
```

---

#### **GET** `/likes/posts`
Get all posts liked by the current user.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "postId": "postId",
      "content": "Post content",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Liked posts retrieved successfully",
  "success": true
}
```

---

### 🔖 Bookmarks Management

#### **POST** `/bookmarks`
Create a new bookmark collection.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "title": "My Favorite Posts",
  "description": "Collection of my favorite posts"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "bookmarkId",
    "title": "My Favorite Posts",
    "description": "Collection of my favorite posts",
    "owner": "userId",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Bookmark created successfully",
  "success": true
}
```

---

#### **GET** `/bookmarks`
Get all bookmark collections for the current user.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "bookmarkId",
      "title": "My Favorite Posts",
      "description": "Collection description",
      "owner": "userId",
      "posts": [
        {
          "post": "postId",
          "bookmark": "bookmarkId"
        }
      ]
    }
  ],
  "message": "Bookmarks fetched successfully",
  "success": true
}
```

---

#### **DELETE** `/bookmarks/:bookMarkId`
Delete a bookmark collection.

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Bookmark deleted successfully",
  "success": true
}
```

---

#### **POST** `/bookmarks/add/post`
Add a post to a bookmark collection.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "postId": "postId",
  "bookMarkId": "bookmarkId"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "post": "postId",
    "bookmark": "bookmarkId"
  },
  "message": "Post added successfully",
  "success": true
}
```

---

#### **DELETE** `/bookmarks/remove/post`
Remove a post from a bookmark collection.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "postId": "postId",
  "bookMarkId": "bookmarkId"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Post removed from bookmark successfully",
  "success": true
}
```

---

#### **GET** `/bookmarks/:bookmarkId/posts`
Get all posts in a bookmark collection with pagination.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "posts": [
      {
        "postId": "postId",
        "content": "Post content",
        "images": ["imageUrl"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  },
  "message": "Bookmarked posts retrieved successfully",
  "success": true
}
```

---

### 🧵 Thread Comments Management

#### **GET** `/threads/comment/:commentId`
Get thread comments for a specific comment.

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "threadId",
      "content": "Thread comment content",
      "owner": {
        "_id": "userId",
        "username": "username",
        "avatar": "avatarUrl"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Thread comments retrieved successfully",
  "success": true
}
```

---

#### **POST** `/threads/comment/:commentId`
Create a thread comment on a comment.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "content": "This is a thread reply"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "threadId",
    "content": "This is a thread reply",
    "owner": "userId",
    "comment": "commentId",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Thread comment created successfully",
  "success": true
}
```

---

#### **PATCH** `/threads/:threadId`
Update a thread comment (owner only).

**Authentication Required:** Yes

**Request Body:**
```json
{
  "content": "Updated thread comment"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "threadId",
    "content": "Updated thread comment"
  },
  "message": "Thread comment updated successfully",
  "success": true
}
```

---

#### **DELETE** `/threads/:threadId`
Delete a thread comment (owner only).

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Thread comment deleted successfully",
  "success": true
}
```

---

#### **DELETE** `/threads/post-owner/:threadId`
Delete a thread comment (post owner only).

**Authentication Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Thread comment deleted successfully",
  "success": true
}
```

---

### 👑 Admin Management

#### **POST** `/admin/users/:userId/ban`
Ban a user (Admin only).

**Authentication Required:** Yes (Admin)

**Request Body:**
```json
{
  "reason": "Violation of community guidelines",
  "duration": 24
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "userId": "userId",
    "isBanned": true,
    "reason": "Violation of community guidelines",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "User banned for 24 hours",
  "success": true
}
```

**Notes:**
- `duration` is in hours (optional - null for permanent ban)
- Forces logout from all devices

---

#### **POST** `/admin/users/:userId/unban`
Unban a user (Admin only).

**Authentication Required:** Yes (Admin)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "userId": "userId"
  },
  "message": "User unbanned successfully",
  "success": true
}
```

---

#### **GET** `/admin/users/banned`
Get all banned users with pagination (Admin only).

**Authentication Required:** Yes (Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "docs": [
      {
        "_id": "userId",
        "username": "username",
        "email": "user@example.com",
        "isBanned": true,
        "banReason": "Violation of terms",
        "banExpiresAt": "2024-01-02T00:00:00.000Z"
      }
    ],
    "totalDocs": 5,
    "limit": 10,
    "page": 1,
    "totalPages": 1
  },
  "message": "Banned users retrieved successfully",
  "success": true
}
```

---

### 🏥 Health Check

#### **GET** `/health/health`
Check API server status.

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "status": "healthy",
    "serverTime": "2024-01-01T00:00:00.000Z"
  },
  "message": "API server is running",
  "success": true
}
```

---

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "success": false,
  "errors": []
}
```

### Common Error Status Codes:
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid credentials, missing token)
- `403` - Forbidden (insufficient permissions, banned user)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resources)
- `500` - Internal Server Error

---

## Middleware Features

### 🔒 Authentication Middleware
- Validates JWT access tokens
- Checks token expiration
- Verifies refresh tokens

### 🚫 Ban Checker Middleware
- Automatically checks if user is banned
- Validates ban expiration
- Updates ban status if expired

### 🔍 Content Analyzer Middleware
- Analyzes content for inappropriate material
- Prevents spam and harmful content

### 📷 Image Processing Middleware
- Compresses uploaded images
- Validates image formats (PNG, JPEG, JPG, HEIC)
- Handles multiple image uploads (max 5 per post)

### 📁 File Upload Middleware
- Uses Multer for multipart form data
- Stores files temporarily for processing
- Validates file types and sizes

---

## Database Models

### User Schema
- `username` (String, unique)
- `email` (String, unique)
- `password` (String, hashed)
- `avatar` (String, URL)
- `coverImage` (String, URL)
- `refreshToken` (String)
- `logoutPin` (Number)
- `isBanned` (Boolean)
- `banReason` (String)
- `banExpiresAt` (Date)
- `role` (String, default: "user")

### Post Schema
- `content` (String, required)
- `owner` (ObjectId, ref: User)
- `tags` (Array of Strings)
- `images` (Array of Strings, URLs)
- `isArchived` (Boolean, default: false)

### Comment Schema
- `content` (String, required)
- `owner` (ObjectId, ref: User)
- `post` (ObjectId, ref: Post)

### Like Schema
- `likedBy` (ObjectId, ref: User)
- `post` (ObjectId, ref: Post, optional)
- `comment` (ObjectId, ref: Comment, optional)

### Bookmark Schema
- `title` (String, required)
- `description` (String, optional)
- `owner` (ObjectId, ref: User)

### BookmarkedPost Schema
- `post` (ObjectId, ref: Post)
- `bookmark` (ObjectId, ref: Bookmark)

### Thread Schema
- `content` (String, required)
- `owner` (ObjectId, ref: User)
- `comment` (ObjectId, ref: Comment)

---

## Rate Limiting & Security

### Security Features:
- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only cookies for token storage
- CORS enabled with credentials
- Content analysis for spam prevention
- File type validation for uploads
- Ban system with automatic expiration

### Best Practices:
- Always use HTTPS in production
- Implement rate limiting (recommended)
- Monitor for suspicious activities
- Regular security audits
- Keep dependencies updated

---

## Pagination

Most list endpoints support pagination with the following query parameters:
- `page`: Page number (starts from 1)
- `limit`: Number of items per page

Standard pagination response format:
```json
{
  "docs": [...],
  "totalDocs": 100,
  "limit": 10,
  "page": 1,
  "totalPages": 10,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

---

## Environment Variables

Required environment variables:
```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/feel-lite-db
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## Additional Notes

### Image Upload Specifications:
- **Supported formats**: PNG, JPEG, JPG, HEIC
- **Maximum images per post**: 5
- **Processing**: Automatic compression via Sharp
- **Storage**: Cloudinary cloud storage

### Content Moderation:
- Automatic content analysis on posts, comments, and threads
- Banned users cannot create content
- Content flagging and review system

### User Experience Features:
- Random username generation
- Avatar and cover image selection system
- Personalized post recommendations
- Hashtag-based content discovery

### Admin Features:
- User ban management with expiration
- Banned user listing and monitoring
- Comprehensive user oversight tools

This documentation covers all available endpoints in the Feel-Lite backend API. For additional support or feature requests, please contact the development team.
