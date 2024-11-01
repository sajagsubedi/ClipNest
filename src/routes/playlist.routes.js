import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {
  addPlaylist,
  getMyPlaylists,
  getUserPlaylists,

} from "../controllers/playlist.controller.js";

router.route("/").post(checkAuth, addPlaylist);
router.route("/me").get(checkAuth, getMyPlaylists);
router.route("/user/:userId").get(checkAuth, getUserPlaylists);

export default router;
