import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {signupUser,getAllUsers} from "../controllers/user.controller.js"

const router = Router();

//unsecured routes
router.route("/signup").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),signupUser
);
router.route("/all").get(getAllUsers)

export default router;
