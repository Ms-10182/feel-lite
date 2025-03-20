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

  const { email, password } = req.body;

  if ([email, password].some((item) => item?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
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

  const user = await User.create({
    username,
    email,
    avatar: avatarUrl,
    coverImage: coverImageUrl,
    password,
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
      new ApiResponse(200, { user: createdUser }, "user registered sucessfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //get id pass, check if correct fetch user , generate access and referesh token and return user

  const { email, password } = req.body;
  console.log(email, password);
  const isLoggedIn =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (isLoggedIn) throw new ApiError(400, "already logged in");

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

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
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

const getUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "user retrieved successfully")
    );
});

const changePassword = asyncHandler(async (req, res) => {
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

const updateAvatar = asyncHandler(async (req, res) => {
  const { avatarIdx } = req.body;

  if (!avatarIdx && avatarIdx != 0 || typeof(avatarIdx)!="number") {
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

const updateCoverImage = asyncHandler(async(req,res)=>{
  const {coverImageIdx} = req.body;

  if(!coverImageIdx && coverImageIdx!=0 || typeof(coverImageIdx)!="number"){
    throw new ApiError(401,"please enter a valid cover image index");
  }

  const isCoverImageValid = isCoverImageAvailable(coverImageIdx)

  if(!isCoverImageValid){
    throw new ApiError(401,"cover image index is not available");
  }

  const newCoverImageUrl = getCustomCoverImageUrl(coverImageIdx);

  const user = await User.findById(req.user?._id)

  user.coverImage= newCoverImageUrl;
  await user.save({validateBeforeSave:false});

  res.status(200).json(new ApiResponse(200,{},"cover image updated successfully"))
})

const changeUserName = asyncHandler(async (req,res)=>{
  const newUserName = generateUsername();

  const user = await User.findById(req.user?._id);

  user.username = newUserName;
  await user.save({validateBeforeSave:true})

  res.status(200).json(new ApiResponse(200,{},"username updated successfully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  changeUserName
};
