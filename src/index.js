import connectDB from "./database/db.js"
import {app} from "./app.js"
import dotenv from "dotenv"
import {v2 as cloudinary} from "cloudinary"

dotenv.config({
  path:"./.env"
})

cloudinary.config({ 
  cloud_name: process.env?.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env?.CLOUDINARY_API_KEY,
  api_secret: process.env?.CLOUDINARY_API_SECRET 
});

connectDB()
.then(()=>{
  const PORT=process.env.PORT || 3000
  app.listen(PORT,()=>{
    console.log(`Server is  running on http://localhost:${PORT}`)
  })
}).catch((err)=>{
  console.log("MONGODB connection error failed !!!",err)
})