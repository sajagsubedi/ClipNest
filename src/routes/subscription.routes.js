import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {getMySubscribtions,toggleSubcription} from "../controllers/subscription.controller.js"

router.use(checkAuth)

router.route("/subscriptions").get(getMySubscribtions);
router.route("/c/:channelId").post(toggleSubcription);


export default router;
