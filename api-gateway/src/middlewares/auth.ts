import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { errorHandler } from "./errorHandler.js";
import jwt from "jsonwebtoken";
import { ENV } from "../shared/env.js";
import { AUTHREQUEST } from "../shared/schema.js";

export const validateToken = async (req:AUTHREQUEST, res:Response, next:NextFunction):Promise<any> => {
  logger.info(`Validate token middleware hit : ${req.method} ${req.url} ${req.ip}`)
  try {    
    const authHeader = req.headers["authorization"];
    if(!authHeader){
      logger.warn(`User:${req.ip} trying to access:${req.url} without authorization header.`)
      return res.status(400).json({
        status:"error",
        message:"Missing 'authorization' header"
      })
    }
    const refreshToken = req.cookies["jwt_refresh"];
      if(!refreshToken){
        logger.error(`Missing refresh token cookie`)
        return res.status(400).json({
          status:"error",
          message:"Missing refresh token cookie header"
        })
      }
    const token = authHeader!.split(" ")[1];
    if(!token){
      logger.warn(`User:${req.ip} trying to access:${req.url} without authorization token.`)
       return res.status(400).json({
        status:"error",
        message:"Missing 'authorization' token"
      })
    }

    const user = jwt.verify(token, ENV.JWT_SECRET, (err, user) => {
      if(err){
        logger.error(`Error in token varification of user:${req.ip}, error:${err}`);
        return res.status(400).json({
          status:"error",
          message:"Invalid token, please login first."
        })
      }
      req.user = user;
      next()
    })


  } catch (error:any) {
    errorHandler(error, req, res, next);
  }
}

export const validateTokenAuthService = async(req:AUTHREQUEST, res:Response, next:NextFunction):Promise<any> => {
  try {
    const allowed = ["/register", "/verify", "/login", "/forgot", "/reset"];
    if(allowed.includes(req.url.toString())){
      next()
    }
    else{
      const authHeader = req.headers["authorization"];
      if(!authHeader){
        logger.error(`Missing authorization header`)
        return res.status(400).json({
          status:"error",
          message:"Missing authorization header"
        })
      }
      const refreshToken = req.cookies["jwt_refresh"];
      if(!refreshToken){
        logger.error(`Missing refresh token cookie`)
        return res.status(400).json({
          status:"error",
          message:"Missing refresh token cookie header"
        })
      }
      const accessToken = authHeader.split(" ")[1];
      if(!accessToken){
        logger.error(`Missing access token`)
        return res.status(400).json({
          status:"error",
          message:"Missing access token."
        })
      }
      const user = jwt.verify(accessToken, ENV.JWT_SECRET, (err, user) => {
        if(err){
          logger.error(`Invalid access token`);
          res.status(406).json({
            status:"error",
            message:"Invalid access token"
          })
        }
        req.user = user;
        next()
      })
    }
  } catch (error:any) {
    logger.error(`Error in validate token for auth service, ${error}`)
  }
}