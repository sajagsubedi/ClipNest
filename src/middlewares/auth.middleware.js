import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const checkAuth = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const tokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const existingUser = await User.findById(tokenInfo?._id).select(
      "-password -refreshToken"
    );

    if (!existingUser) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = existingUser;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
};

export const checkOptionalAuth = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      next();
      return;
    }

    const tokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const existingUser = await User.findById(tokenInfo?._id).select(
      "-password -refreshToken"
    );

    if (!existingUser) {
      next();
      return;
    }

    req.user = existingUser;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
};
