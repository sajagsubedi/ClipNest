import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Signup user by post in "api/v1/users/signup"

const signupUser = async (req, res) => {
    const { username, email, fullName, password } = req.body;
    if (
        [username, email, fullName, password].some(field => field?.trim() == "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(
            409,
            "User with guve email and username already exists"
        );
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!");
    }

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!");
    }
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong!");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User signed up successfully!")
        );
};
const getAllUsers = async (req, res) => {
    let users = await User.find({});
    return res.json({ users });
};
export { signupUser, getAllUsers };
