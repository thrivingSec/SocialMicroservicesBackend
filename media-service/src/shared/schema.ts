import {Request} from "express";
import {Redis} from "ioredis"
import {z} from "zod";


export interface EXTENDEDREQ extends Request {
  user?:any,
  redisClient?:Redis
}

export const uploadMediaSchema = z.object({
  fieldname:z.string(),
  originalname:z.string(),
  encoding:z.string(),
  mimetype:z.string(),
  buffer:z.instanceof(Buffer).refine((buffer) => buffer.length <  5 * 1024 * 1024, {message:"File cannot exceeds 5mb in size."})
})

export const deleteMediaSchema = z.object({
  userId:z.string(),
  postId:z.string(),
  publicId:z.array(z.string()).min(1, "No public id provided.")
})

export const deleteUserSchema = z.object({
  deleteUserId:z.string()
})