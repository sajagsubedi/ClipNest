import mongoose from "mongoose";
import Playlist from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Create playlist by post in "api/v1/playlists/"
export const addPlaylist = async (req, res) => {
  const { name, description } = req.body;

  if (
    [name, description].some((field) => field == null || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const userId = req?.user?._id;

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully!"));
};

//CONTROLLER 2:Get my playlists by post in "api/v1/playlists/me"
export const getMyPlaylists = async (req, res) => {
  const myPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner:new mongoose.Types.ObjectId(req?.user?.id),
      },
    },
    {
      $addFields: {
        videosCount: {
          $size: "$videos",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, myPlaylists, "Playlist fetched successfully!"));
};
