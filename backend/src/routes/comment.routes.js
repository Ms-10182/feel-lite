import { Router } from "express";
import { 
  getPostComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";

const router = Router();

// Get comments for a post
router.route("/post/:postId").get(verifyJWT, getPostComments);

// Create a comment on a post
router.route("/post/:postId").post(verifyJWT, checkBanStatus, createComment);

// Update a comment
router.route("/:commentId").patch(verifyJWT, checkBanStatus, updateComment);

// Delete a comment
router.route("/:commentId").delete(verifyJWT, checkBanStatus, deleteComment);

export default router;