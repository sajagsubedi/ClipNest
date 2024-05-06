import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

const uploadOnCloudinary = async (localFilePath) => {
    try {
       if (!localFilePath) return null;        
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        console.log(response);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log(error)
        return null
    }
}



export {uploadOnCloudinary}