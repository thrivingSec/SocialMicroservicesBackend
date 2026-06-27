import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUSER } from "../models/user.model.js";
import { ENV } from "../shared/env.js";
import { RefreshToken } from "../models/refreshToken.model.js";

export function generateAccessToken(user:IUSER){
  const accessToken = jwt.sign({
    userId:user._id,
    username:user.username
  }, ENV.JWT_SECRET, {expiresIn:"60m"});
  return accessToken;
}

export async function generateRefreshToken(user:IUSER){
  const refreshToken = crypto.randomBytes(40).toString("hex");
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await RefreshToken.create({
    token:refreshToken,
    user:user._id,
    expiresAt
  })
  return refreshToken;
}