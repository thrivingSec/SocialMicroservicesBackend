import { Request } from "express";
import {Redis} from "ioredis";
import {z} from "zod";

export interface EXTENDEDREQ extends Request {
  user?:any,
  redisClient?:Redis
}

export const addPostEventSchema = z.object({
  postId:z.string(),
  user:z.string(),
  content:z.string(),
  createdAt:z.string()
})

export const deletePostEventSchema = z.object({
  userId:z.string(),
  postId:z.string(),
  publicId:z.array(z.string()).min(1, "No public id provided.")
})

export const deleteUserSchema = z.object({
  deleteUserId:z.string()
})