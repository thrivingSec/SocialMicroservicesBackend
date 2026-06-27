import dotenv from "dotenv";
import {z} from "zod";
dotenv.config({});

const envSchema = z.object({
  PORT:z.string(),
  NODE_ENV:z.string(),
  MOGODB_URI:z.string(),
  REDIS_URI:z.string(),
  JWT_SECRET:z.string(),
  RABBITMQ_URI:z.string(),
  EXCHANGE_NAME:z.string(),
  FRONTEND_DOMAIN:z.string()
});

const parshed = envSchema.safeParse(process.env);

if(parshed.success !== true) {
  // TODO: LOGGING
  throw new Error("Error in env config.");
}

export const ENV = Object.freeze(parshed.data);



