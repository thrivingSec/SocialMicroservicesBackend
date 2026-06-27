import express, {Express, NextFunction, Request, Response} from "express";
import { logger } from "./utils/logger.js";
import helmet from "helmet";
import { corsConfig } from "./utils/corsConfig.js";

const app:Express = express();

app.use(helmet())
app.use(corsConfig())
app.use((req:Request, res:Response, next:NextFunction) => {
  logger.info(`Request received at ${req.url}`)
})

app.get("/",(req:Request, res:Response, next:NextFunction) => {
  res.status(200).json({
    status:"success",
    message:"Service is up and running"
  })
} )

export default app