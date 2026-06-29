import { Search } from "../models/search.model.js";
import {
  addPostEventSchema,
  deletePostEventSchema,
  deleteUserSchema,
  updatePostSchema,
} from "../shared/schema.js";
import { deletePostCache } from "../utils/deletePostCache.js";
import { logger } from "../utils/logger.js";

export async function addPostIndexEventHandler(message: Buffer) {
  try {
    const msgString = message.toString();
    const msgObj = JSON.parse(msgString);
    const parshed = addPostEventSchema.safeParse(msgObj);
    if (parshed.success !== true) {
      const errMsgArray = await JSON.parse(parshed.error.message);
      logger.error(
        `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
      );
      return;
    }
    const newPost = new Search({
      postId: parshed.data.postId,
      user: parshed.data.user,
      content: parshed.data.content,
      createdAt: parshed.data.createdAt,
    });
    await newPost.save();

    logger.info(`Clearing all the cache`);
    await deletePostCache();

    logger.info(`Post saved to the data base, ${parshed.data.postId}.`);
  } catch (error: any) {
    logger.error(
      `Error from add post event handler: ${error.message ?? error}`,
    );
  }
}
export async function deletePostIndexEventHandler(message: Buffer) {
  try {
    const msgString = message.toString();
    const msgObj = JSON.parse(msgString);
    const parshed = deletePostEventSchema.safeParse(msgObj);
    if (parshed.success !== true) {
      const errMsgArray = await JSON.parse(parshed.error.message);
      logger.error(
        `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
      );
      return;
    }
    await Search.findOneAndDelete({
      postId: parshed.data.postId,
      user: parshed.data.userId,
    });
    logger.info(`Post deleted from the database, ${parshed.data.postId}.`);

    logger.info(`Clearing all the cache`);
    await deletePostCache();
  } catch (error: any) {
    logger.error(
      `Error from delete post event handler: ${error.message ?? error}`,
    );
  }
}
export async function deleteUserEventHandler(msg: Buffer) {
  const msgObj = await JSON.parse(msg.toString());
  const parshed = deleteUserSchema.safeParse(msgObj);
  if (parshed.success === false) {
    const errMsgArray = await JSON.parse(parshed.error.message);
    logger.error(
      `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
    );
    return;
  }
  const { deleteUserId } = parshed.data;
  try {
    await Search.deleteMany({ user: deleteUserId });
    logger.info(
      `All media associated with the user:${deleteUserId} has been deleted.`,
    );
  } catch (error: any) {
    logger.error(`Error in deleting media associated with the user.`);
  }
}
export async function updatePostEventHandler(msg: Buffer){
  const msgObj = JSON.parse(msg.toString());
  const parshed = updatePostSchema.safeParse(msgObj);
  if (parshed.success !== true) {
      const errMsgArray = await JSON.parse(parshed.error.message);
      logger.error(
        `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
      );
      return;
    }
  const {userId, postId, content} = parshed.data
  try {
    const updatedSearchPost = await Search.findOneAndUpdate(
      {postId, user:userId},
      {$set: {content}},
      {new:true, upsert:true}
    )
    if(!updatedSearchPost){
      logger.warn(`Can not update the search index for post ${postId}`);
    }
    logger.info(`Serch index updated successfully for the post ${postId}`);
  } catch (error) {
    logger.error(`Something went wrong while updating the search index for post updation: ${error}`);
  }
}
