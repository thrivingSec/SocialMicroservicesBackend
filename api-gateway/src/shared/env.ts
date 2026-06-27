import dotenv from "dotenv";
import {z} from "zod";

dotenv.config();

const envSchema = z.object({
  PORT:z.string(),
  NODE_ENV:z.string(),
  REDIS_URI:z.string(),
  IDENTITY_SERVICE_URI:z.string(),
  POST_SERVICE_URI:z.string(),
  MEDIA_SERVICE_URI:z.string(),
  SEARCH_SERVICE_URI:z.string(),
  JWT_SECRET:z.string()
})

const parshed = envSchema.safeParse(process.env);

if(parshed.success !== true){
  throw new Error("Error in env config.");
}

export const ENV = Object.freeze(parshed.data);
