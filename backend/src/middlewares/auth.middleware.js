import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    //  console.log(token)
    if (!token) {
      throw new ApiError(401, "unauthorized access");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(4001, "invalid access token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "caught invalid  access token");
  }
});

const verifyRefreshToken = asyncHandler(async (req, _, next) => {
  //get the refresh token from user
  //decode the token
  //get id from decode token
  //fetch user
  //compare the token
  //if correct then generate new tokens
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    //  console.log(token)
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized access");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log(decodedToken);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "invalid access token or expired");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "invalid token or expired");
    }
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "caught invalid access token");
  }
});
export { verifyJWT, verifyRefreshToken };
