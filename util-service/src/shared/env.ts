import {z} from "zod"
import dotenv from "dotenv";

dotenv.config({});

const envSchema = z.object({
  PORT:z.string(),
  NODE_ENV:z.string(),
  RABBITMQ_URI:z.string(),
  EXCHANGE_NAME:z.string(),
  MAIL_USER:z.string(),
  MAIL_PASS:z.string()
})

const parsed = envSchema.safeParse(process.env);
if(parsed.success !== true){
  throw new Error("Error in env configuration");
}

export const ENV = Object.freeze(parsed.data)