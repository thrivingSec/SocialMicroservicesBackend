import { Media } from "../models/media.model.js";
import { deleteMediaSchema, deleteUserSchema } from "../shared/schema.js";
import { deleteMediaFromCloudinary } from "../utils/cloudinaryConfig.js";
import { logger } from "../utils/logger.js";

export const deleteMedaiEventHandler = async (msg: Buffer) => {
  try {
    const msgString = msg.toString();
    const msgObj = await JSON.parse(msgString);
    const parshed = deleteMediaSchema.safeParse(msgObj);
    if (parshed.success !== true) {
      const errMsgArray = await JSON.parse(parshed.error.message);
      throw new Error(
        `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
      );
    }
    Promise.all(
      parshed.data.publicId.map(async (pid: string) => {
        await deleteMediaFromCloudinary(pid);
        logger.info(`Deleted media from clodinary`);
        await Media.deleteOne({
          publicId: pid,
          user: parshed.data.userId,
        });
        logger.info("Deleted media from database.");
      }),
    )
      .then((val) => logger.info(`Media deletion task completed successfully.`))
      .catch((reason) =>
        logger.warn(`Media deletion task failed, reason:${reason}`),
      );
  } catch (error: any) {
    logger.error(
      error.message ?? `Error in handling delete media event ${error}`,
    );
  }
};

export const deleteUserEventHandler = async (msg:Buffer) => {
  const msgObj = await JSON.parse(msg.toString());
  const parshed = deleteUserSchema.safeParse(msgObj);
  if(parshed.success === false){
    const errMsgArray = await JSON.parse(parshed.error.message);
    logger.error(
      `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
    );
    return;
  }
  const {deleteUserId} = parshed.data;
  try {
    await Media.deleteMany({user:deleteUserId});
    logger.info(`All media associated with the user:${deleteUserId} has been deleted.`)
  } catch (error:any) {
    logger.error(`Error in deleted media associated with the user.`)
  }
}
