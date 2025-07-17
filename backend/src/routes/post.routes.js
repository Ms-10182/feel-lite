import { Router } from "express";
import { 
  createPost, 
  deletePost, 
  editPost, 
  getPost, 
  archivePost, 
  unArchivePost, 
  getNewPosts,
  getPostByHashTag ,
  getMyPosts,
  getArchivedPosts,
  getGlobalFeed,
  getTrendingPosts
} from "../controllers/post.controller.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";
import { compressImagesMiddleware } from "../middlewares/imageCompressor.middleware.js";
import { analyzeContent,imageContentAnalyzer } from "../middlewares/contentAnalyzer.middleware.js";

const router = Router();
router.use(verifyJWT);

// Create new post
router.route("/").post(
  checkBanStatus,
  upload.array("postImage", 5),
  imageContentAnalyzer,
  compressImagesMiddleware,
  analyzeContent,
  createPost
);
// Get post by ID
router.route("/p/:postId").get(getPost);

// Get my posts (must be before /:postId route)
router.route("/my-posts").get(checkBanStatus, getMyPosts);

// Get archived posts (must be before /:postId route)
router.route("/archived-posts").get(checkBanStatus, getArchivedPosts);


// Edit post by ID 
router.route("/:postId").patch(checkBanStatus, analyzeContent, editPost);

// Delete post by ID
router.route("/:postId").delete(checkBanStatus, deletePost);

// Archive post by ID
router.route("/:postId/archive").patch(checkBanStatus, archivePost);

// Unarchive post by ID
router.route("/:postId/unarchive").patch(checkBanStatus, unArchivePost);

// Get new recommended posts based on user preferences
router.route("/feed/recommended").get(checkBanStatus, getNewPosts);

router.route("/feed/global").get(checkBanStatus, getGlobalFeed);

// Get trending posts
router.route("/trending").get(checkBanStatus, getTrendingPosts);

// Get posts by hashtag
router.route("/hashtag/:hashTag").get(checkBanStatus, getPostByHashTag);



export default router
