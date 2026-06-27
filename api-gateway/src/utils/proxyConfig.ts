import {ProxyOptions} from "express-http-proxy";
import { logger } from "./logger.js";

export const proxyOptions:ProxyOptions = {
  proxyReqPathResolver(req) {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler(err, res, next) {
    logger.error(`ProxyError message:${err.message??"error in routing request from api-gateway"}`);
    res.status(500).json({
      status:"error",
      message:`Internal server error :: ${err.message?? "error in routing request from api-gateway"}` 
    })
  },
}