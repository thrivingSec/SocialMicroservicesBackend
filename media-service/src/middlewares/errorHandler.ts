import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { APIError } from "../lib/customError.js";

const dbDriverErrorNames = ["MongoError", "MongooseError", "ConnectionError", "ValidationError", "CastError", "MongoServerError", "DocumentNotFoundError", "DisconnectedError", "DivergentArrayError"]

export const errorHandler = async(error:Error, req:Request, res:Response, next:NextFunction) => {
  if(error instanceof APIError){
    logger.error(`APIError :: ${error.message} :: ${error.stack}`)
    res.status(error.status).json({
      status:"error",
      message:error.message
    })
  }else if(dbDriverErrorNames.includes(error.name)){
    logger.error(`Database driver error :: ${error.message} :: ${error.stack}`)
    res.status(500).json({
      status:"error",
      message:"Internal server error"
    })
  }else{
    logger.error(`Internal server error :: ${error.message} :: ${error.stack}`)
    res.status(500).json({
      status:"error",
      message:"Internal server error"
    })
  }
}