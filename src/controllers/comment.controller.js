import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Add comment to a video by post in "api/v1/comments/:videoId"

export const addComment = async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  const owner = req?.user?._id;

  if (content == null || content.trim() == "") {
    throw new ApiError(400, "Content is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video not found");
  }

  const video = await Video.findById(new mongoose.Types.ObjectId(videoId));

  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const newComment = await Comment.create({ content, owner, video: videoId });

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment posted successfully!"));
};
