import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors()); // Fix: call cors as a function

app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

import router from "./routes/user.routes.js";
app.use("/api/v1/users", router);

export { app };
