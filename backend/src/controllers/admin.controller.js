import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import mongoose from "mongoose";

// Middleware to verify admin status
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access forbidden: Admin privileges required");
  }
  
  next();
});

// Ban a user
export const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason, duration } = req.body; // Duration in hours, null for permanent ban
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  
  const userToBan = await User.findById(userId);
  if (!userToBan) {
    throw new ApiError(404, "User not found");
  }
  
  // Calculate ban expiration time if duration is provided
  let banExpiresAt = null;
  if (duration) {
    banExpiresAt = new Date();
    banExpiresAt.setHours(banExpiresAt.getHours() + Number(duration));
  }
  
  // Update user with ban information
  userToBan.isBanned = true;
  userToBan.banReason = reason || "Violation of community guidelines";
  userToBan.banExpiresAt = banExpiresAt;
  userToBan.logoutPin = Math.floor(Math.random() * 10000); // Force logout
  
  await userToBan.save({ validateBeforeSave: false });
  
  res.status(200).json(
    new ApiResponse(
      200,
      { 
        userId: userToBan._id,
        isBanned: true,
        reason: userToBan.banReason,
        expiresAt: userToBan.banExpiresAt 
      },
      `User banned ${duration ? `for ${duration} hours` : "permanently"}`
    )
  );
});

// Unban a user
export const unbanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  if (!user.isBanned) {
    throw new ApiError(400, "User is not banned");
  }
  
  // Unban the user
  user.isBanned = false;
  user.banReason = null;
  user.banExpiresAt = null;
  
  await user.save({ validateBeforeSave: false });
  
  res.status(200).json(
    new ApiResponse(
      200,
      { userId: user._id },
      "User unbanned successfully"
    )
  );
});

// Get all banned users
export const getBannedUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    select: '-password -refreshToken',
    sort: { banExpiresAt: 1 } // Sort by ban expiry time, null (permanent bans) will be at the end
  };
  
  const bannedUsers = await User.paginate({ isBanned: true }, options);
  
  res.status(200).json(
    new ApiResponse(
      200,
      bannedUsers,
      "Banned users retrieved successfully"
    )
  );
});
