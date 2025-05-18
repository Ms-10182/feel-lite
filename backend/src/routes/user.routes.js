import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  changeUserName,
  loginUsingRefreshToken,
  logoutFromEveryWhere,
} from "../controllers/user.controller.js";
import { verifyJWT, verifyRefreshToken } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/banChecker.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/getUser").get(verifyJWT, checkBanStatus, getUser);
router.route("/changePassword").patch(verifyJWT, checkBanStatus, changePassword);
router.route("/updateAccountDetails").patch(verifyJWT, checkBanStatus, updateAccountDetails);
router.route("/updateAvatar").patch(verifyJWT, checkBanStatus, updateAvatar);
router.route("/updateCoverImage").patch(verifyJWT, checkBanStatus, updateCoverImage);
router.route("/changeUsername").patch(verifyJWT, checkBanStatus, changeUserName);
router.route("/loginUsingRefreshToken").post(verifyRefreshToken, loginUsingRefreshToken);
router.route("/logoutFromEveryWhere").post(verifyJWT, logoutFromEveryWhere)

export default router;
