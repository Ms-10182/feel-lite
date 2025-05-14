import { Router } from "express";
import { 
  CreateNewBookmark, 
  deleteBookmark, 
  addPostToBookmark, 
  removePostFromBookmark, 
  getAllBookmarks, 
  getBookmarkedPosts 
} from "../controllers/bookmark.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";

const router = Router();

// Apply auth middleware to all bookmark routes
router.use(verifyJWT);
router.use(checkBanStatus);

// Create a new bookmark collection
router.route("/").post(CreateNewBookmark);

// Get all bookmarks for the current user
router.route("/").get(getAllBookmarks);

// Delete a bookmark collection
router.route("/:bookMarkId").delete(deleteBookmark);

// Get all posts in a bookmark
router.route("/:bookmarkId/posts").get(getBookmarkedPosts);

// Add a post to bookmark
router.route("/add/post").post(addPostToBookmark);

// Remove a post from bookmark
router.route("/remove/post").delete(removePostFromBookmark);

export default router;