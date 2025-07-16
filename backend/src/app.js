import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { processExpiredBans, scheduleTask } from "./utils/scheduler.js";
import { errorHandler } from "./utils/errorHandler.js";
import rateLimit from 'express-rate-limit';


const app = express();

app.use(cors({
    credentials: true,
    origin:['http://localhost:5173',"https://dapper-gingersnap-d276fc.netlify.app"]
}));

const rateLimiter = rateLimit({
    windowMs:15*60*1000,
    max:1000,
    message:"too many request from this ip, please try it later"
})
app.use(rateLimiter)
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Import all routes
import UserRouter from "./routes/user.routes.js";
import PostRouter from "./routes/post.routes.js";
import CommentRouter from "./routes/comment.routes.js";
import LikeRouter from "./routes/like.routes.js";
import BookmarkRouter from "./routes/bookmark.routes.js";
import ThreadRouter from "./routes/thread.routes.js";
import AdminRouter from "./routes/admin.routes.js";
import HealthRouter from "./routes/health.routes.js"

// Register routes
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/posts", PostRouter);
app.use("/api/v1/comments", CommentRouter);
app.use("/api/v1/likes", LikeRouter);
app.use("/api/v1/bookmarks", BookmarkRouter);
app.use("/api/v1/threads", ThreadRouter);
app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/health",HealthRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Schedule automatic ban expiration check every hour
// 1 hour = 60 * 60 * 1000 milliseconds
const banCheckInterval = 60 * 60 * 1000; 
scheduleTask(processExpiredBans, banCheckInterval);

export { app };
