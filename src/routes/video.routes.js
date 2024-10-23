import { Router } from "express";
import {
  checkAuth,
  checkOptionalAuth,
} from "../middlewares/auth.middleware.js";
import { verifyVideoOwner } from "../middlewares/videos.middleware.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import {
  postVideo,
  getVideo,
  updateVideo,
  deleteVideo,
  getAllVideos,
} from "../controllers/video.controller.js";

router.route("/post").post(
  checkAuth,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  postVideo
);
router
  .route("/v/:videoId")
  .get(checkOptionalAuth, getVideo)
  .patch(checkAuth, verifyVideoOwner, updateVideo)
  .delete(checkAuth, verifyVideoOwner, deleteVideo);

router.route("/getallvideos").get( checkOptionalAuth,getAllVideos);

export default router;
