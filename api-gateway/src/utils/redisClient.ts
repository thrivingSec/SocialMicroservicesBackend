import {Redis} from "ioredis";
import { ENV } from "../shared/env.js";

export const redisClient = new Redis(ENV.REDIS_URI);