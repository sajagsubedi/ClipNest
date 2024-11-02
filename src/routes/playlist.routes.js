import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {
  addPlaylist,
  getMyPlaylists,
  getUserPlaylists,
  addVideo,
  addVideos,
} from "../controllers/playlist.controller.js";

router.route("/").post(checkAuth, addPlaylist);
router.route("/me").get(checkAuth, getMyPlaylists);
router.route("/user/:userId").get(checkAuth, getUserPlaylists);
router.route("/:playlistId/video").get(checkAuth, addVideo);
router.route("/:playlistId/videos").get(checkAuth, addVideos);

export default router;
