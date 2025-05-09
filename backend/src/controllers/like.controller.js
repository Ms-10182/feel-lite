import { Like } from "../models/Like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!req.user) {
    throw new ApiError(403, "you are not authorized");
  }

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "post id is required");
  }

  const likedPost = await Like.findOneAndDelete({
    likedBy: req.user._id,
    post: new mongoose.Types.ObjectId(postId),
  });

  if (!likedPost) {
    const like = await Like.create({
      post: new mongoose.Types.ObjectId(postId),
      likedBy: req.user._id,
    });

    if (!like) {
      throw new ApiError(500, "failed to like the post");
    }
  }

  res.status(200).json(new ApiResponse(200, {}, "post liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!req.user) {
    throw new ApiError(403, "you are not authorized");
  }

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "comment id is required");
  }

  const likedComment = await Like.findOneAndDelete({
    likedBy: req.user._id,
    comment: new mongoose.Types.ObjectId(commentId),
  });

  if (!likedComment) {
    const like = await Like.create({
      likedBy: req.user._id,
      comment: new mongoose.Types.ObjectId(commentId),
    });

    if (!like) {
      throw new ApiError(500, "failed to like the comment");
    }
  }
  res.status(200).json(new ApiResponse(200, {}, "comment liked sucessfully"));
});

const getLikedPosts = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "you are not authorized");
  }

  const likedPosts = await Like.aggregate([
    {
      $match: {
        likedBy: req.user._id,
        post: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "post",
        foreignField: "_id",
        as: "postDetails",
      },
    },
    {
      $unwind: "$postDetails",
    },
    {
      $project: {
        _id: 0,
        postId: "$postDetails._id",
        content: "$postDetails.content",
        createdAt: "$postDetails.createdAt",
        updatedAt: "$postDetails.updatedAt",
      },
    },
  ]);
});


export { togglePostLike, toggleCommentLike, getLikedPosts };
