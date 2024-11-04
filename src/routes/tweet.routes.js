import { Router } from "express";
import {
  checkAuth,
  checkOptionalAuth,
} from "../middlewares/auth.middleware.js";
const router = Router();
import {
  createTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

router.route("/").post(checkAuth, createTweet);
router.route("/user/:userId").get(checkOptionalAuth, getUserTweets);
router.route("/:tweetId").patch(checkAuth, updateTweet);

export default router;
