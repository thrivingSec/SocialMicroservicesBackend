import express, {Express, NextFunction, Request, Response} from "express"
import helmet from "helmet";
import { corsConfig } from "./utils/corsConfig.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import postRouter from "./routes/post.routes.js";
import { sensitiveEndPointRateLimit } from "./middlewares/apiRateLimitHandler.js";
import { EXTENDEDREQ } from "./shared/schema.js";
import { redisClient } from "./utils/redisClient.js";

const app:Express = express();

// MIDDLEWARES
app.use(helmet());
app.use(corsConfig());
app.use(express.json())
app.use((req:Request, res:Response, next:NextFunction) => {
  logger.info(`Reveived ${req.method} ${req.url} from ${req.ip}`)
  next();
});
app.use((req:EXTENDEDREQ, res:Response, next:NextFunction) => {
  req.redisClient = redisClient;
  next();
})
app.use("/api/post", sensitiveEndPointRateLimit, postRouter);

app.use(errorHandler)

export default app;