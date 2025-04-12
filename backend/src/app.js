import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    credentials:true
}));

app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

import UserRouter from "./routes/user.routes.js";
import PostRouter from "./routes/post.routes.js"
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/posts", PostRouter);

export { app };
