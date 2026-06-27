import { APIError } from "../lib/customError.js";
import { reqHandler } from "../middlewares/reqHandler.js";
import { Search } from "../models/search.model.js";
import { EXTENDEDREQ } from "../shared/schema.js";
import { logger } from "../utils/logger.js";

export const searchPost = reqHandler(async(req:EXTENDEDREQ, res, next) => {
  const q = req.query.q;
  if(!q || q.length === 0){
    throw new APIError(400, "Search query not found.")
  }
  const cacheKey = `searchResut:${q.toString().trim().toLocaleLowerCase()}`
  const cachedPost = await req.redisClient?.get(cacheKey);
  
  if(cachedPost){
    const cachedPostObj = await JSON.parse(cachedPost);
    if(Array.isArray(cachedPostObj) && cachedPostObj.length > 0){
      logger.info(`Sending search response from cache: ${cachedPostObj.length}`)
      return res.status(200).json({
        status:"success",
        message:"Post searched successfully.",
        postCount:cachedPostObj.length,
        data:cachedPostObj
      })
    }
  }
  const searchResult = await Search.find(
    {
      $text: { $search: q },
    },
    {
      score: { $meta: 'textScore' },
    },
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
  
  logger.info(`Search reasult fetched fro database. ${searchResult.length}`)
  logger.info(`Seting the result to cache: ${cacheKey}`)

  await req.redisClient?.setex(cacheKey, 300, JSON.stringify(searchResult))
  
  res.status(200).json({
    status:"success",
    message:"Documents searched successfully",
    postCount:searchResult.length,
    data:searchResult
  })
})