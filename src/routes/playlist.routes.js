import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {
  addPlaylist,
  getMyPlaylists,
  getUserPlaylists,
  addVideo,
} from "../controllers/playlist.controller.js";

router.route("/").post(checkAuth, addPlaylist);
router.route("/me").get(checkAuth, getMyPlaylists);
router.route("/user/:userId").get(checkAuth, getUserPlaylists);
router.route("/:playlistId/video").get(checkAuth, addVideo);

export default router;
