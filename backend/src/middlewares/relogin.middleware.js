import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.model.js";

const relogin = asyncHandler(async(req,_,next)=>{
  if(!req.user){
    throw new ApiError(403,"unauthorized error");
  }

  console.log(req);
  const {password} = req.body;

  if(!password || password.trim()===""){
    throw new ApiError(400,"password is required");
  }

  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  // Check if the password is correct
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password");
  }
    // If password is correct, proceed to the next middleware
    next();
})

export { relogin };