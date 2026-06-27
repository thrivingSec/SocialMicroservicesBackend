import { logger } from "./logger.js";
import { redisClient } from "./redisClient.js"

export const deletePostCache = async() => {
  const keys = await redisClient.keys(`searchResut:*`);
  if(keys && keys.length > 0){
    await redisClient.del(keys);
    logger.info(`Cached cleared`)
  }
}