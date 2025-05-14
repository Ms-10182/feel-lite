import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";

const checkBanStatus = asyncHandler(async (req, res, next) => {
  if (req.user?.isBanned) {
    // Check if ban has expired
    if (req.user.banExpiresAt && new Date() > req.user.banExpiresAt) {
      // Ban expired, update user status
      await User.findByIdAndUpdate(req.user._id, {
        isBanned: false,
        banReason: null,
        banExpiresAt: null
      });
      return next();
    }
    
    throw new ApiError(403, `Your account has been suspended: ${req.user.banReason || "Violation of terms"}`);
  }
  next();
});

export { checkBanStatus };