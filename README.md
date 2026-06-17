# Feel-Lite Backend
### Live link: [click here](https://feel-lite.vercel.app/)
> A modern social media backend built with **Node.js**, **Express**, **MongoDB**, and **JWT** auth.

Feel-Lite powers a social platform with user accounts, posts, comments, threaded replies, likes, bookmarks, feeds, and admin moderation. It also includes media upload support, image compression, content analysis, and ban management.

## Highlights

- JWT authentication with access + refresh tokens
- User profile management with avatars and cover images
- Post creation with image uploads, archiving, and hashtag browsing
- Comments, threaded replies, likes, and bookmarks
- Recommended and global feeds
- Admin controls for banning and unbanning users
- Content moderation and image validation/compression
- Hourly automatic ban-expiration processing

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT, bcrypt
- **Uploads:** Multer
- **Image processing:** Sharp
- **Storage:** Cloudinary
- **Email:** Nodemailer
- **Cache/queue support:** Redis
- **Moderation:** Azure AI Content Safety, Google API

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Create your `.env`

```env
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=30d

ORIGIN1=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

GOOGLE_API=your_google_api_key
AZURE_AI_FILTER_ENDPOINT=your_azure_endpoint
AZURE_AI_FILTER_KEY=your_azure_key

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=your_from_email

NODE_ENV=development
```

`DB_NAME` is already set in code to `feel-lite-db`.

### 3) Run the server

```bash
npm run dev
```

The API runs at:

```bash
http://localhost:<PORT>/api/v1
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the app with Nodemon |
| `npm run process-bans` | Process expired bans |
| `npm run list-banned` | List banned users |
| `npm run check-ban` | Check a user ban status |

## API Overview

- **Users:** register, login, logout, profile updates, password changes, avatar/cover updates
- **Posts:** create, edit, delete, archive, unarchive, feed discovery, hashtag browsing
- **Comments:** post comments, edit/delete comments
- **Threads:** nested replies on comments
- **Likes:** toggle likes for posts and comments
- **Bookmarks:** create collections and save posts
- **Admin:** ban/unban users, list banned users
- **Health:** `GET /api/v1/health`

For the full endpoint reference, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Health Check

```bash
GET /api/v1/health
```

Response:

```json
{
  "statusCode": 200,
  "data": {
    "status": "healthy",
    "serverTime": "2026-01-01T00:00:00.000Z"
  },
  "message": "API server is running",
  "success": true
}
```

## Docker

Build:

```bash
docker build -t feel-lite-backend .
```

Run:

```bash
docker run -p 8080:8080 --env-file .env feel-lite-backend
```

## Project Structure

```text
src/
├── app.js
├── index.js
├── controllers/
├── db/
├── middlewares/
├── models/
├── routes/
├── scripts/
└── utils/
```

## Notes

- CORS is configured for `http://localhost:5173` plus `ORIGIN1`
- The server uses httpOnly cookies for token storage
- Supported image types include `png`, `jpeg`, `jpg`, and `heic`
- Posts support up to 5 uploaded images

## License

ISC
