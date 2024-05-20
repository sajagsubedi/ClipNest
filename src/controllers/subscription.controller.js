import Subscription from "../models/subscription.model.js"
import mongoose from "mongoose"
import { ApiResponse } from "../utils/ApiResponse.js";

//-----------CONTROLLERS--------------

//CONTROLLER 1:Get all subscribed channel by get in "api/v1/subscription/subscriptions"
const getMySubscribtions=async(req,res)=>{

 const subscriptions=await Subscription.aggregate([{
   $match:{
     subscriber:new mongoose.Types.ObjectId(req.user?._id)
   }
 }])
 
 res.status(200).json(new ApiResponse(200,subscriptions,"Subscription fetched successfully!"))
}


export {getMySubscribtions}