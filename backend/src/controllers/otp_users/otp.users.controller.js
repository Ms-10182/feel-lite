import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { sendEmail } from "../../utils/mailer.js";
import { User } from "../../models/User.model.js";
import { Otp } from "../../models/Otp.model.js";
import { Comment } from "../../models/Comment.model.js";
import { Bookmark } from "../../models/Bookmark.model.js";
import { BookmarkedPost } from "../../models/BookmarkedPost.model.js";
import { Post } from "../../models/Post.model.js";
import { Like } from "../../models/Like.model.js";
import { Thread } from "../../models/Thread.models.js";

const generateOtp = asyncHandler(async (req, res) => {
  let userId;
  let userEmail;

  // For authenticated users (like change password, update account)
  if (req.user) {
    console.log("Generating OTP for authenticated user");
    userId = req.user._id;
    userEmail = req.user.email || (await User.findById(req.user._id)).email;
  } else {
    // For unauthenticated users (like forgot password)
    const { email } = req.body;
    console.log("Generating OTP for unauthenticated user");

    if (!email) {
      throw new ApiError(400, "Email is required for OTP generation");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found with this email");
    }

    userId = user._id;
    userEmail = user.email;
  }


  const lastOtp = await Otp.findOne({
    owner: userId,
  }).sort({ createdAt: -1 });

  if (lastOtp) {
    const currentTime = Date.now();
    const lastOtpTime = new Date(lastOtp.createdAt).getTime();
    const differenceTime = currentTime - lastOtpTime;

    if (differenceTime < 2 * 60 * 1000) {
      throw new ApiError(400, "Wait 2 minutes before generating new OTP");
    }
  }

  // Always clean up any existing OTPs before creating new one
  await Otp.deleteMany({ owner: userId });

  const newOtpNum = Math.floor(100000 + Math.random() * 900000);

  try {
    await Otp.create({
      owner: userId,
      otp: newOtpNum,
      expiry: new Date(Date.now() + 10 * 60 * 1000),
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "failed to generate otp");
  }

  // After OTP is created
  await sendEmail({
    to: userEmail, // make sure you fetch user's email
    subject: "Your OTP Code",
    text: `Your OTP is ${newOtpNum}. It will expire in 10 minutes.`,
    html: `<p>Your OTP is <b>${newOtpNum}</b>. It will expire in 10 minutes.</p>`,
  });

  res.status(200).json(new ApiResponse(200, "otp sent to mail"));
});

const changePassword = asyncHandler(async (req, res) => {
  if (!req.isOtpVerified) {
    throw new ApiError(400, "otp not verified");
  }
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword, newPassword);
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "both old and new passwords are required");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "same password not allowed");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  console.log(isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(401, "old password wrong");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed sucessfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  if (!req.isOtpVerified) {
    throw new ApiError(403, "otp not verified at updateAccountDetails");
  }
  const { newEmail } = req.body;

  if (!newEmail) {
    throw new ApiError(401, "please provide valid email id");
  }

  const isEmailAlreadyRegistered = await User.findOne({ email: newEmail });

  if (isEmailAlreadyRegistered) {
    throw new ApiError(
      400,
      "email already registered, provide a different email"
    );
  }

  const user = await User.findById(req.user?._id);

  user.email = newEmail;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "account updated successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "unauthorized access");
  }

  try {
    // 1. Get user's post IDs first (we'll need these for some cleanup operations)
    const userPostIds = await Post.find({ owner: req.user._id }).distinct(
      "_id"
    );
    console.log(`Found ${userPostIds.length} posts owned by user`);

    // 2. Get user's comment IDs (needed for thread deletion)
    const userCommentIds = await Comment.find({ owner: req.user._id }).distinct(
      "_id"
    );
    console.log(`Found ${userCommentIds.length} comments owned by user`);

    // 3. First delete bookmark-related data (bookmarked posts, then bookmarks)
    const userBookmarks = await Bookmark.find({ owner: req.user._id }).select(
      "_id"
    );
    const bookmarkIds = userBookmarks.map((bookmark) => bookmark._id);

    if (bookmarkIds.length > 0) {
      const deletedBookmarkedPosts = await BookmarkedPost.deleteMany({
        bookmark: { $in: bookmarkIds },
      });
      console.log(
        `Deleted ${deletedBookmarkedPosts.deletedCount} bookmarked posts`
      );
    }

    const deletedBookmarks = await Bookmark.deleteMany({ owner: req.user._id });
    console.log(`Deleted ${deletedBookmarks.deletedCount} bookmarks`);

    // 4. Delete user's posts from other users' bookmarks
    if (userPostIds.length > 0) {
      const deletedOthersBookmarkedPosts = await BookmarkedPost.deleteMany({
        post: { $in: userPostIds },
      });
      console.log(
        `Deleted ${deletedOthersBookmarkedPosts.deletedCount} bookmarked posts owned by user from others' bookmarks`
      );
    }

    // 5. Delete thread comments and threads related to user's comments
    const deletedThreadedComments = await Thread.deleteMany({
      owner: req.user._id,
    });
    console.log(
      `Deleted ${deletedThreadedComments.deletedCount} threaded comments owned by user`
    );

    if (userCommentIds.length > 0) {
      const deletedCommentThreads = await Thread.deleteMany({
        comment: { $in: userCommentIds },
      });
      console.log(
        `Deleted ${deletedCommentThreads.deletedCount} threads on user's comments`
      );
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
      const deletedPostLikes = await Like.deleteMany({
        post: { $in: userPostIds },
      });
      deletedLikesOnContent += deletedPostLikes.deletedCount;
    }

    if (userCommentIds.length > 0) {
      const deletedCommentLikes = await Like.deleteMany({
        comment: { $in: userCommentIds },
      });
      deletedLikesOnContent += deletedCommentLikes.deletedCount;
    }
    console.log(`Deleted ${deletedLikesOnContent} likes on user's content`);

    // 9. Delete comments on user's posts
    if (userPostIds.length > 0) {
      // Find comment IDs on user's posts (to clean up threads later)
      const commentsOnUserPosts = await Comment.find({
        post: { $in: userPostIds },
      }).distinct("_id");

      // Delete threads on comments on user's posts
      if (commentsOnUserPosts.length > 0) {
        const deletedThreadsOnComments = await Thread.deleteMany({
          comment: { $in: commentsOnUserPosts },
        });
        console.log(
          `Deleted ${deletedThreadsOnComments.deletedCount} threads on comments on user's posts`
        );
      }

      // Delete the comments themselves
      const deletedCommentsOnPosts = await Comment.deleteMany({
        post: { $in: userPostIds },
      });
      console.log(
        `Deleted ${deletedCommentsOnPosts.deletedCount} comments on user's posts`
      );
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
    .json(
      new ApiResponse(
        200,
        {},
        "User account and all associated data deleted successfully"
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const {email, otp , newPassword} = req.body;

  if([email,newPassword].some((item)=>item.trim()==="") || otp.length!==6){
    throw new ApiError(400,"either email,newPassword is empty or otp is invalid")
  }
  const user = await User.findOne({email:email});
  console.log("1")
  const dbOtp = await Otp.findOne({owner:user._id})
  console.log("2")
  
  const isOtpValid = dbOtp.isOtpCorrect(otp);
  console.log("3")

  if(!isOtpValid){
    throw new ApiError(400,"otp is incorrect");
  }
  if(!dbOtp){
    throw new ApiError(400,"no otp found for this user");
  }
  if(!user){
    throw new ApiError(404,"user not found with this email");
  }
  user.password = newPassword;
  await user.save({validateBeforeSave:false});

  // Delete OTP after successful verification
  await dbOtp.deleteOne();
  console.log("otp deleted");
  res.status(200).json(new ApiResponse(200, {}, "password changed successfully"));
});

export { generateOtp, changePassword, updateAccountDetails, deleteAccount, forgotPassword };
