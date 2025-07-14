import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/Comment.model.js";
import { Post } from "../models/Post.model.js";

const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "Post ID is required");
  }
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    // Create aggregate query
    const commentAggregation = Comment.aggregate([
      {
        $match: {
          post: new mongoose.Types.ObjectId(postId),
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "owner",
          as: "comment_owner",
        },
      },
      {
        $unwind: "$comment_owner",
      },
      {
        $match: {
          "comment_owner.isBanned": { $ne: true },
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes"
        }
      },
      {
        $addFields: {
          totalLikes: { $size: "$likes" },
          isLiked: {
            $cond: {
              if: {
                $gt: [
                  { $size: { $filter: { 
                    input: "$likes", 
                    as: "like", 
                    cond: { $eq: ["$$like.likedBy", req.user._id] } 
                  }}}, 
                  0
                ]
              },
              then: true,
              else: false,
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }, // Sort by newest first
      },
      {
        $project: {
          _id: 1,
          content: 1,
          comment: 1,
          createdAt: 1,
          updatedAt: 1,
          totalLikes: 1,
          isLiked: 1,
          owner: {
            _id: "$comment_owner._id",
            username: "$comment_owner.username",
            avatar: "$comment_owner.avatar",
          },
        },
      },
    ]);

    const options = {
      page: pageNumber,
      limit: limitNumber,
      customLabels: {
        totalDocs: "total",
        docs: "comments",
        page: "page",
        nextPage: "next",
        prevPage: "prev",
        totalPages: "totalPages",
        pagingCounter: "pagingCounter",
        meta: "paginator",
      },
    };

    // Use the plugin to paginate
    const result = await Comment.aggregatePaginate(commentAggregation, options);
    // console.log(result);
    // If no comments exist, return empty array with pagination metadata
    if (result.comments.length === 0) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            comments: [],
            total: 0,
            page: pageNumber,
            limit: limitNumber,
            totalPages: 0,
          },
          "No comments found for this post"
        )
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, result, "Comments retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve comments: ${error.message}`);
  }
});

const createComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  const { content } = req.body;
  const { postId } = req.params;
  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "Post ID is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  try {
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create({
      owner: req.user._id,
      post: new mongoose.Types.ObjectId(postId),
      content: content.trim(),
    });

    if (!comment) {
      throw new ApiError(500, "Failed to create comment");
    }

    res
      .status(201)
      .json(new ApiResponse(201, comment, "Comment added successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to create comment: ${error.message}`);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not the owner of this comment");
    }

    comment.content = content.trim();
    await comment.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to update comment: ${error.message}`);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is required");
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not the owner of this comment");
    }

    await comment.deleteOne();

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete comment: ${error.message}`);
  }
});

export { getPostComments, createComment, updateComment, deleteComment };
