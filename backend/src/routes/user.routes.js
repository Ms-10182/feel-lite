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

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/getUser").get(verifyJWT, getUser);
router.route("/changePassword").patch(verifyJWT, changePassword);
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);
router.route("/updateAvatar").patch(verifyJWT, updateAvatar);
router.route("/updateCoverImage").patch(verifyJWT, updateCoverImage);
router.route("/changeUsername").patch(verifyJWT, changeUserName);
router.route("/loginUsingRefreshToken").post(verifyRefreshToken, loginUsingRefreshToken);
router.route("/logoutFromEveryWhere").post(verifyJWT,logoutFromEveryWhere)

export default router;
