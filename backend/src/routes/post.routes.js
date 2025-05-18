import { Router } from "express";
import { 
  createPost, 
  deletePost, 
  editPost, 
  getPost, 
  archivePost, 
  unArchivePost, 
  getNewPosts,
  getPostByHashTag 
} from "../controllers/post.controller.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";
import { compressImagesMiddleware } from "../middlewares/imageCompressor.middleware.js";
import { analyzeContent } from "../middlewares/contentAnalyzer.middleware.js";

const router = Router();

// Create new post
router.route("/").post(
  verifyJWT,
  checkBanStatus,
  analyzeContent,
  upload.array("postImage", 5),
  compressImagesMiddleware,
  createPost
);

// Get post by ID
router.route("/:postId").get(getPost);

// Edit post by ID 
router.route("/:postId").patch(verifyJWT, checkBanStatus, analyzeContent, editPost);

// Delete post by ID
router.route("/:postId").delete(verifyJWT, checkBanStatus, deletePost);

// Archive post by ID
router.route("/:postId/archive").patch(verifyJWT, checkBanStatus, archivePost);

// Unarchive post by ID
router.route("/:postId/unarchive").patch(verifyJWT, checkBanStatus, unArchivePost);

// Get new recommended posts based on user preferences
router.route("/feed/recommended").get(verifyJWT, checkBanStatus, getNewPosts);

// Get posts by hashtag
router.route("/hashtag/:hashTag").get(verifyJWT, checkBanStatus, getPostByHashTag);

export default router