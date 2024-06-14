import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
        owner:req.user?._id,
        duration:videoPath.duration
    });
    console.log(postedVideo);
    
    return res
        .status(201)
        .json(
            new ApiResponse(201, postedVideo, "Video posted successfully!")
        );
};

//exports
export { postVideo };
