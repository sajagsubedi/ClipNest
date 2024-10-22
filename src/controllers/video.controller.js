import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Post video by post in "api/v1/videos/post"
const postVideo = async (req, res) => {
  const { title, description, isPublished } = req.body;
  if (
    [title, description, isPublished].some(
      (field) => field == null || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  let videoLocalPath = req.files?.video?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video is required!");
  }
  let thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required!");
  }

  const videoPath = await uploadOnCloudinary(videoLocalPath);
  const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoPath) {
    throw new ApiError(400, "Video is required!");
  }
  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail is required!");
  }
  const postedVideo = await Video.create({
    title,
    description,
    isPublished,
    thumbnail: {
      url: thumbnailPath.secure_url,
      public_id: thumbnailPath.public_id,
    },
    videoUrl: { url: videoPath.secure_url, public_id: videoPath.public_id },
    owner: req.user?._id,
    duration: videoPath.duration,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, postedVideo, "Video posted successfully!"));
};

//CONTROLLER 2:Get video by get in "api/v1/videos/v/:videoId"

const getVideo = async (req, res, next) => {
  const { videoId } = req.params;

  // Check if the video ID is valid
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Video not found!");
  }

  // Fetch the video without updating views yet
  const video = await Video.findById(videoId);

  // Check if video exists
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the video is unpublished and restrict access
  if (!video.isPublished) {
    if (!req.user || req.user._id != video.owner.toString()) {
      throw new ApiError(404, "Video not found");
    }
  }

  // Now that user is authorized, increment the views
  await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } }, // Use $inc instead of $sum
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully!"));
};

//CONTROLLER 3:Update video by patch in "api/v1/videos/v/:videoId"
const updateVideo = async (req, res) => {
  const { title, description, isPublished } = req.body;
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).send({ error: "Invalid videoId" });
  }

  const updateObj = { ...{} };

  if (title) updateObj.title = title;
  if (description) updateObj.description = description;
  if (isPublished) updateObj.isPublished = isPublished;

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateObj },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, updatedVideo, "Video updated successfully!"));
};

//CONTROLLER 4:Delete video by delete in "api/v1/videos/v/:videoId"
const deleteVideo = async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).send({ error: "Invalid videoId" });
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(404, "Video not found");
  }
  await deleteFromCloudinary(deletedVideo.videoUrl.public_id);
  await deleteFromCloudinary(deletedVideo.thumbnail.public_id);

  return res
    .status(200)
    .json(new ApiResponse(201, deletedVideo, "Video deleted successfully!"));
};

//exports
export { postVideo, getVideo, updateVideo, deleteVideo };
