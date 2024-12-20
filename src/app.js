import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "express-async-errors";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extented: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRoutes from "./routes/user.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import videoRoutes from "./routes/video.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/tweets", tweetRoutes);

//utils and middlewares
import errorHandler from "./utils/ErrorHandler.js";
import notfound from "./middlewares/notfound.middleware.js";

//extra utils and middlewares
app.use(errorHandler);
app.use(notfound);

//export of app
export { app };
