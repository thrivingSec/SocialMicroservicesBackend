import {z} from "zod";

export const verificationMailMsgSchema = z.object({
  username:z.string(),
  email:z.email(),
  otp:z.number()
})
export const OnboardingMailMsgSchema = z.object({
  username:z.string(),
  email:z.email(),
  verificationLink:z.string()
})
export const resetUriSchema = z.object({
  resetUri:z.string(),
  username:z.string(),
  email:z.email()
})