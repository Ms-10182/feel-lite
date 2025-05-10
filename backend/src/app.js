import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    credentials: true
}));

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

// Register routes
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/posts", PostRouter);
app.use("/api/v1/comments", CommentRouter);
app.use("/api/v1/likes", LikeRouter);
app.use("/api/v1/bookmarks", BookmarkRouter);
app.use("/api/v1/threads", ThreadRouter);

export { app };
