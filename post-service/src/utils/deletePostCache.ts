import { EXTENDEDREQ } from "../shared/schema.js";
import { logger } from "./logger.js";

export async function deletePostCache(req:EXTENDEDREQ, input:string){
  try {
    
    const cacheKey = `post:${input}`;
    await req.redisClient?.del(cacheKey);

    const keys = await req.redisClient?.keys("posts:*");
    if(keys && keys.length > 0){
      await req.redisClient?.del(keys);
      logger.info(`Delete keys from the redis cache: ${keys}`);
      return;
    }
  } catch (error:any) {
    throw error
  }
}