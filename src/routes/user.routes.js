import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {signupUser,signinUser,logoutUser} from "../controllers/user.controller.js"
import {checkAuth} from "../middlewares/auth.middleware.js"
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

router.route("/signin").post(signinUser);

//secured routes
router.route("/logout").post(checkAuth,logoutUser);
export default router;
