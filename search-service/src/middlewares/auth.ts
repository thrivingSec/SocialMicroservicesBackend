import { NextFunction, Request, Response } from "express";
import { EXTENDEDREQ } from "../shared/schema.js";
import { errorHandler } from "./errorHandler.js";

export const authUser = async(req:EXTENDEDREQ, res:Response, next:NextFunction) => {
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
    errorHandler(error, req, res, next);
  }
}