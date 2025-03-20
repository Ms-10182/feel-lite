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
app.use("/api/v1/users", UserRouter);

export { app };
