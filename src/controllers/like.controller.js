import Like from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Toggle video likes by post in "api/v1/like/v/:videoId"
const toggleVideoLike = async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Channel!");
  }
  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked?._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Removed like succesfully!")
      );
  }
  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Video Liked successfully!"));
};

export { toggleVideoLike };
