import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.route("/health").get((req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200, 
        { status: "healthy", serverTime: new Date().toISOString() }, 
        "API server is running"
      )
    );
});

export default router;
