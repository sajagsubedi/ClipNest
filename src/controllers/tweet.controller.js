import Tweet from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Like from "../models/like.model.js";
import User from "../models/user.model.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1: TO CREATE TWEET BY POST IN "api/v1/tweets/"
export const createTweet = async (req, res) => {
  const { content } = req.body;

  if (!content) throw new ApiError(400, "content is required!");

  const newTweet = await Tweet.create({ content, owner: req?.user?._id });

  if (!newTweet)
    throw new ApiError(
      400,
      "Error creating tweet. Please try again after sometime !"
    );

  return res
    .status(201)
    .json(new ApiResponse(201, newTweet, "Tweet created successfully!"));
};

//CONTROLLER 2: TO GET USERS TWEET BY GET IN "/api/v1/tweets/users/:username"
export const getUserTweets = async (req, res) => {
  const { username } = req.params;
  
  const user=await User.findOne({username})

  if(!user) throw new ApiError(400,"User with given username not found!")

  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: user?._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $addFields: {
        ownerDetails: {
          $first: "$ownerDetails",
        },
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
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        ownerDetails: {
          fullName: 1,
          username: 1,
          avatar: {
            url: 1,
          },
          email: 1,
        },
        isLiked: 1,
        likesCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(201, userTweets, "Tweets fetched successfully!"));
};

//CONTROLLER 3:UPDATE TWEET BY PATCH IN "api/v1/tweets/:tweetId"
export const updateTweet = async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) throw new ApiError(400, "Content is required");

  const existingTweet = await Tweet.findById(tweetId);

  if (!existingTweet) throw new ApiError(400, "Tweet not found!");

  if (existingTweet.owner.toString() != req.user._id.toString())
    throw new ApiError(403, "Unauthorized request");

  existingTweet.content = content;
  existingTweet.save();

  return res
    .status(201)
    .json(new ApiResponse(201, existingTweet, "Tweet updated successfully!"));
};

//CONTROLLER 4:DELETE TWEET BY DELETE IN "api/v1/tweets/:tweetId"
export const deleteTweet = async (req, res) => {
  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req?.user?._id,
  });

  if (!deletedTweet) throw new ApiError(400, "Tweet not found!");

  //delete likes on tweet
  await Like.deleteMany({ tweet: tweetId });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully!"));
};
