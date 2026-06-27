import mongoose from "mongoose";
import { ENV } from "../shared/env.js";

export async function connectDB():Promise<string> {
  try {
    const db = await mongoose.connect(ENV.MOGODB_URI, {dbName:"social-app-microservice"})
    return db.connection.host
  } catch (error:any) {
    throw error
  }
}