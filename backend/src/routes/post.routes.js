import { Router } from "express";
import { createPost, deletePost, editPost, getPost } from "../controllers/post.controller.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { compressImagesMiddleware } from "../middlewares/imageCompressor.middleware.js";

const router = Router();

// Create new post
router.route("/").post(
  verifyJWT,
  upload.array("postImage", 5),
  compressImagesMiddleware,
  createPost
);

// Get post by ID
router.route("/:postId").get(getPost);

// Edit post by ID 
router.route("/:postId").patch(verifyJWT, editPost);

// Delete post by ID
router.route("/:postId").delete(verifyJWT, deletePost);

export default router