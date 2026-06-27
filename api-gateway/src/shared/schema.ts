import {Request} from "express";

export interface AUTHREQUEST extends Request {
  user?:any
}