import { Post } from "../models/post.model.js";
import { deleteUserSchema } from "../shared/schema.js";
import { logger } from "../utils/logger.js";

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
    await Post.deleteMany({user:deleteUserId});
    logger.info(`All media associated with the user:${deleteUserId} has been deleted.`)
  } catch (error:any) {
    logger.error(`Error in deleting media associated with the user.`)
  }
}