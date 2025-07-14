import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  getAvatarUrl,
  isAvatarAvailable,
  getCustomAvatarUrl,
} from "../utils/avatarSelector.js";
import {
  getCoverImageUrl,
  isCoverImageAvailable,
  getCustomCoverImageUrl,
} from "../utils/coverImageSelector.js";
import { generateUsername } from "../utils/usernameGenerator.js";
import { User } from "../models/User.model.js";
import { requiredAge } from "../constants.js";

const generateAccessAndRefreshToken = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //take user details
  //check if email exist of not
  //generate username
  //assign cover image
  //assign avtar
  //create user
  console.log("registering user");

  const { email, password, age } = req.body;

  if ([email, password].some((item) => item?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  if (age < requiredAge || typeof age != "number") {
    throw new ApiError(400, `age is too low, required age is ${requiredAge}`);
  }

  const existingUser = await User.findOne({
    email: email,
  });

  if (existingUser) {
    throw new ApiError(400, "user already exists");
  }

  const username = generateUsername();
  const avatarUrl = getAvatarUrl();
  const coverImageUrl = getCoverImageUrl();
  const logoutPin = Math.floor(Math.random()*10000)

  const user = await User.create({
    username,
    email,
    avatar: avatarUrl,
    coverImage: coverImageUrl,
    password,
    logoutPin:logoutPin
  });
  console.log(user);

  const createdUser = await User.findOne({ email }).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "user not registered");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200 ,{}, "user registered sucessfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //get id pass, check if correct fetch user , generate access and referesh token and return user

  const { email, password } = req.body;

  if ([email, password].some((item) => item?.trim() === "")) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "password is incorrect");
  }

  // Check if user is banned before generating tokens
  if (user.isBanned) {
    // Check if ban has expired
    if (user.banExpiresAt && new Date() > user.banExpiresAt) {
      // Ban expired, update user status
      user.isBanned = false;
      user.banReason = null;
      user.banExpiresAt = null;
      await user.save({ validateBeforeSave: false });
    } else {
      // User is banned
      throw new ApiError(403, `Your account has been suspended${user.banExpiresAt ? " until " + user.banExpiresAt.toLocaleDateString() : ""}: ${user.banReason || "Violation of terms"}`);
    }
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -email"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken })
    );
});

const loginUsingRefreshToken = asyncHandler(async (req, res) => {
  const user = req.user;

  // Check if user is banned before generating new tokens
  if (user.isBanned) {
    // Check if ban has expired
    if (user.banExpiresAt && new Date() > user.banExpiresAt) {
      // Ban expired, update user status
      user.isBanned = false;
      user.banReason = null;
      user.banExpiresAt = null;
      await user.save({ validateBeforeSave: false });
    } else {
      // User is banned
      throw new ApiError(403, `Your account has been suspended${user.banExpiresAt ? " until " + user.banExpiresAt.toLocaleDateString() : ""}: ${user.banReason || "Violation of terms"}`);
    }
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -email"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const logoutFromEveryWhere = asyncHandler(async(req,res)=>{
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  user.refreshToken = null;
  user.logoutPin = Math.floor(Math.random()*10000)
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out from every where"));
})

const getUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "user retrieved successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { avatarIdx } = req.body;

  if ((!avatarIdx && avatarIdx != 0) || typeof avatarIdx != "number") {
    throw new ApiError(401, "please enter a vaild avtar index");
  }
  const isAvatarIdxValid = isAvatarAvailable(avatarIdx);

  if (!isAvatarIdxValid) {
    throw new ApiError(400, "avatar index is not available");
  }

  const newAvatarUrl = getCustomAvatarUrl(avatarIdx);

  const user = await User.findById(req.user?._id);

  user.avatar = newAvatarUrl;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, {}, "avatar updated sucessfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const { coverImageIdx } = req.body;

  if (
    (!coverImageIdx && coverImageIdx != 0) ||
    typeof coverImageIdx != "number"
  ) {
    throw new ApiError(401, "please enter a valid cover image index");
  }

  const isCoverImageValid = isCoverImageAvailable(coverImageIdx);

  if (!isCoverImageValid) {
    throw new ApiError(401, "cover image index is not available");
  }

  const newCoverImageUrl = getCustomCoverImageUrl(coverImageIdx);

  const user = await User.findById(req.user?._id);

  user.coverImage = newCoverImageUrl;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "cover image updated successfully"));
});

const changeUserName = asyncHandler(async (req, res) => {
  const newUserName = generateUsername();

  const user = await User.findById(req.user?._id);

  user.username = newUserName;
  await user.save({ validateBeforeSave: true });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "username updated successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    throw new ApiError(400, "user id is required");
  }

  const user = await User.findById(userId).select(
    "-password -refreshToken"
  );  

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "user retrieved successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateAvatar,
  updateCoverImage,
  changeUserName,
  loginUsingRefreshToken,
  logoutFromEveryWhere,
  getUserById
};
