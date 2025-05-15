import { Router } from "express";
import { createPost, deletePost, editPost, getPost, archivePost, unArchivePost } from "../controllers/post.controller.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";
import { compressImagesMiddleware } from "../middlewares/imageCompressor.middleware.js";

const router = Router();

// Create new post
router.route("/").post(
  verifyJWT,
  checkBanStatus,
  upload.array("postImage", 5),
  compressImagesMiddleware,
  createPost
);

// Get post by ID
router.route("/:postId").get(getPost);

// Edit post by ID 
router.route("/:postId").patch(verifyJWT, checkBanStatus, editPost);

// Delete post by ID
router.route("/:postId").delete(verifyJWT, checkBanStatus, deletePost);

// Archive post by ID
router.route("/:postId/archive").patch(verifyJWT, checkBanStatus, archivePost);

// Unarchive post by ID
router.route("/:postId/unarchive").patch(verifyJWT, checkBanStatus, unArchivePost);

export default router