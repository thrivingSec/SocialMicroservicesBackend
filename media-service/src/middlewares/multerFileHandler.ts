import multer from "multer";
import { EXTENDEDREQ } from "../shared/schema.js";
import { NextFunction, Response } from "express";
import { logger } from "../utils/logger.js";

const upload = multer({
  storage:multer.memoryStorage(),
  limits:{
    fileSize:5*1024*1024
  }
}).single("file")

export const fileHandler = (req:EXTENDEDREQ, res:Response, next:NextFunction) => {
   upload(req, res, function (err) {
     if (err instanceof multer.MulterError) {
       logger.error(`Multer error while uploading: ${err}`);
       return res.status(400).json({
         stauts: "error",
         message: err.message ?? "Error in file handling.",
         error: err.stack,
       });
     } else if (err) {
       logger.error(`Some error occoured in file handling, ${err}`);
       return res.status(500).json({
         status: "error",
         message: "Something went wron in file handling.",
       });
     }
     if (!req.file) {
       return res.status(400).json({
         status: "No file found.",
       });
     }
     next();
   });
}