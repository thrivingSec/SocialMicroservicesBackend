import {RateLimiterRedis} from "rate-limiter-flexible";
import { redisClient } from "../utils/redisClient.js"; 
import {rateLimit} from "express-rate-limit"
import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import {RedisReply, RedisStore} from "rate-limit-redis"

export const rateLimiter = new RateLimiterRedis({
  storeClient:redisClient,
  keyPrefix:"middlewareRateLimiting",
  points:10,
  duration:1
})

export const sensitiveEndPointRateLimiter = rateLimit({
  windowMs: 15*60*1000,
  max:50,
  standardHeaders:true,
  legacyHeaders:false,
  handler:(req:Request, res:Response) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP:${req.ip}`);
    res.status(429).json({
      status:"error",
      message:"Too many requests, please try after sometime."
    })
  },
  store: new RedisStore({
    sendCommand: async(...args:string[]):Promise<RedisReply> => {
      return await redisClient.call(args[0], ...args.slice(1)) as RedisReply
    }
  })
})