import connectDB from "./database/db.js"
import {app} from "./app.js"
import dotenv from "dotenv"
import "express-async-errors"

dotenv.config({
  path:"./.env"
})

connectDB()
.then(()=>{
  const PORT=process.env.PORT || 3000
  app.listen(PORT,()=>{
    console.log(`Server is  running on http://localhost:${PORT}`)
  })
}).catch((err)=>{
  console.log("MONGODB connection error failed !!!",err)
})