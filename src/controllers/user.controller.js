import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
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
        [username, email, fullName, password].some(
            field => field == null || field.trim() === ""
        )
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
    let avatarLocalPath = req.files?.avatar?.[0]?.path;
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
    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!");
        return;
    }
    const user = await User.create({
        fullName,
        username: username?.toLowerCase(),
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
    const { emailusername, password } = req.body;
    if (!emailusername) {
        throw new ApiError(400, "Username or Email is required!");
    }
    const existedUser = await User.findOne({
        $or: [{ username: emailusername }, { email: emailusername }]
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
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken, user },
                "User logged in successfully!"
            )
        );
};

//CONTROLLER 3:Logout user by post in "api/v1/users/logout"
const logoutUser = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out "));
};

//CONTROLLER 4:Refresh access token by post in "api/v1/users/refreshtoken"
const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const tokenInfo = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const existedUser = await User.findById(tokenInfo?._id);

        if (!existedUser) {
            throw new ApiError(401, "Invalid refresh token");
        }
        if (existedUser?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token expired or invalid!");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateTokens(
            existedUser?._id
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (err) {
        console.log(err);
        throw new ApiError(401, err.message);
    }
};

//CONTROLLER 5:Change password by post in "api/v1/users/changepassword"
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fielda are required!");
    }
    const existedUser = await User.findById(req.user?._id);
    const isCorrectPassword = await existedUser.isPasswordCorrect(oldPassword);
    if (!isCorrectPassword) {
        throw new ApiError(401, "Incorrect Password");
    }
    existedUser.password = newPassword;
    await existedUser.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully!"));
};

//CONTROLLER 6:Update user details by patch in "api/v1/users/updateaccount"
const updateAccount = async (req, res) => {
    const { fullName, username } = req.body;
    if (!fullName && !username) {
        throw new ApiError(400, "At least one field is required!");
    }
    const updateObj = {};
    if (fullName) {
        updateObj.fullName = fullName;
    }

    if (username) {
        updateObj.username = username;
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: updateObj
        },
        { new: true }
    ).select("-password");
   return res
   .status(200)
   .json(new ApiResponse(200, user, "Updated account details successfully!"));
};
export {
    signupUser,
    signinUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    updateAccount
};
