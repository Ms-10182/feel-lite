import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/Post.model.js";

const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!req.user) {
    throw new ApiError(403, "you are not authorized");
  }

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "post id is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const postComments = await Comment.aggregate([
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
  ]);

  if (!postComments || postComments.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No comments found for this post"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, postComments, "Comments retrieved successfully")
    );
});

const createComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "you are not authorized");
  }

  const { content } = req.body;
  const { postId } = req.params;
  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "post id is required");
  }

  if (
    !content ||
    content.trim() === "" ||
    !postId ||
    !isValidObjectId(postId)
  ) {
    throw new ApiError(400, "both post id and content is required");
  }

  const comment = await Comment.create({
    owner: req.user._id,
    post: new mongoose.Types.ObjectId(postId),
    content,
  });

  if (!comment) {
    throw new ApiError(500, "failed to create comment");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!req.user) {
    throw new ApiError(403, "you are not authorized");
  }

  if (!commentId) {
    throw new ApiError(400, "comment id is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not the owner of comment cant edit");
  }

  comment.content = content.trim();
  await comment.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!req.user) {
    throw new ApiError(403, "you are not authorized");
  }

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "comment id is required");
  }
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "you are not the owner of comment, can not delete the comment"
    );
  }

  await comment.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export { getPostComments, createComment, updateComment, deleteComment };
