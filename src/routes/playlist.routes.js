import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import { addPlaylist,getMyPlaylists } from "../controllers/playlist.controller.js";

router.route("/").post(checkAuth, addPlaylist);
router.route("/me").get(checkAuth, getMyPlaylists);

export default router;
