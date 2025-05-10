import { Router } from "express";
import { 
  createThreadComment,
  updateThreadComment,
  deleteThreadComment,
  getCommentThreads,
  deleteThreadCommentByPostOwner 
} from "../controllers/thread.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get threads for a comment
router.route("/comment/:commentId").get(getCommentThreads);

// Create a thread comment on a comment
router.route("/comment/:commentId").post(verifyJWT, createThreadComment);

// Update a thread comment
router.route("/:threadId").patch(verifyJWT, updateThreadComment);

// Delete a thread comment
router.route("/:threadId").delete(verifyJWT, deleteThreadComment);

// Delete a thread comment by post owner
router.route("/post-owner/:threadId").delete(verifyJWT, deleteThreadCommentByPostOwner);

export default router;
