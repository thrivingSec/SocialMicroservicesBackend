import { Request } from "express";
import { Redis } from "ioredis"
import {z} from "zod";

// Registration Schema
export const registrationSchema = z.object({
  username:z.string().min(3, "User name must have atleast 3 chars."),
  email:z.email(),
  password:z.string().min(6, "Password must have atleast 6 chars."),
  confirmPassword:z.string()
})

// Login Schema
export const loginSchema = z.object({
  identifier:z.union([
    z.string("Username must be a string").min(3, "Username cannot be less than 3 chars"), 
    z.email("Invalid email format")
  ]),
  password:z.string()
})

// Email Verification Schema
export const emailVerficationSchema = z.object({
  email:z.email(),
  otp:z.number()
})

// Forgot password reset schema
export const passResetSchema = z.object({
  token:z.string(),
  newPass:z.string().min(6, "Password must be atleast 6 char long."),
  confirmNewPass:z.string()
})


export interface EXTENDEDREQ extends Request {
  user?:any;
  redisClient?:Redis
}