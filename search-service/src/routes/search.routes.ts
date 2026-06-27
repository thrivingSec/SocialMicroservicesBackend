import express from "express";
import { authUser } from "../middlewares/auth.js";
import { sensitiveEndPointRateLimit } from "../middlewares/apiRateLimitHandler.js";
import { searchPost } from "../controllers/search.controller.js";

const searchRouter = express.Router()

searchRouter.use(authUser)
searchRouter.get("/", sensitiveEndPointRateLimit, searchPost)

export default searchRouter