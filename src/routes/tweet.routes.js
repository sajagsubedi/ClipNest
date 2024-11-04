import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import { createTweet, getUserTweets } from "../controllers/tweet.controller.js";

router.route("/").post(checkAuth, createTweet);
router.route("/user/:userId").get(getUserTweets);

export default router;
