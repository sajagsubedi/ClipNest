import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

const uploadOnCloudinary = async (localFilePath) => {
    try {
       if (!localFilePath) return null;        
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary=async(public_id)=>{
  try {
    if(!public_id) return null
    await cloudinary.uploader.destroy(public_id,{
      resource_type:"auto"
    });
  } catch (error) {
    return null
  }
}


export {uploadOnCloudinary,deleteFromCloudinary}