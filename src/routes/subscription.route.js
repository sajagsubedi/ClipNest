import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
const router = Router();
import {getMySubscribtions} from "../controllers/subscription.controller.js"

router.use(checkAuth)

router.route("/subscriptions").get(getMySubscribtions);


export default router;
