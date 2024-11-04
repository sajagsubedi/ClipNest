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
  deleteTweet,
} from "../controllers/tweet.controller.js";

router.route("/").post(checkAuth, createTweet);
router.route("/user/:userId").get(checkOptionalAuth, getUserTweets);
router
  .route("/:tweetId")
  .patch(checkAuth, updateTweet)
  .delete(checkAuth, deleteTweet);

export default router;
