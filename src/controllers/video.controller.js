import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Post video by post in "api/v1/videos/post"
const postVideo = async (req, res) => {
    const { title, description, isPublished } = req.body;
    if (
        [title, description, isPublished].some(
            field => field == null || field.trim() === ""
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
        return;
    }
    if (!thumbnailPath) {
        throw new ApiError(400, "Thumbnail is required!");
        return;
    }
    const postedVideo = await Video.create({
        title,
        description,
        isPublished,
        thumbnail: {
            url: thumbnailPath.secure_url,
            public_id: thumbnailPath.public_id
        },
        videoUrl: { url: videoPath.secure_url, public_id: videoPath.public_id },
        owner: req.user?._id,
        duration: videoPath.duration
    });
    console.log(postedVideo);

    return res
        .status(201)
        .json(new ApiResponse(201, postedVideo, "Video posted successfully!"));
};
const updateVideo = async (req, res) => {
  const { title, description, isPublished } = req.body;
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).send({ error: 'Invalid videoId' });
  }

  const updateObj = { ...{} };
  if (title) updateObj.title = title;
  if (description) updateObj.description = description;
  if (isPublished) updateObj.isPublished = isPublished;
    const updatedVideo = await Video.findByIdAndUpdate(videoId, { $set: updateObj }, { new: true });
    if (!updatedVideo) {
      return res.status(404).send({ error: 'Video not found' });
    }
    res.json(updatedVideo);
};
const getV=async(req,res)=>{
  const v=await Video.find({})
  res.json(v)
}
//exports
export { postVideo, updateVideo,getV };
