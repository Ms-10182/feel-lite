import { Comment } from "../models/Comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Bookmark } from "../models/Bookmark.model.js";
import { BookmarkedPost } from "../models/BookmarkedPost.model.js";
import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
import { Like } from "../models/Like.model.js";
import { Thread } from "../models/Thread.models.js";

const deleteAccount = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }

  try {
    // 1. Get user's post IDs first (we'll need these for some cleanup operations)
    const userPostIds = await Post.find({ owner: req.user._id }).distinct("_id");
    console.log(`Found ${userPostIds.length} posts owned by user`);
    
    // 2. Get user's comment IDs (needed for thread deletion)
    const userCommentIds = await Comment.find({ owner: req.user._id }).distinct("_id");
    console.log(`Found ${userCommentIds.length} comments owned by user`);
    
    // 3. First delete bookmark-related data (bookmarked posts, then bookmarks)
    const userBookmarks = await Bookmark.find({ owner: req.user._id }).select("_id");
    const bookmarkIds = userBookmarks.map((bookmark) => bookmark._id);

    if (bookmarkIds.length > 0) {
      const deletedBookmarkedPosts = await BookmarkedPost.deleteMany({
        bookmark: { $in: bookmarkIds },
      });
      console.log(`Deleted ${deletedBookmarkedPosts.deletedCount} bookmarked posts`);
    }

    const deletedBookmarks = await Bookmark.deleteMany({ owner: req.user._id });
    console.log(`Deleted ${deletedBookmarks.deletedCount} bookmarks`);
    
    // 4. Delete user's posts from other users' bookmarks
    if (userPostIds.length > 0) {
      const deletedOthersBookmarkedPosts = await BookmarkedPost.deleteMany({
        post: { $in: userPostIds }
      });
      console.log(`Deleted ${deletedOthersBookmarkedPosts.deletedCount} bookmarked posts owned by user from others' bookmarks`);
    }

    // 5. Delete thread comments and threads related to user's comments
    const deletedThreadedComments = await Thread.deleteMany({
      owner: req.user._id,
    });
    console.log(`Deleted ${deletedThreadedComments.deletedCount} threaded comments owned by user`);

    if (userCommentIds.length > 0) {
      const deletedCommentThreads = await Thread.deleteMany({
        comment: { $in: userCommentIds }
      });
      console.log(`Deleted ${deletedCommentThreads.deletedCount} threads on user's comments`);
    }
    
    // 6. Delete comments
    const deletedComments = await Comment.deleteMany({ owner: req.user._id });
    console.log(`Deleted ${deletedComments.deletedCount} comments`);
    
    // 7. Delete likes by user
    const deletedLikes = await Like.deleteMany({ likedBy: req.user._id });
    console.log(`Deleted ${deletedLikes.deletedCount} likes by user`);
    
    // 8. Delete likes on user's content (posts and comments)
    let deletedLikesOnContent = 0;
    if (userPostIds.length > 0) {
      const deletedPostLikes = await Like.deleteMany({ post: { $in: userPostIds } });
      deletedLikesOnContent += deletedPostLikes.deletedCount;
    }
    
    if (userCommentIds.length > 0) {
      const deletedCommentLikes = await Like.deleteMany({ comment: { $in: userCommentIds } });
      deletedLikesOnContent += deletedCommentLikes.deletedCount;
    }
    console.log(`Deleted ${deletedLikesOnContent} likes on user's content`);
    
    // 9. Delete comments on user's posts
    if (userPostIds.length > 0) {
      // Find comment IDs on user's posts (to clean up threads later)
      const commentsOnUserPosts = await Comment.find({ post: { $in: userPostIds } }).distinct("_id");
      
      // Delete threads on comments on user's posts
      if (commentsOnUserPosts.length > 0) {
        const deletedThreadsOnComments = await Thread.deleteMany({
          comment: { $in: commentsOnUserPosts }
        });
        console.log(`Deleted ${deletedThreadsOnComments.deletedCount} threads on comments on user's posts`);
      }
      
      // Delete the comments themselves
      const deletedCommentsOnPosts = await Comment.deleteMany({ post: { $in: userPostIds } });
      console.log(`Deleted ${deletedCommentsOnPosts.deletedCount} comments on user's posts`);
    }
    
    // 10. Delete user's posts
    const deletedPosts = await Post.deleteMany({ owner: req.user._id });
    console.log(`Deleted ${deletedPosts.deletedCount} posts`);

    // 11. Finally delete the user
    await User.deleteOne({ _id: req.user._id });
    console.log("User deleted successfully");
  } catch (error) {
    console.error("Error during account deletion process:", error);
    throw new ApiError(500, `Failed to delete account: ${error.message}`);
  }
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Clear cookies and return success response
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User account and all associated data deleted successfully"));
});

// Export the deleteAccount function
export { deleteAccount };
