import { Router } from "express";
import {  registerUser, loginUser, logoutUser, getUser, changePassword, updateAccountDetails } from "../controllers/user.controller.js"; // Fixed typo
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/getUser").get(verifyJWT,getUser)
router.route("/changePassword").post(verifyJWT,changePassword);
router.route("/updateAccountDetails").post(verifyJWT,updateAccountDetails);

export default router;