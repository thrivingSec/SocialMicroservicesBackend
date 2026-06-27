import express, {Express, NextFunction, Request, Response} from "express"
import helmet from "helmet";
import { corsConfig } from "./utils/corsConfig.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { EXTENDEDREQ } from "./shared/schema.js";
import { redisClient } from "./utils/redisClient.js";
import mediaRouter from "./routes/media.routes.js";

const app:Express = express();

// MIDDLEWARES
app.use(helmet());
app.use(corsConfig());
app.use((req:Request, res:Response, next:NextFunction) => {
  console.log(req.headers["content-type"]);
  next()
})
app.use(express.json())
app.use(express.urlencoded({extended:true, limit:"5mb"}));
app.use((req:Request, res:Response, next:NextFunction) => {
  logger.info(`Reveived ${req.method} ${req.url} from ${req.ip}`)
  next();
});
app.use((req:EXTENDEDREQ, res:Response, next:NextFunction) => {
  req.redisClient = redisClient;
  next();
})

app.use("/api/media", mediaRouter)

app.use(errorHandler)

export default app;