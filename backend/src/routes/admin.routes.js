import { Router } from "express";
import { isAdmin, banUser, unbanUser, getBannedUsers } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication and admin check middleware to all admin routes
router.use(verifyJWT);
router.use(isAdmin);

// Ban management routes
router.route("/users/:userId/ban").post(banUser);
router.route("/users/:userId/unban").post(unbanUser);
router.route("/users/banned").get(getBannedUsers);

export default router;
