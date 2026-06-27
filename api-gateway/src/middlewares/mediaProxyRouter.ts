import { NextFunction, Response } from "express";
import { AUTHREQUEST } from "../shared/schema.js";
import {
  mediaJsonProxy,
  mediaMultipartProxy,
} from "../controllers/media.proxy.controllers.js";

export const mediarPoxyRouter = (
  req: AUTHREQUEST,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (
      req.headers["content-type"] === "application/json" ||
      req.method === "GET" ||
      req.method === "DELETE"
    ) {
      return mediaJsonProxy(req, res, next);
    } else if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
      return mediaMultipartProxy(req, res, next);
    }
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "invalid headers configuration",
    });
  }
};
