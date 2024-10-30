import { Router } from "express";
import {
  checkAuth,
  checkOptionalAuth,
} from "../middlewares/auth.middleware.js";
const router = Router();

import {
  addComment,
  getVideoComments,
} from "../controllers/comment.controller.js";

router
  .route("/:videoId")
  .post(checkAuth, addComment)
  .get(checkOptionalAuth, getVideoComments);

export default router;
