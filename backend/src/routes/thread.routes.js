import { Router } from "express";
import { 
  createThreadComment,
  updateThreadComment,
  deleteThreadComment,
  getCommentThreads,
  deleteThreadCommentByPostOwner 
} from "../controllers/thread.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";

const router = Router();

// Get threads for a comment
router.route("/comment/:commentId").get(getCommentThreads);

// Create a thread comment on a comment
router.route("/comment/:commentId").post(verifyJWT, checkBanStatus, createThreadComment);

// Update a thread comment
router.route("/:threadId").patch(verifyJWT, checkBanStatus, updateThreadComment);

// Delete a thread comment
router.route("/:threadId").delete(verifyJWT, checkBanStatus, deleteThreadComment);

// Delete a thread comment by post owner
router.route("/post-owner/:threadId").delete(verifyJWT, checkBanStatus, deleteThreadCommentByPostOwner);

export default router;
