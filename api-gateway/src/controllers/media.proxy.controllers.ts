import proxy from "express-http-proxy";
import { proxyOptions } from "../utils/proxyConfig.js";
import { ENV } from "../shared/env.js";
import { logger } from "../utils/logger.js";

export const mediaJsonProxy = proxy(ENV.MEDIA_SERVICE_URI,{
  ...proxyOptions,
  proxyReqOptDecorator(proxyReqOpts, srcReq:any) {
    if(srcReq.method !== "GET" && srcReq.method !== "DELETE"){
      proxyReqOpts.headers["content-type"] = "application/json"
    }
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts
  },
  userResDecorator(proxyRes, proxyResData, userReq, userRes) {
    logger.info(`Response received from proxyHost:media-service statusCode:${proxyRes.statusCode}`)
    return proxyResData;
  },
})

export const mediaMultipartProxy = proxy(ENV.MEDIA_SERVICE_URI,{
  ...proxyOptions,
  proxyReqOptDecorator(proxyReqOpts, srcReq:any) {
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts
  },
  userResDecorator(proxyRes, proxyResData, userReq, userRes) {
    logger.info(`Response received from proxyHost:media-service statusCode:${proxyRes.statusCode}`)
    return proxyResData;
  },
  parseReqBody:false
})