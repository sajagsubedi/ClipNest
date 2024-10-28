import Like from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Toggle video likes by post in "api/v1/likes/v/:videoId"
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

//CONTROLLER 2:Toggle comment likes by post in "api/v1/likes/c/:commentId"
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

//CONTROLLER 3:Toggle tweet likes by post in "api/v1/likes/t/:tweetId"
const toggleTweetLike = async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet!");
  }
  const isLiked = await Like.findOne({
    tweet: tweetId,
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
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Video Liked successfully!"));
};

//CONTROLLER 4:Get all liked videos by get in "api/v1/likes/videos"
const getLikedVideo = async (req, res) => {
  const userId = req?.user?._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          { $unwind: "$ownerDetails" },
        ],
      },
    },
    {
      $unwind: {
        path: "$likedVideo",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        likedVideo: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          ownerDetails: {
            username: 1,
            fullName: 1,
            "avatar.url": 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likedVideos },
        "Liked videos fetched successfully!"
      )
    );
};

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideo };
