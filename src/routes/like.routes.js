import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {toggleVideoLike,toggleCommentLike,toggleTweetLike} from "../controllers/like.controller.js"

router.use(checkAuth)

router.route("/v/:videoId").post(toggleVideoLike);
router.route("/c/:commentId").post(toggleCommentLike);
router.route("/t/:tweetId").post(toggleTweetLike);


export default router;
