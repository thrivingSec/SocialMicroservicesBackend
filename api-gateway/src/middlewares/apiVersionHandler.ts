import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const apiVersionHandler = (version:string) => async(req:Request, res:Response, next:NextFunction) => {
    if(req.url.startsWith("/v1")){
      next();
    }else {
    logger.warn(`API request for version ${req.url} from ${req.ip}`);
    res.status(400).json({
      status:"error",
      message:"Invalid API version request."
    })
  }
}