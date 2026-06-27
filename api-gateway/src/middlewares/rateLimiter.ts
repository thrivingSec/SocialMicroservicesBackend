import {rateLimit} from "express-rate-limit";
import {RedisReply, RedisStore} from "rate-limit-redis";
import { redisClient } from "../utils/redisClient.js";
import { Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const rateLimiter = rateLimit({
  windowMs: 15*60*1000,
  max:100,
  standardHeaders:true,
  legacyHeaders:false,
  handler:(req:Request, res:Response) => {
    logger.warn(`Too many request on api-gateway from ${req.ip}`);
    res.status(429).json({
      status:"error",
      message:"Too many request, please try after some time."
    })
  },
  store: new RedisStore({
    sendCommand:async(...args:string[]):Promise<RedisReply> => {
      return await redisClient.call(args[0], ...args.slice(1)) as RedisReply;
    }
  })
})