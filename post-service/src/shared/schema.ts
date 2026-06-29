import {Request} from "express";
import {Redis} from "ioredis"
import {z} from "zod";


export interface EXTENDEDREQ extends Request {
  user?:any,
  redisClient?:Redis
}

export const createPostSchema = z.object({
  content:z.string().min(3,"Content length should be atleast 3 chars.").max(3000, "Content length cannot exceed 3000 chars"),
  mediaIds:z.array(z.string()).optional()
})

export const updatePostSchema = z.object({
  newContent:z.string().min(3,"Content length should be atleast 3 chars.").max(3000, "Content length cannot exceed 3000 chars"),
  newMediaIds:z.array(z.string()).optional()
})

export const deleteUserSchema = z.object({
  deleteUserId:z.string()
})