import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import { addComment } from "../controllers/comment.controller.js";

router.route("/:videoId").post(checkAuth, addComment);

export default router;
