import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import {postVideo} from "../controllers/video.controller.js"

router.use(checkAuth)

router.route("/post").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    postVideo
);

export default router;
