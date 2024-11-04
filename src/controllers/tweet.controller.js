import mongoose from "mongoose";
import Tweet from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1: TO CREATE TWEET BY POST IN "api/v1/tweets/"
export const createTweet = async (req, res) => {
  const { content } = req.body;

  if (!content) throw new ApiError(400, "content is required!");

  const newTweet =await Tweet.create({ content, owner: req?.user?._id });

  if(!newTweet) throw new ApiError(400,"Error creating tweet. Please try again after sometime !");

  return res
    .status(201)
    .json(new ApiResponse(201, newTweet, "Tweet created successfully!"));

};
