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
