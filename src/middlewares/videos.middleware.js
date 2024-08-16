import { ApiError } from "../utils/ApiError.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";

export const verifyVideoOwner = async (req, _, next) => {
    try {
        const { videoId } = req.params;
        const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
        if (!video) {
            throw new ApiError(404, "Video not found!");
        }
        if (video.owner.equals(req.user._id)) {
          req.videoId=video._id;
            next();
        } else {
            throw new ApiError(401, "Unauthorized request");
        }
    } catch (error) {
        throw new ApiError(error.StatusCode,error.message);
    }
};
