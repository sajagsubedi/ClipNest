import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {
  addPlaylist,
  getMyPlaylists,
  getUserPlaylists,
  addVideo,
  addVideos,
  getPlaylistInfo,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

router.route("/").post(checkAuth, addPlaylist);
router.route("/me").get(checkAuth, getMyPlaylists);
router.route("/user/:userId").get(checkAuth, getUserPlaylists);
router
  .route("/:playlistId")
  .post(checkAuth, addVideo)
  .get(getPlaylistInfo)
  .patch(checkAuth, updatePlaylist);

router.route("/:playlistId/videos").post(checkAuth, addVideos);
export default router;
