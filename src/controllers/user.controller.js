import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//--------------HELPERS---------------
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.log(err);
    throw new ApiError(500, "Something went wrong!");
  }
};
//-----------CONTROLLERS--------------

//CONTROLLER 1:Signup user by post in "api/v1/users/signup"

const signupUser = async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [username, email, fullName, password].some(
      (field) => field == null || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
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
    avatar: {
      url: avatar.secure_url,
      public_id: avatar.public_id,
    },
    coverImage: {
      url: coverImage?.secure_url || "",
      public_id: coverImage?.public_id || "",
    },
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong!");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User signed up successfully!"));
};

//CONTROLLER 2:Signin user by post in "api/v1/users/signin"

const signinUser = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    throw new ApiError(400, "Username or Email is required!");
  }
  const existedUser = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
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
    secure: true,
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
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
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
      secure: true,
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
      $set: updateObj,
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Updated account details successfully!"));
};

//CONTROLLER 7:Get current user details by get in "api/v1/users/myprofile"
const getMyProfile = async (req, res) => {
  const userId=req?.user?._id;

  const user=await User.findById(userId).select("-password -watchHistory -refreshToken")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Your profile fetched successfully"));
};

//CONTROLLER 8:Update avatar by patch in "api/v1/users/avatar"
const updateAvatar = async (req, res) => {
  const avatarLocalPath = req.file?.path;
  console.log("till");
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required!");
  }
  const existedUser = await User.findById(req.user?._id).select("avatar");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!");
    return;
  }
  const publicId = existedUser?.avatar?.public_id;
  await deleteFromCloudinary(publicId);
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: avatar.secure_url,
          public_id: avatar.public_id,
        },
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully!"));
};

//CONTROLLER 9:Update cover image by patch in "api/v1/users/coverimage"
const updateCoverImage = async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is required!");
  }
  const existedUser = await User.findById(req.user?._id).select("coverImage");
  const publicId = existedUser?.coverImage?.public_id;

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "Cover Image  is required!");
    return;
  }
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: {
          url: coverImage.secure_url,
          public_id: coverImage.public_id,
        },
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover Image updated successfully!")
    );
};

//CONTROLLER 10:Get channel by get in "api/v1/users/channel/:username"
const getChannel = async (req, res) => {
  const { username } = req.params;
  if (!username.trim()) {
    throw new ApiError(400, "Username is required!");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.trim().toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subsribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        subsribedToCount: 1,
        subscribersCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!channel.length) {
    throw new ApiError(400, "Channel doesn't exists");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel, "User channel fetched successfully!"));
};

//CONTROLLER 11:Get watch history by get in "api/v1/users/history"
const getWatchHistory = async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory,
        "Watch history fetched successfully!"
      )
    );
};
export {
  signupUser,
  signinUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  updateAccount,
  getMyProfile,
  updateAvatar,
  updateCoverImage,
  getChannel,
  getWatchHistory,
};
