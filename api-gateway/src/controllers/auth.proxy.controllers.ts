import proxy from "express-http-proxy";
import { ENV } from "../shared/env.js";
import { proxyOptions } from "../utils/proxyConfig.js";
import { logger } from "../utils/logger.js";

export const authProxy = proxy(ENV.IDENTITY_SERVICE_URI, {
  ...proxyOptions,
  proxyReqOptDecorator(proxyReqOpts, srcReq:any) {
    if(srcReq.user){
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    }
    proxyReqOpts.headers["content-type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator(proxyRes, proxyResData, userReq, userRes) {
    logger.info(`Response received from proxyHost:identity-service statusCode:${proxyRes.statusCode}`)
    return proxyResData;
  },
} )