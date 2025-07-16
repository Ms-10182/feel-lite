import { Router } from "express";
import {
  
  loginUser,
  logoutUser,
  getUser,
  updateAvatar,
  updateCoverImage,
  changeUserName,
  loginUsingRefreshToken,
  logoutFromEveryWhere,
} from "../controllers/user.controller.js";

import {
  registerUser,
  changePassword,
  generateOtp,
  updateAccountDetails,
  deleteAccount,
  forgotPassword
} from "../controllers/otp_users/otp.users.controller.js";
import {
  verifyJWT,
  verifyRefreshToken,
} from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";
import { relogin } from "../middlewares/relogin.middleware.js";
import { verifyOtp } from "../middlewares/verifyOtp.middleware.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/getUser").get(verifyJWT, checkBanStatus, getUser);
router.route("/updateAvatar").patch(verifyJWT, checkBanStatus, updateAvatar);
router
.route("/updateCoverImage")
.patch(verifyJWT, checkBanStatus, updateCoverImage);
router
.route("/changeUsername")
.patch(verifyJWT, checkBanStatus, changeUserName);
router
.route("/loginUsingRefreshToken")
.post(verifyRefreshToken, loginUsingRefreshToken);
router.route("/logoutFromEveryWhere").post(verifyJWT, logoutFromEveryWhere);

//otp routes
router.route("/unauth/generateOtp").post(generateOtp);
router.route("/forgotPassword").post(forgotPassword);
router.route("/register").post(registerUser);

router.use(verifyJWT);
router.use(checkBanStatus);
router.route("/auth/generateOtp").post(generateOtp);
router.route("/deleteAccount").delete(relogin,verifyOtp, deleteAccount);
router.route("/changePassword").patch(verifyOtp,changePassword);
router.route("/updateAccountDetails").patch(verifyOtp,updateAccountDetails);

export default router;
