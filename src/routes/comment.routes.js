import { Router } from "express";
import {
  checkAuth,
  checkOptionalAuth,
} from "../middlewares/auth.middleware.js";
const router = Router();

import {
  addComment,
  getVideoComments,
  deleteComment,
} from "../controllers/comment.controller.js";

router
  .route("/:videoId")
  .post(checkAuth, addComment)
  .get(checkOptionalAuth, getVideoComments);

router.route("/c/:commentId").delete(checkAuth, deleteComment);

export default router;
