import { NextFunction, Request, RequestHandler, Response } from "express";
import { errorHandler } from "./errorHandler.js";

export const reqHandler = (controller:(req:Request, res:Response, next:NextFunction) => Promise<any>):RequestHandler => async(req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error:any) {
    await errorHandler(error, req, res, next);
  }
}