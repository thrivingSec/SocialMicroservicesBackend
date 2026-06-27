import express from "express";
import { authUser } from "../middlewares/auth.js";
import { sensitiveEndPointRateLimit } from "../middlewares/apiRateLimitHandler.js";
import { mediaDelete, mediaUpload } from "../controllers/media.controllers.js";
import { fileHandler } from "../middlewares/multerFileHandler.js";

const mediaRouter = express.Router();

mediaRouter.use(authUser)
mediaRouter.use(sensitiveEndPointRateLimit)
mediaRouter.post("/upload-media", fileHandler, mediaUpload);
mediaRouter.post("/delete-media", mediaDelete);

export default mediaRouter;