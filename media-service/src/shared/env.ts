import dotenv from "dotenv";
import {z} from "zod";

dotenv.config({});

const envSchema = z.object({
  PORT:z.string(),
  NODE_ENV:z.string(),
  MOGODB_URI:z.string(),
  REDIS_URI:z.string(),
  CLOUDINARY_API_SECRET:z.string(),
  CLOUDINARY_API_KEY:z.string(),
  CLOUDINARY_CLOUD_NAME:z.string(),
  RABBITMQ_URI:z.string(),
  EXCHANGE_NAME1:z.string()
});

const parshed = envSchema.safeParse(process.env);

if(parshed.success !== true){
  throw new Error("Error in env config.");
}

export const ENV = Object.freeze(parshed.data);






