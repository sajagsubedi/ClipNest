import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {signupUser,signinUser,logoutUser,refreshAccessToken,changePassword} from "../controllers/user.controller.js"
import {checkAuth} from "../middlewares/auth.middleware.js"
const router = Router();

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

router.route("/signin").post(signinUser);
router.route("/logout").post(checkAuth,logoutUser);
router.route("/refreshtoken").post(refreshAccessToken);
router.route("/changepassword").post(checkAuth,changePassword);
export default router;
