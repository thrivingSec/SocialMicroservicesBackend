import { NextFunction, Response } from "express";
import { EXTENDEDREQ } from "../utils/schemaValidation.js";
import { errorHandler } from "./errorHandler.js";

export const authUser = (req:EXTENDEDREQ, res:Response, next:NextFunction) => {
  try {
    const userId = req.headers["x-user-id"];
    if(!userId){
      res.status(401).json({
        status:"error",
        message:"Unauthorized request."
      }) 
    }
    req.user = {userId};
    next()
  } catch (error:any) {
    errorHandler(error, req, res, next)
  }
}