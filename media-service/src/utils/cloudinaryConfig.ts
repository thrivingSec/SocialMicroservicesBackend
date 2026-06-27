import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../shared/env.js";
import { logger } from "./logger.js";

export const uploadMediaToCloudinary = (file: any) => {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
        } else {
          resolve(uploadResult);
        }
      },
    );
    uploadStream.end(file.buffer);
  });
};

export const deleteMediaFromCloudinary = async(publicId:string) => {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
  });
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Error in media deletion from cloudinary: ${error}`);
    throw error;
  }
};
