import { Router } from "express";
import { createPost, deletePost, editPost, getPost } from "../controllers/post.controller.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { compressImagesMiddleware } from "../middlewares/imageCompressor.middleware.js";

const router = Router()

router.route("/createPost").post(verifyJWT,upload.array("postImage",5),compressImagesMiddleware,createPost)

router.route("/getPost/:postId").get(getPost)
router.route("/editPost/:postId").all(verifyJWT,editPost)
router.route("/deletePost/:postId").delete(verifyJWT,deletePost)

export default router