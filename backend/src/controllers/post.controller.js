import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/Post.model.js"; // Assuming you have a Post model
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";

const createPost = asyncHandler(async (req, res) => {
  const { content, tags } = req.body;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content can't be empty");
  }

  try {
    const compressedImages = req.compressedImages;
    let uploadedImages = [];

    if (compressedImages && compressedImages.length > 0) {
      const uploadTask = compressedImages.map(async (file) => {
        const upload = await uploadOnCloudinary(file, "posts");
        return upload.url;
      });

      uploadedImages = await Promise.all(uploadTask);
    }

    const post = await Post.create({
      content: content.trim(),
      owner: req.user._id,
      tags: tags?.split(",").map((tag) => tag.trim()) || [],
      images: uploadedImages || [],
    });

    if (!post) {
      throw new ApiError(500, "Failed to create post");
    }

    res
      .status(201)
      .json(new ApiResponse(201, post, "Post created successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to create post: ${error.message}`);
  }
});

const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "Post ID is required");
  }

  try {
    const post = await Post.aggregate([
      {
        $match:{
          _id:postId
        }
      }
    ]);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, post, "Post retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve post: ${error.message}`);
  }
});

const editPost = asyncHandler(async (req, res) => {
  const { content, tags } = req.body;
  const { postId } = req.params;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "content is required");
  }

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "post id is not valid object id");
  }

  const post = await Post.findById(postId);

  if (req.user._id.toString() !== post.owner.toString()) {
    throw new ApiError(403, "you are not the owner of the post");
  }

  post.content = content;
  post.tags = tags ? tags.split(",").map((tag) => tag.trim()) : post.tags;

  await post.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, post, "post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new ApiError(400, "post id is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you aur not authorized to delete the post");
  }

  await post.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, "post deleted sucessfully"));
});

const archivePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }
  const { postId } = req.params;

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "invalid post Id");
  }

  const post = await Post.findById(postId);
  
  if (!post) {
    throw new ApiError(404, "post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not the owner of post");
  }

  if (post.isArchived) {
    throw new ApiError(400, "post already archived");
  }

  post.isArchived = true;
  await post.save({ validateBeforeSave: false });

  res.status(201).json(new ApiResponse(201, {}, "post archived sucessfully"));
});

const unArchivePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }
  const { postId } = req.params;

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "invalid post Id");
  }

  const post = await Post.findById(postId);
  
  if (!post) {
    throw new ApiError(404, "post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not the owner of post");
  }

  if (!post.isArchived) {
    throw new ApiError(400, "post not archived");
  }
  post.isArchived = false;
  await post.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, {}, "post unarchived successfully"));
});
 //to do
const getNewPosts = asyncHandler(async(req,res)=>{

})
export { createPost, getPost, editPost, deletePost, archivePost, unArchivePost };

