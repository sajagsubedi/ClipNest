import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideo} from "../controllers/like.controller.js"

router.use(checkAuth)

router.route("/v/:videoId").post(toggleVideoLike);
router.route("/c/:commentId").post(toggleCommentLike);
router.route("/t/:tweetId").post(toggleTweetLike);
router.route("/videos").post(getLikedVideo);


export default router;
