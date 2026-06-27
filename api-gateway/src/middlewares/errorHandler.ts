import {Request, Response, NextFunction} from "express";
import { logger } from "../utils/logger.js";

export const errorHandler = async(error:Error, req:Request, res:Response, next:NextFunction) => {
  logger.error(`${error.message} ${error.stack}`)
  res.status(500).json({
    status:"error",
    message:"Internal server error."
  })
}
