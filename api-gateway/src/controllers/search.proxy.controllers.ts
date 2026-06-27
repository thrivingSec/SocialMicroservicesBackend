import proxy from "express-http-proxy";
import { ENV } from "../shared/env.js";
import { logger } from "../utils/logger.js";
import { proxyOptions } from "../utils/proxyConfig.js";

export const searchProxy = proxy(ENV.SEARCH_SERVICE_URI,{
  ...proxyOptions,
  proxyReqOptDecorator(proxyReqOpts, srcReq:any) {
    proxyReqOpts.headers["content-type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts
  },
  userResDecorator(proxyRes, proxyResData, userReq, userRes) {
    logger.info(`Response received from proxyHost:post-service statusCode:${proxyRes.statusCode}`)
    return proxyResData;
  },
})