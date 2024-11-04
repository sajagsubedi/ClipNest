import Subscription from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Get all subscribed channel by get in "api/v1/subscription/subscriptions"
const getMySubscribtions = async (req, res) => {
    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
          $lookup:{
            from:"users",
            localField:"channel",
            foreignField:"_id",
            as:"channelInformation",
            pipeline:[{
              $project:{
                fullName:1,
                username:1,
                email:1,
                avatar:{
                  url:1
                }
              }
            }]
          }
        },
    ]);

    res.status(200).json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscription fetched successfully!"
        )
    );
};

//CONTROLLER 2:Toggle subscribed channel by posr in "api/v1/subscription/c/:channelId"
const toggleSubcription = async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel!");
    }
    const isSubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    });
    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribed: false },
                    "Channel Unsubcribed successfully!"
                )
            );
    }
    await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed: true },
                "Channel Sububcribed successfully!"
            )
        );
};

export { getMySubscribtions, toggleSubcription };
