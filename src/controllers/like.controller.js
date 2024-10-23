import Like from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Toggle video likes by post in "api/v1/like/v/:videoId"
const toggleVideoLike = async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video!");
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


//CONTROLLER 2:Toggle comment likes by post in "api/v1/like/c/:commentId"
const toggleCommentLike = async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid Comment!");
    }
    const isLiked = await Like.findOne({
        comment: commentId,
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
      comment: commentId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: true }, "Video Liked successfully!"));
  };

export { toggleVideoLike,toggleCommentLike };
