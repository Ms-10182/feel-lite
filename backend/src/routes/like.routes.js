import { Router } from "express";
import { togglePostLike, toggleCommentLike, getLikedPosts } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";

const router = Router();

// Apply auth middleware to all like routes
router.use(verifyJWT);
router.use(checkBanStatus);

// Post likes
router.route("/toggle/post/:postId").post(togglePostLike);

// Comment likes
router.route("/toggle/comment/:commentId").post(toggleCommentLike);

// Get user's liked posts
router.route("/posts").get(getLikedPosts);

export default router;