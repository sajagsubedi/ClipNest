import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {toggleVideoLike} from "../controllers/like.controller.js"

router.use(checkAuth)

router.route("/v/:videoId").post(toggleVideoLike);


export default router;
