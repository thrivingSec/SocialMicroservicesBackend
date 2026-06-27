import { APIError } from "../lib/customError.js";
import { reqHandler } from "../middlewares/reqHandler.js";
import { EXTENDEDREQ, uploadMediaSchema } from "../shared/schema.js";
import { deleteMediaFromCloudinary, uploadMediaToCloudinary } from "../utils/cloudinaryConfig.js";
import {UploadApiResponse} from "cloudinary"
import { logger } from "../utils/logger.js";
import { Media } from "../models/media.model.js";

export const mediaUpload = reqHandler(async(req:EXTENDEDREQ, res, next) => {
  logger.info(`Request hit at upload media endpoint, ${req.method}, ${req.url}, ${req.ip}`);
  const file = req.file;
  
  const parshed = uploadMediaSchema.safeParse(file);
  if(parshed.success !== true){
    const errMsgArray = await JSON.parse(parshed.error.message);
    throw new APIError(400, `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`)
  }

  const {originalname, mimetype} = parshed.data;

  logger.info(`Uploading file:${originalname} to cloudinary`);
  const clodinaryUplopadRes:UploadApiResponse = await uploadMediaToCloudinary(file) as UploadApiResponse;

  logger.info(`Creating media into database.`)
  const newMedia = await Media.create({
    publicId:clodinaryUplopadRes.public_id,
    originalName:originalname,
    mimeType:mimetype,
    url:clodinaryUplopadRes.secure_url,
    user:req.user.userId
  })

  res.status(201).json({
    status:"success",
    message:"media uploaded successfully",
    data:{
      mediaId:newMedia.publicId
    }
  })
})

export const mediaDelete = reqHandler(async(req:EXTENDEDREQ, res, next) => {
  logger.info(`Received request at delete media endpoint.`);
  const userId = req.user?.userId;
  const {mediaId} = req.body;
  console.log(userId, mediaId);
  if(!mediaId){
    throw new APIError(400, "No uploaded media id found.");
  }
  
  const deletedMedia = await Media.findOneAndDelete({
    publicId: mediaId,
    user: userId,
  });
  if (deletedMedia) {
    logger.info("Media deleted successfully from database.");
    await deleteMediaFromCloudinary(mediaId)
      .then((result) => {
        logger.info(`Media deleted successfully from the cloudinary ${result}`);
      })
      .catch((error) => {
        logger.error(`Error in media deletion from cloudinary: ${error}`);
      });
    res.status(200).json({
    status:"success",
    message:"Media deleted successfully"
  })
  }else{
    throw new APIError(400, "Invalid media.")
  }
})

// get media public uri
// get all media per user
