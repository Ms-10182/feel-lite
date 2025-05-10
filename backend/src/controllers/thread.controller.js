import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Thread } from "../models/Thread.models.js";
import { Comment } from "../models/Comment.model.js";
import { Post } from "../models/Post.model.js";

// Create a threaded comment (reply to a comment)
const createThreadComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Thread comment content is required");
  }

  try {
    // Check if the parent comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Parent comment not found");
    }

    // Create the thread comment
    const threadComment = await Thread.create({
      comment: new mongoose.Types.ObjectId(commentId),
      content: content.trim(),
      owner: req.user._id
    });

    // Get thread with user details
    const populatedThread = await Thread.findById(threadComment._id).populate({
      path: "owner",
      select: "_id username avatar"
    });

    res.status(201).json(
      new ApiResponse(201, populatedThread, "Thread comment created successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to create thread comment: ${error.message}`);
  }
});

// Update a threaded comment
const updateThreadComment = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const { content } = req.body;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!threadId || !isValidObjectId(threadId)) {
    throw new ApiError(400, "Thread ID is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Thread comment content is required");
  }

  try {
    const threadComment = await Thread.findById(threadId);
    if (!threadComment) {
      throw new ApiError(404, "Thread comment not found");
    }

    // Check if user is the owner of the thread comment
    if (threadComment.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this thread comment");
    }

    threadComment.content = content.trim();
    await threadComment.save();

    res.status(200).json(
      new ApiResponse(200, threadComment, "Thread comment updated successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to update thread comment: ${error.message}`);
  }
});

// Delete a threaded comment
const deleteThreadComment = asyncHandler(async (req, res) => {
  const { threadId } = req.params;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!threadId || !isValidObjectId(threadId)) {
    throw new ApiError(400, "Thread ID is required");
  }

  try {
    const threadComment = await Thread.findById(threadId);
    if (!threadComment) {
      throw new ApiError(404, "Thread comment not found");
    }

    // Check if user is the owner of the thread comment
    if (threadComment.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to delete this thread comment");
    }

    await Thread.findByIdAndDelete(threadId);

    res.status(200).json(
      new ApiResponse(200, {}, "Thread comment deleted successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete thread comment: ${error.message}`);
  }
});

// Get all threaded comments of a base comment using pagination
const getCommentThreads = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is required");
  }

  try {
    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Create aggregate query
    const threadAggregation = Thread.aggregate([
      {
        $match: {
          comment: new mongoose.Types.ObjectId(commentId),
        },
      },
      {
        $sort: { createdAt: -1 } // Sort by newest first
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "owner",
          as: "thread_owner",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$thread_owner"
      },
      {
        $project: {
          _id: 1,
          content: 1,
          comment: 1,
          createdAt: 1,
          updatedAt: 1,
          owner: "$thread_owner",
        }
      }
    ]);

    // Skip and limit for pagination
    const skip = (pageNumber - 1) * limitNumber;
    const threads = await threadAggregation.skip(skip).limit(limitNumber);

    // Get total count for pagination
    const totalCount = await Thread.countDocuments({
      comment: new mongoose.Types.ObjectId(commentId)
    });

    res.status(200).json(
      new ApiResponse(
        200, 
        {
          threads,
          pagination: {
            totalThreads: totalCount,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalCount / limitNumber)
          }
        }, 
        "Comment threads retrieved successfully"
      )
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve comment threads: ${error.message}`);
  }
});

// Delete a threaded comment by post owner
const deleteThreadCommentByPostOwner = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  
  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!threadId || !isValidObjectId(threadId)) {
    throw new ApiError(400, "Thread ID is required");
  }

  try {
    // Use aggregation pipeline to check permissions in one query
    const threadDetails = await Thread.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(threadId) }
      },
      {
        $lookup: {
          from: "comments",
          localField: "comment",
          foreignField: "_id",
          as: "parentComment"
        }
      },
      {
        $unwind: "$parentComment"
      },
      {
        $lookup: {
          from: "posts",
          localField: "parentComment.post",
          foreignField: "_id",
          as: "parentPost"
        }
      },
      {
        $unwind: "$parentPost" 
      },
      {
        $project: {
          _id: 1,
          postOwner: "$parentPost.owner"
        }
      }
    ]);

    if (!threadDetails || threadDetails.length === 0) {
      throw new ApiError(404, "Thread comment not found or missing required associations");
    }
    
    const { postOwner } = threadDetails[0];
    
    // Check if user is the owner of the post
    if (postOwner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to delete this thread comment");
    }

    // Delete the thread comment
    const result = await Thread.findByIdAndDelete(threadId);
    
    if (!result) {
      throw new ApiError(404, "Failed to delete thread comment");
    }

    res.status(200).json(
      new ApiResponse(200, {}, "Thread comment deleted successfully by post owner")
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete thread comment: ${error.message}`);
  }
});

export { 
  createThreadComment, 
  updateThreadComment, 
  deleteThreadComment, 
  getCommentThreads,
  deleteThreadCommentByPostOwner 
};
