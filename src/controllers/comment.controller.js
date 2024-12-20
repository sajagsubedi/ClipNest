import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import Like from "../models/like.model.js";
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

//CONTROLLER 2:Get video comments by get in "api/v1/comments/:videoId"
export const getVideoComments = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;

  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: video._id,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $cond: {
            if: { $in: [req?.user?._id || "", "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
        isOwner: {
          $cond: {
            if: { $eq: [req?.user?._id || "", "$owner._id"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          avatar: {
            url: 1,
          },
        },
        isLiked: 1,
        isOwner: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(pageSize, 10),
  };

  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  return res
    .status(201)
    .json(new ApiResponse(201, comments, "Comments fetched successfully!"));
};

// CONTROLLER 3:Delete comment  by delete in "api/v1/comments/c/:commentId"
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Video not found");
  }

  const deletedComment = await Comment.deleteOne({
    _id: commentId,
    owner: req?.user?._id,
  });

  if (!deletedComment) {
    throw new ApiError(400, "Comment doesn't exists or unauthorized request !");
  }

  //delete likes associated with comment
  await Like.deleteMany({ comment: commentId });
  
  return res
    .status(201)
    .json(
      new ApiResponse(201, deletedComment, "Comment deleted successfully!")
    );
};

// CONTROLLER 4:Update comment  by patch in "api/v1/comments/c/:commentId"
export const updateComment = async (req, res) => {
  const { commentId } = req.params;

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required !");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Video not found");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req?.user?._id,
    },
    { content },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(400, "Comment doesn't exists or unauthorized request !");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, updatedComment, "Comment updated successfully!")
    );
};
