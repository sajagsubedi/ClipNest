import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import { addPlaylist } from "../controllers/playlist.controller.js";

router.route("/").post(checkAuth, addPlaylist);

export default router;
