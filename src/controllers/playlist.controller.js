import mongoose, { Mongoose } from "mongoose";
import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";
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

//CONTROLLER 2:Get my playlists by get in "api/v1/playlists/me"
export const getMyPlaylists = async (req, res) => {
  const myPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req?.user?.id),
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

//CONTROLLER 3:Get users playlists by get in "api/v1/playlists/user/:userId"
export const getUserPlaylists = async (req, res) => {
  const { userId } = req.params;

  const myPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
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

//CONTROLLER 4: Add video to playlist by post in "api/v1/playlists/:playlistId"
export const addVideo = async (req, res) => {
  const { playlistId } = req.params;
  const { video } = req.body;

  // Validate video and playlist IDs
  if (!video) throw new ApiError(400, "Video is required!");
  if (
    !mongoose.Types.ObjectId.isValid(video) ||
    !mongoose.Types.ObjectId.isValid(playlistId)
  ) {
    throw new ApiError(404, "Invalid video or playlist ID!");
  }

  // Check if video and playlist exist
  const [existingVideo, existingPlaylist] = await Promise.all([
    Video.findById(video),
    Playlist.findById(playlistId),
  ]);

  if (!existingVideo || !existingPlaylist) {
    throw new ApiError(404, "Video or playlist not found!");
  }

  // Verify authorization and if video is already in playlist
  if (req.user._id.toString() !== existingPlaylist.owner.toString()) {
    throw new ApiError(403, "Unauthorized request!");
  }
  if (existingPlaylist.videos.includes(video)) {
    throw new ApiError(400, "Video already exists in playlist!");
  }

  // Add video to playlist
  existingPlaylist.videos.push(video);
  await existingPlaylist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingPlaylist,
        "Video added to playlist successfully!"
      )
    );
};

//CONTROLLER 5: Add multiple videos to playlist at once by post in "api/v1/playlists/:playlistId/videos"
export const addVideos = async (req, res) => {
  const { playlistId } = req.params;
  const { videos } = req.body;

  // Validate video and playlist IDs
  if (
    !videos ||
    videos.length == 0 ||
    videos.some((field) => field == null || field.trim() === "")
  ) {
    throw new ApiError(400, "Videos are required!");
  }
  if (
    videos.some((field) => !mongoose.Types.ObjectId.isValid(field)) ||
    !mongoose.Types.ObjectId.isValid(playlistId)
  ) {
    throw new ApiError(404, "Invalid video or playlist ID!");
  }

  const [existingVideos, existingPlaylist] = await Promise.all([
    Video.find({ _id: { $in: videos } }),
    Playlist.findById(playlistId),
  ]);
  if (!existingPlaylist) {
    throw new ApiError(404, "Playlist not found!");
  }
  if (
    existingVideos.length == 0 ||
    existingVideos.some((field) => field == null || !field || !field?._id)
  ) {
    throw new ApiError(404, "Videos not found!");
  }

  // Verify authorization and if video is already in playlist
  if (req.user._id.toString() !== existingPlaylist.owner.toString()) {
    throw new ApiError(403, "Unauthorized request!");
  }

  // Add video to playlist
  videos.map((video) => {
    if (existingPlaylist.videos.includes(video)) {
      return;
    }
    existingPlaylist.videos.push(video);
  });

  await existingPlaylist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingPlaylist,
        "Video added to playlist successfully!"
      )
    );
};

//CONTROLLER 6: Get playlist information by get in "api/v1/playlists/:playlistId"
export const getPlaylistInfo = async (req, res) => {
  const { playlistId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist");
  }

  const playlistInfo = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "ownerInfo",
      },
    },
    {
      $unwind: "$ownerInfo",
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "videos.owner",
        foreignField: "_id",
        as: "videoOwners",
      },
    },
    {
      $addFields: {
        videos: {
          $map: {
            input: "$videos",
            as: "video",
            in: {
              $mergeObjects: [
                "$$video",
                {
                  owner: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$videoOwners",
                          as: "videoOwner",
                          cond: {
                            $eq: ["$$videoOwner._id", "$$video.owner"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        "owner.username": "$ownerInfo.username",
        "owner.fullName": "$ownerInfo.fullName",
        "owner.avatar.url": "$ownerInfo.avatar.url",
        "videos.title": 1,
        "videos.thumbnail.url": 1,
        "videos.duration": 1,
        "videos.views": 1,
        "videos.createdAt": 1,
        "videos.owner.username": 1,
        "videos.owner.avatar.url": 1,
        "videos.owner.fullName": 1,
      },
    },
  ]);

  if (!playlistInfo || playlistInfo.length == 0) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistInfo[0], "playlist  fetched successfully!")
    );
};

//CONTROLLER 6: Get playlist information by patch in "api/v1/playlists/:playlistId"
export const updatePlaylist = async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist Id");
  }

  if(!name && !description){
    throw new ApiError(400,"Provide at least one field")
  }

  const existingPlaylist=await Playlist.findById(playlistId)

  if(!existingPlaylist){
    throw new ApiError(400, "Playlist not found!");
  }
  if(existingPlaylist.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403,"unauthorized Request!");
  }
  if(name){
    existingPlaylist.name=name
  }
  if(description){
    existingPlaylist.description=description
  }
  await existingPlaylist.save()

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      existingPlaylist,
      "Playlist updated successfully!"
    )
  );
};
