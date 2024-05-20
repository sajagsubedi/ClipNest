import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import "express-async-errors"
const app=express()

app.use(cors({
  origin:process.env.CORS_ORIGIN || "*",
  credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extented:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import 
import userRoutes from "./routes/user.routes.js"
import subscriptionRoutes from "./routes/subscription.route.js"

//routes
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/subscription",subscriptionRoutes)

//utils and middlewares
import errorHandler from "./utils/ErrorHandler.js"
import notfound from "./middlewares/notfound.middleware.js"

//extra utils and middlewares
app.use(errorHandler)
app.use(notfound)

//export of app
export {app}