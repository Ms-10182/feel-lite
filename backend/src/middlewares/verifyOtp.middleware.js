import { asyncHandler } from "../utils/asyncHandler.js";
import { Otp } from "../models/Otp.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const verifyOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  // Ensure user ID is present (usually set by previous auth middleware)
  if (!req.user) {
    throw new ApiError(403, "Unauthorized access to OTP middleware");
  }

  // Validate OTP format
  if (!otp  || otp.toString().length !== 6) {
    throw new ApiError(400, "Invalid OTP format");
  }

  // Fetch OTP from DB
  const dbOtp = await Otp.findOne({
    owner: new mongoose.Types.ObjectId(req.user._id),
  }).sort({ createdAt: -1 });

  if (!dbOtp) {
    throw new ApiError(400, "No OTP found for this user");
  }

  // Check expiry (10 minutes window)
  const currentTime = Date.now(); // returns timestamp in ms
  const createdTime = new Date(dbOtp.createdAt).getTime();
  const elapsedTime = currentTime - createdTime;

  if (elapsedTime > 10 * 60 * 1000) {
    // 10 minutes in ms
    throw new ApiError(400, "OTP has expired");
  }

  const isOtpValid = await dbOtp.isOtpCorrect(otp);

  if (!isOtpValid) {
    throw new ApiError(400, "otp is incorrect");
  }

  req.isOtpVerified = true;

  // Delete OTP after successful verification
  await dbOtp.deleteOne();
  console.log("otp deleted");
  
  next();
});

export { verifyOtp };
