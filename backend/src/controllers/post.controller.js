import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/Post.model.js"; 
import { Comment } from "../models/Comment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import { Like } from "../models/Like.model.js";
import mongoose from "mongoose";

const createPost = asyncHandler(async (req, res) => {
  console.log("Creating post with body:", req.body);
  console.log("Files received:", req.files);
  console.log("User:", req.user);
  
  console.log(req.body);
  console.log(req.compressedImages);
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
        $match: {
          _id: new mongoose.Types.ObjectId(postId),
        },
      },{
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likes",
        },
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
                    cond: { $eq: ["$$like.likedBy", req.user?._id] } 
                  }}}, 
                  0
                ]
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $match: { "owner.isBanned": { $ne: true } },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          images: 1,
          tags: 1,
          createdAt: 1,
          totalLikes: 1,
          isLiked: 1,
          owner: {
            _id: "$owner._id",
            username: "$owner.username",
            avatar: "$owner.avatar",
          },
        },
      },
    ]);
    console.log("Post found:", post);

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
  res
    .status(200)
    .json(new ApiResponse(200, {}, "post unarchived successfully"));
});

const getArchivedPosts = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }
  
  const { limit = 20, page = 1 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  
  const postsAggregate = Post.aggregate([
    { $match: { owner: req.user._id, isArchived: true } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "post_owner",
      },
    },
    { $unwind: "$post_owner" },
    { $match: { "post_owner.isBanned": { $ne: true } } },
    {
      $lookup:{
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes"
      }
    },
    {
      $addFields:{
        totalLikes:{
          $size: "$likes"
        },
        isLiked:{
          $cond:{
            if:{
              $gt: [
                { $size: { $filter: { 
                  input: "$likes", 
                  as: "like", 
                  cond: { $eq: ["$$like.likedBy", req.user._id] } 
                }}}, 
                0
              ]
            },
            then:true,
            else:false,
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        content: 1,
        images: 1,
        tags: 1,
        createdAt: 1,
        totalLikes: 1,
        isLiked: 1,
        owner: {
          _id: "$post_owner._id",
          username: "$post_owner.username",
          avatar: "$post_owner.avatar",
        },
      },
    },
  ]);

  const options = {
    page: pageNumber,
    limit: limitNumber
  };

  try {
    const result = await Post.aggregatePaginate(postsAggregate, options);

    if (!result || !result.docs || result.docs.length === 0) {
      throw new ApiError(404, "No archived posts found for this user");
    }

    res
      .status(200)
      .json(new ApiResponse(200, result, "Archived posts retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve archived posts: ${error.message}`);
  }
});

const getNewPosts = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }

  try {
    // Get tags from posts the user has liked
    const likedPostsTags = await Like.aggregate([
      // Match likes by this user and that have a post (not comment likes)
      {
        $match: {

          likedBy: req.user._id,
          post: { $exists: true, $ne: null },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 40 },
      { $project: { post: 1 } },
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "post_details",
          pipeline: [
            {
              $match: {
                isArchived: { $ne: true },
              },
            },
            { $project: { tags: 1, owner: 1 } },
          ],
        },
      },
      // Filter out posts that don't exist anymore
      { $match: { post_details: { $ne: [] } } },
      { $unwind: "$post_details" },
      // Flatten the tags array
      { $unwind: "$post_details.tags" },
      // Group by tag to count occurrences
      {
        $group: {
          _id: "$post_details.tags",
          count: { $sum: 1 },
        },
      },
      // Sort by popularity
      { $sort: { count: -1 } },
      // Limit to top tags
      { $limit: 10 },
      { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);
    
    const commentedPostsTags = await Comment.aggregate([
      // Match likes by this user and that have a post (not comment likes)
      {
        $match: {
          owner: req.user._id,
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 40 },
      { $project: { post: 1 } },
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "post_details",
          pipeline: [
            {
              $match: {
                isArchived: { $ne: true },
              },
            },
            { $project: { tags: 1, owner: 1 } },
          ],
        },
      },
      // Filter out posts that don't exist anymore
      { $match: { post_details: { $ne: [] } } },
      { $unwind: "$post_details" },
      // Flatten the tags array
      { $unwind: "$post_details.tags" },
      // Group by tag to count occurrences
      {
        $group: {
          _id: "$post_details.tags",
          count: { $sum: 1 },
        },
      },
      // Sort by popularity
      { $sort: { count: -1 } },
      // Limit to top tags
      { $limit: 10 },
      { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);
    console.log("User's liked post tags:", likedPostsTags);
    console.log("User's commented post tags:", commentedPostsTags);

    // Merge the tag arrays intelligently to combine counts for duplicate tags
    const tagCountMap = new Map();

    // Process liked post tags
    likedPostsTags.forEach((tagObj) => {
      tagCountMap.set(tagObj.tag, tagObj.count);
    });

    // Process commented post tags, combining counts for duplicates
    commentedPostsTags.forEach((tagObj) => {
      const currentCount = tagCountMap.get(tagObj.tag) || 0;
      tagCountMap.set(tagObj.tag, currentCount + tagObj.count);
    });

    // Convert the map back to an array and sort by count
    const preferredTags = Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({
        tag,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    console.log("User's merged preferred tags:", preferredTags);

    // Use these tags to find recommended posts
    const recommendedPosts = await Post.aggregate([
      // Find non-archived posts
      { $match: { isArchived: { $ne: true } } },
      // Lookup the post owner
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "post_owner",
        },
      },
      { $unwind: "$post_owner" },
      // Filter out posts from banned users
      { $match: { "post_owner.isBanned": { $ne: true } } },
      // Only include posts that have tags matching user's interests
      ...(preferredTags.length > 0
        ? [
            {
              $match: {
                tags: {
                  $in: preferredTags.map((tag) => tag.tag),
                },
              },
            },
          ]
        : []),
      // Sort by newest first
      { $sort: { createdAt: -1 } },
      // Limit results
      { $limit: 20 },
      {
        $lookup:{
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likes"
        }
      },
      {
        $addFields:{
          totalLikes:{
            $size: "$likes"
          },
          isLiked:{
            $cond:{
              if:{
                $gt: [
                  { $size: { $filter: { 
                    input: "$likes", 
                    as: "like", 
                    cond: { $eq: ["$$like.likedBy", req.user._id] } 
                  }}}, 
                  0
                ]
              },
              then:true,
              else:false,
            }
          }
        }
      },
      {
        $lookup: {
          from: "bookmarkedposts",
          let: { postId: "$_id" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $eq: ["$post", "$$postId"] 
                } 
              } 
            },
            { 
              $lookup: {
                from: "bookmarks",
                localField: "bookmark",
                foreignField: "_id",
                as: "bookmarkDetails"
              } 
            },
            { $match: { "bookmarkDetails.owner": req.user._id } },
          ],
          as: "userBookmarks"
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
          },
          isBookmarked: { $gt: [ { $size: "$userBookmarks" }, 0 ] }
        }
      },
      // Project needed fields
      {
        $project: {
          _id: 1,
          content: 1,
          images: 1,
          tags: 1,
          createdAt: 1,
          totalLikes: 1,
          isLiked: 1,
          isBookmarked: 1,
          owner: {
            _id: "$post_owner._id",
            username: "$post_owner.username",
            avatar: "$post_owner.avatar",
          },
        },
      },
    ]);

    // If not enough recommended posts, add some recent posts
    let finalPosts = recommendedPosts;

    if (recommendedPosts.length < 10) {
      const recentPosts = await Post.aggregate([
        // Find non-archived posts
        { $match: { isArchived: { $ne: true } } },
        // Exclude posts already in recommended list
        { $match: { _id: { $nin: recommendedPosts.map((p) => p._id) } } },
        // Lookup the post owner
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "post_owner",
          },
        },
        { $unwind: "$post_owner" },
        // Filter out posts from banned users
        { $match: { "post_owner.isBanned": { $ne: true } } },
        // Sort by newest first
        { $sort: { createdAt: -1 } },
        // Limit results
        { $limit: 20 - recommendedPosts.length },
        // Add likes lookup
        {
          $lookup:{
            from: "likes",
            localField: "_id",
            foreignField: "post",
            as: "likes"
          }
        },
        // Add like count and isLiked fields
        {
          $addFields:{
            totalLikes:{
              $size: "$likes"
            },
            isLiked:{
              $cond:{
                if:{
                  $gt: [
                    { $size: { $filter: { 
                      input: "$likes", 
                      as: "like", 
                      cond: { $eq: ["$$like.likedBy", req.user._id] } 
                    }}}, 
                    0
                  ]
                },
                then:true,
                else:false,
              }
            }
          }
        },
        {
          $lookup: {
            from: "bookmarkedposts",
            let: { postId: "$_id" },
            pipeline: [
              { $match: { $expr: { $and: [
                { $eq: ["$post", "$$postId"] },
                { $eq: ["$bookmark", { $ifNull: [null, null] }] } // placeholder, will be replaced
              ] } } },
              { $lookup: {
                from: "bookmarks",
                localField: "bookmark",
                foreignField: "_id",
                as: "bookmarkDetails"
              } },
              { $unwind: "$bookmarkDetails" },
              { $match: { "bookmarkDetails.owner": req.user._id } },
            ],
            as: "userBookmarks"
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
            },
            isBookmarked: { $gt: [ { $size: "$userBookmarks" }, 0 ] }
          }
        },
        // Project needed fields
        {
          $project: {
            _id: 1,
            content: 1,
            images: 1,
            tags: 1,
            createdAt: 1,
            totalLikes: 1,
            isLiked: 1,
            isBookmarked: 1,
            owner: {
              _id: "$post_owner._id",
              username: "$post_owner.username",
              avatar: "$post_owner.avatar",
            },
          },
        },
      ]);

      finalPosts = [...recommendedPosts, ...recentPosts];
    }
    res.status(200).json(
      new ApiResponse(
        200,
        {
          posts: finalPosts,
          preferredTags: preferredTags,
        },
        "New posts retrieved successfully"
      )
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve posts: ${error.message}`);
  }
});

const getPostByHashTag = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }

  const { hashTag } = req.params;

  const { limit = 20, page = 1 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (!hashTag || hashTag.trim() === "") {
    throw new ApiError(400, "Invalid hashtag");
  }

  const trimmedHashTag = hashTag.trim();

  // Add sanitization
  const sanitizedHashTag = hashTag.replace(/[^a-zA-Z0-9]/g, '');
  if (sanitizedHashTag !== hashTag) {
      throw new ApiError(400, "Invalid hashtag format");
  }

  const postsAggregate = Post.aggregate([
    // First filter out archived posts (important to do early for performance)
    { 
      $match: { 
        isArchived: { $ne: true },
        // Match the tag directly in the tags array
        tags: trimmedHashTag
      } 
    },
    // Lookup the post owner
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "post_owner",
      },
    },
    { $unwind: "$post_owner" },
    // Filter out posts from banned users
    { $match: { "post_owner.isBanned": { $ne: true } } },
    // Sort by newest first
    { $sort: { createdAt: -1 } },
    // Lookup likes
    {
      $lookup:{
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes"
      }
    },
    // Add like count and isLiked fields
    {
      $addFields:{
        totalLikes:{
          $size: "$likes"
        },
        isLiked:{
          $cond:{
            if:{
              $gt: [
                { $size: { $filter: { 
                  input: "$likes", 
                  as: "like", 
                  cond: { $eq: ["$$like.likedBy", req.user._id] } 
                }}}, 
                0
              ]
            },
            then:true,
            else:false,
          }
        }
      }
    },
    {
      $lookup: {
        from: "bookmarkedposts",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $and: [
            { $eq: ["$post", "$$postId"] },
            { $eq: ["$bookmark", { $ifNull: [null, null] }] } // placeholder, will be replaced
          ] } } },
          { $lookup: {
            from: "bookmarks",
            localField: "bookmark",
            foreignField: "_id",
            as: "bookmarkDetails"
          } },
          { $unwind: "$bookmarkDetails" },
          { $match: { "bookmarkDetails.owner": req.user._id } },
        ],
        as: "userBookmarks"
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
        },
        isBookmarked: { $gt: [ { $size: "$userBookmarks" }, 0 ] }
      }
    },
    // Project needed fields
    {
      $project: {
        _id: 1,
        content: 1,
        images: 1,
        tags: 1,
        createdAt: 1,
        totalLikes: 1,
        isLiked: 1,
        isBookmarked: 1,
        owner: {
          _id: "$post_owner._id",
          username: "$post_owner.username",
          avatar: "$post_owner.avatar",
        },
      },
    },
  ]);

  const options = {
    page: pageNumber,
    limit: limitNumber
  };

  try {
    const result = await Post.aggregatePaginate(postsAggregate, options);

    if (!result || !result.docs || result.docs.length === 0) {
      throw new ApiError(404, "No posts found with this hashtag");
    }

    res
      .status(200)
      .json(new ApiResponse(200, result, "Posts fetched successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve posts: ${error.message}`);
  }
});

const getMyPosts  = asyncHandler(async(req,res)=>{
  if(!req.user){
    throw new ApiError(403, "unauthorized access");
  }

  const { limit = 20, page = 1 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const postsAggregate = Post.aggregate([
    // Match user's non-archived posts first for better performance
    { 
      $match: { 
        owner: req.user._id, 
        isArchived: { $ne: true } 
      } 
    },
    // Sort by newest first
    { $sort: { createdAt: -1 } },
    // Lookup post owner details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "post_owner",
      },
    },
    { $unwind: "$post_owner" },
    // Exclude posts from banned users
    { $match: { "post_owner.isBanned": { $ne: true } } },
    // Lookup likes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes"
      }
    },
    // Lookup bookmarks - fixed the incorrect query
    {
      $lookup: {
        from: "bookmarkedposts",
        localField: "_id",
        foreignField: "post",
        as: "bookmarkedPosts"
      }
    },
    {
      $lookup: {
        from: "bookmarks",
        let: { bookmarkedPosts: "$bookmarkedPosts" },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [
                  { $in: ["$_id", "$$bookmarkedPosts.bookmark"] },
                  { $eq: ["$owner", req.user._id] }
                ]
              } 
            } 
          }
        ],
        as: "userBookmarks"
      }
    },
    // Add computed fields
    {
      $addFields: {
        totalLikes: { $size: "$likes" },
        isLiked: {
          $cond: {
            if: {
              $gt: [
                { 
                  $size: { 
                    $filter: { 
                      input: "$likes", 
                      as: "like", 
                      cond: { $eq: ["$$like.likedBy", req.user._id] } 
                    }
                  } 
                }, 
                0
              ]
            },
            then: true,
            else: false
          }
        },
        isBookmarked: { $gt: [{ $size: "$userBookmarks" }, 0] }
      }
    },
    // Project only necessary fields
    {
      $project: {
        _id: 1,
        content: 1,
        images: 1,
        tags: 1,
        createdAt: 1,
        totalLikes: 1,
        isLiked: 1,
        isBookmarked: 1,
        owner: {
          _id: "$post_owner._id",
          username: "$post_owner.username",
          avatar: "$post_owner.avatar",
        }
      }
    }
  ]);
  const options = {
    page: pageNumber,
    limit: limitNumber
  };
  try {
    const result = await Post.aggregatePaginate(postsAggregate, options);

    if (!result || !result.docs || result.docs.length === 0) {
      throw new ApiError(404, "No posts found for this user");
    }

    res
      .status(200)
      .json(new ApiResponse(200, result, "Posts fetched successfully"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to retrieve posts: ${error.message}`);
  }
})

const getGlobalFeed = asyncHandler(async (req, res) => {
  
  // recent posts -> limit 10 post sort-> creaated at -1,
  // some recent post of before 24 hours
  //some posts of recent of like 36 hours
  // fetch recent interaction -> get user id -> fetch new posts of the user id
  // fetch recent posts post -> count likes ,count comments -> pick top 20
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }
  const { limit = 20, page = 1 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const postsAggregate = Post.aggregate([
    { $match: { isArchived: { $ne: true } } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "post_owner",
      },
    },
    { $unwind: "$post_owner" },
    { $match: { "post_owner.isBanned": { $ne: true } } },
    {
      $lookup:{
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes"
      }
    },
    {
      $addFields:{
        totalLikes:{
          $size: "$likes"
        },
        isLiked:{
          $cond:{
            if:{
              $gt: [
                { $size: { $filter: { 
                  input: "$likes", 
                  as: "like", 
                  cond: { $eq: ["$$like.likedBy", req.user._id] } 
                }}}, 
                0
              ]
            },
            then:true,
            else:false,
          }
        }
      }
    },
    {
      $lookup: {
        from: "bookmarkedposts",
        localField: "_id",
        foreignField: "post",
        as: "bookmarkedPosts"
      }
    },
    {
      $lookup: {
        from: "bookmarks",
        let: { bookmarkedPosts: "$bookmarkedPosts" },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [
                  { $in: ["$_id", "$$bookmarkedPosts.bookmark"] },
                  { $eq: ["$owner", req.user._id] }
                ]
              } 
            } 
          }
        ],
        as: "userBookmarks"
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
        },
        isBookmarked: { $gt: [ { $size: "$userBookmarks" }, 0 ] }
      }
    },
    {
      $project: {
        _id: 1,
        content: 1,
        images: 1,
        tags: 1,
        createdAt: 1,
        totalLikes: 1,
        isLiked: 1,
        isBookmarked: 1,
        owner: {
          _id: "$post_owner._id",
          username: "$post_owner.username",
          avatar: "$post_owner.avatar",
        },
      },
    },
  ]);

  const options = {
    page: pageNumber,
    limit: limitNumber
  };

    const result = await Post.aggregatePaginate(postsAggregate, options);

    if (!result || !result.docs || result.docs.length === 0) {
      throw new ApiError(404, "No posts found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, result, "Global feed posts fetched successfully"));

});

const getTrendingPosts = asyncHandler(async (req, res) => {
  if (!req.user) {  
    throw new ApiError(403, "You are not authorized");
  }
  const { limit = 20, page = 1 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const postsAggregate = Post.aggregate([
    { $match: { isArchived: { $ne: true } } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes",
      },
    },
    {
      $addFields: {
        totalLikes: { $size: "$likes" },
      },
    },
    { $sort: { totalLikes: -1, createdAt: -1 } }, // Sort by likes and then by date
    { $limit: limitNumber }, // Limit to the specified number of posts
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "post_owner",
      },
    },
    { $unwind: "$post_owner" },
    { $match: { "post_owner.isBanned": { $ne: true } } },
    {
      $project: {
        _id: 1,
        content: 1,
        images: 1,
        tags: 1,
        createdAt: 1,
        totalLikes: 1,
        owner: {
          _id: "$post_owner._id",
          username: "$post_owner.username",
          avatar: "$post_owner.avatar",
        },
      },
    },
  ])
  const options = {
    page: pageNumber,
    limit: limitNumber
  };
  const result = await Post.aggregatePaginate(postsAggregate, options);
  if (!result || !result.docs || result.docs.length === 0) {
    throw new ApiError(404, "No trending posts found");
  }

  res.status(200).json(new ApiResponse(200, result, "Trending posts fetched successfully"));

})
export {
  createPost,
  getPost,
  editPost,
  deletePost,
  archivePost,
  unArchivePost,
  getNewPosts,
  getPostByHashTag,
  getGlobalFeed,
  getMyPosts,
  getArchivedPosts,
  getTrendingPosts
};
