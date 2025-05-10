import { Bookmark } from "../models/Bookmark.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Post } from "../models/Post.model.js";
import { BookmarkedPost } from "../models/BookmarkedPost.model.js";

//create new bookmark

const CreateNewBookmark = asyncHandler(async (req, res) => {  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  const { title, description } = req.body;
  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }

  try {
    const newBookmark = await Bookmark.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      owner: req.user._id,
    });

    res
      .status(201)
      .json(new ApiResponse(201, newBookmark, "Bookmark created successfully"));
  } catch (error) {
    throw new ApiError(500, `Failed to create bookmark: ${error.message}`);
  }
});

//delete book mark

const deleteBookmark = asyncHandler(async (req, res) => {
  const { bookMarkId } = req.params;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!bookMarkId || !isValidObjectId(bookMarkId)) {
    throw new ApiError(400, "Bookmark ID is not valid");
  }

  try {
    const bookmark = await Bookmark.findById(bookMarkId);

    if (!bookmark) {
      throw new ApiError(404, "Bookmark doesn't exist");
    }

    if (req.user._id.toString() !== bookmark.owner.toString()) {
      throw new ApiError(403, "You are not the owner of this bookmark");
    }
    
    await BookmarkedPost.deleteMany({
      bookmark: new mongoose.Types.ObjectId(bookMarkId),
    });
    await bookmark.deleteOne();

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Bookmark deleted successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete bookmark: ${error.message}`);
  }
});

// add post to book mark
const addPostToBookmark = asyncHandler(async (req, res) => {
  const { postId, bookMarkId } = req.body;
  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "Post ID is not valid");
  }

  if (!bookMarkId || !isValidObjectId(bookMarkId)) {
    throw new ApiError(400, "Bookmark ID is not valid");
  }

  try {
    const bookmark = await Bookmark.findById(bookMarkId);

    if (!bookmark) {
      throw new ApiError(404, "Bookmark not found");
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (req.user._id.toString() !== bookmark.owner.toString()) {
      throw new ApiError(403, "You are not the owner of this bookmark");
    }

    const isPostAlreadyAdded = await BookmarkedPost.findOne({
      post: post._id,
      bookmark: bookmark._id,
    });

    if (isPostAlreadyAdded) {
      throw new ApiError(400, "Post already added to bookmark");
    }


    const addedPost = await BookmarkedPost.create({
      post: post._id,
      bookmark: bookmark._id,
    });

    res.status(201).json(new ApiResponse(201, addedPost, "Post added successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to add post to bookmark: ${error.message}`);
  }
});
//delete post from bookmark

const removePostFromBookmark = asyncHandler(async (req, res) => {
  const { postId, bookMarkId } = req.body;
  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "Not a valid post ID");
  }

  if (!bookMarkId || !isValidObjectId(bookMarkId)) {
    throw new ApiError(400, "Not a valid bookmark ID");
  }

  try {
    const bookmarkCollection = await Bookmark.findById(bookMarkId);

    if (!bookmarkCollection) {
      throw new ApiError(404, "Bookmark collection not found");
    }

    if (req.user._id.toString() !== bookmarkCollection.owner.toString()) {
      throw new ApiError(403, "You are not the owner of this bookmark");
    }

    const result = await BookmarkedPost.findOneAndDelete({
      post: new mongoose.Types.ObjectId(postId),
      bookmark: new mongoose.Types.ObjectId(bookMarkId),
    });

    if (!result) {
      throw new ApiError(404, "Post not found in this bookmark");
    }

    res.status(200).json(new ApiResponse(200, {}, "Post removed from bookmark successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to remove post from bookmark: ${error.message}`);
  }
});

//get all book mark of user

const getAllBookmarks = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  try {
    // fetch from bookmark -> by owner: aggregate bookmark id with bookmarked post field bookmark
    const allBookmarks = await Bookmark.aggregate([
      {
        $match: { owner: req.user._id },
      },
      {
        $lookup: {
          from: "bookmarkedposts",
          localField: "_id",
          foreignField: "bookmark",
          as: "posts",
        },
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, allBookmarks, "Bookmarks fetched successfully"));
  } catch (error) {
    throw new ApiError(500, `Failed to fetch bookmarks: ${error.message}`);
  }
});

const getBookmarkedPosts = asyncHandler(async (req, res) => {
  const { bookmarkId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  if (!req.user) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!bookmarkId || !isValidObjectId(bookmarkId)) {
    throw new ApiError(400, "Invalid bookmark ID");
  }

  try {
    const bookmark = await Bookmark.findById(bookmarkId);

    if (!bookmark) {
      throw new ApiError(404, "Bookmark not found");
    }

    if (bookmark.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not the owner of this bookmark");
    }

    // Get total count for pagination
    const totalCount = await BookmarkedPost.countDocuments({
      bookmark: new mongoose.Types.ObjectId(bookmarkId)
    });

    // Get paginated results
    const bookmarkedPosts = await BookmarkedPost.aggregate([
      {
        $match: { bookmark: new mongoose.Types.ObjectId(bookmarkId) },
      },
      {
        $sort: { createdAt: -1 } // Sort by newest first
      },
      {
        $skip: skip
      },
      {
        $limit: limitNumber
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
          images: "$postDetails.images",
          createdAt: "$postDetails.createdAt",
        },
      },
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { 
            posts: bookmarkedPosts, 
            total: totalCount,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalCount / limitNumber)
          },
          "Bookmarked posts retrieved successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve bookmarked posts: ${error.message}`);
  }
});
export {
  CreateNewBookmark,
  deleteBookmark,
  addPostToBookmark,
  removePostFromBookmark,
  getAllBookmarks,
  getBookmarkedPosts
};


