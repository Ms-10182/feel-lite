import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getAvatarUrl } from "../utils/avatarSelector.js";
import { getCoverImageUrl } from "../utils/coverImageSelector.js";
import { generateUsername } from "../utils/usernameGenerator.js";
import { User } from "../models/User.model.js";

const generateAccessAndRefreshToken = async(user) => {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
  
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false });
    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,error)
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
    throw new ApiError(500, "user not registed");
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
  console.log(email,password)
  const isLoggedIn =
    req.cookies?.accessToken || req.header("Authorization")?.("Bearer ", "");

  if (isLoggedIn) throw new ApiError(400, "already loggedIn");

  if ([email, password].some((item) => item?.trim === "")) {
    throw new ApiError(400, "email and password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly:true,
    secure:true
  }

  res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse (200,{user:loggedInUser,accessToken,refreshToken}))
});

const logoutUser = asyncHandler(async(req,res)=>{

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  const options ={
    httpOnly:true,
    secure:true,
  }

  res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out"))
})

export { registerUser ,loginUser,logoutUser}
