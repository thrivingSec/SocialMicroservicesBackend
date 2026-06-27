import express,{Express, NextFunction, Request, Response} from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { configureCors } from "./utils/corsConfig.js";
import { logger } from "./utils/logger.js";
import { rateLimiter, sensitiveEndPointRateLimiter } from "./middlewares/apiRateLimitHandler.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { EXTENDEDREQ } from "./utils/schemaValidation.js";
import { redisClient } from "./utils/redisClient.js";


const app:Express = express();

// MIDDLEWARES
app.use(helmet());
app.use(configureCors());
app.use(express.json());
app.use(cookieParser())
app.use((req:Request, res:Response, next:NextFunction) => {
  logger.info(`Reveived ${req.method} ${req.url} from ${req.ip}`)
  next();
})
app.use((req:Request, res:Response, next:NextFunction) => {
  rateLimiter.consume(req.ip!).then(() => next()).catch(() => {
    logger.warn(`Rate limit exceeded for IP:${req.ip}`)
    res.status(429).json({
      status:"error",
      message:"Too many request, please wait for some time."
    })
  })
})
app.use((req:EXTENDEDREQ, res:Response, next:NextFunction) => {
  req.redisClient = redisClient
  next();
})

app.use("/api/user/register", sensitiveEndPointRateLimiter)
app.use("/api/user/verify", sensitiveEndPointRateLimiter)
app.use("/api/user/update", sensitiveEndPointRateLimiter)

app.use("/api/user", userRouter);

app.use(errorHandler);

export default app;