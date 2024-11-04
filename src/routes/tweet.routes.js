import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {createTweet } from "../controllers/tweet.controller.js"

router.route("/").post(checkAuth,createTweet)

export default router;