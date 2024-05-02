import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//--------------HELPERS---------------
const generateTokens = async userId => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(500, "Something went wrong!");
    }
};
//-----------CONTROLLERS--------------

//CONTROLLER 1:Signup user by post in "api/v1/users/signup"

const signupUser = async (req, res) => {
    const { username, email, fullName, password } = req.body;
    if (
        [username, email, fullName, password].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(
            409,
            "User with given email and username already exists"
        );
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
      console.log("In block")
        return new ApiError(400, "Avatar file is required!");
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
        return new ApiError(400, "Avatar file is required!");
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

//CONTROLLER 2:Signin user by post in "api/v1/users/signin"

const signinUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "Username or Email is required!");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!existedUser) {
        throw new ApiError(400, "Incorrect credendials!!");
    }

    const isCorrectPassword = await existedUser.isPasswordCorrect(password);

    if (!isCorrectPassword) {
        throw new ApiError(400, "Incorrect credendials!!");
    }
    const { accessToken, refreshToken } = await generateTokens(existedUser._id);

    const user = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken, user }));
};
export { signupUser, signinUser };
