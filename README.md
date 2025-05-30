# Feel-Lite Social Media Platform

A modern social media platform with user profiles, posts, comments, likes, and more.

## Project Structure

This project consists of two main parts:

- **Backend**: Node.js/Express REST API with MongoDB database
- **Frontend**: React/TypeScript SPA with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

### Environment Setup

1. **Backend Setup**

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=8000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=feel-lite-db
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
testing id pass -> test@test pass -> testtest
2. **Frontend Setup**

The frontend uses environment variables defined in `.env.development` and `.env.production`.

### Installation

1. **Install All Dependencies**

```bash
npm run install:all
```

Or install each separately:

2. **Backend Installation**

```bash
cd backend
npm install
```

2. **Frontend Installation**

```bash
cd frontend
npm install
# or if you prefer Bun
bun install
```

### Running the Application

1. **Run both Backend and Frontend concurrently**

```bash
npm run dev
```

Or run them separately:

2. **Start the Backend Server**

```bash
npm run start:backend
# or
cd backend
npm run dev
```

3. **Start the Frontend Development Server**

```bash
npm run start:frontend
# or
cd frontend
npm run dev
# or with Bun
bun run dev
```

The frontend will be available at http://localhost:8080 and will connect to the backend API at http://localhost:8000.

## Features

- User authentication (register, login, logout)
- User profiles with avatars and cover images
- Post creation with image uploads
- Comment system
- Like system
- Bookmark functionality
- Hashtag support
- Content moderation
- Administrative functions

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for image storage
- Multer for file handling
- Sharp for image processing

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Vite
- React Router
- Context API for state management

## API Documentation

For detailed API documentation, see the [API Documentation](backend/API.md) file.

## License

MIT
