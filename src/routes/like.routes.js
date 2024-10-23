import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {toggleVideoLike,toggleCommentLike} from "../controllers/like.controller.js"

router.use(checkAuth)

router.route("/v/:videoId").post(toggleVideoLike);
router.route("/c/:commentId").post(toggleCommentLike);


export default router;
