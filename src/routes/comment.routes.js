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
  updateComment,
} from "../controllers/comment.controller.js";

router
  .route("/:videoId")
  .post(checkAuth, addComment)
  .get(checkOptionalAuth, getVideoComments);

router
  .route("/c/:commentId")
  .delete(checkAuth, deleteComment)
  .update(checkAuth, updateComment);

export default router;
