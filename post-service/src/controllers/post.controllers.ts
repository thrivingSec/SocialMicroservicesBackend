import { APIError } from "../lib/customError.js";
import { reqHandler } from "../middlewares/reqHandler.js";
import { Post } from "../models/post.model.js";
import { ENV } from "../shared/env.js";
import { createPostSchema, EXTENDEDREQ, updatePostSchema } from "../shared/schema.js";
import { deletePostCache } from "../utils/deletePostCache.js";
import { logger } from "../utils/logger.js";
import { publishTask } from "../utils/rabbitmqConfig.js";

export const createPost = reqHandler(async(req:EXTENDEDREQ, res, next) => {
  logger.info(`Create post endpoint hit, ${req.method} ${req.url} ${req.ip}`)
  const userId = req.user.userId;
  
  const parshed = createPostSchema.safeParse(req.body);
  if(!parshed.success){
    const errMsgArray = await JSON.parse(parshed.error.message);
    throw new APIError(400, `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`)
  }
  
  const {content, mediaIds} = parshed.data;
  const newPost = await Post.create({
    user:userId,
    content,
    mediaIds: mediaIds || []
  })
  const message = {
    postId:newPost._id.toString(),
    user:newPost.user.toString(),
    content:newPost.content,
    createdAt:newPost.createdAt
  }
  
  await publishTask(ENV.EXCHANGE_NAME1, "create.post", Buffer.from(JSON.stringify(message)))
  await deletePostCache(req, newPost._id.toString());

  logger.info(`New post created postId:${newPost._id}, userId:${userId}`);
  res.status(201).json({
    status:"success",
    message:"New post created successfully."
  })
})

export const getAllPost = reqHandler(async(req:EXTENDEDREQ, res, next) => {
  logger.info(`Get all post endpoint hit, ${req.method} ${req.url} ${req.ip}`);

  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);
  const skip = (page - 1) * limit;
  const cachedPostsKey = `posts:${page}:${limit}`;

  const cachedPost = await req.redisClient?.get(cachedPostsKey);
  if (cachedPost) {
    const cachedPostObj = await JSON.parse(cachedPost);
    const totalPosts = cachedPostObj.length;
    logger.info(`Returning posts from the cache, total posts:${totalPosts}`);
    const pagination = {
      totalItems: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      itemsPerPage: limit,
    };
    return res.status(200).json({
      status: "success",
      message: "Fetched all post successfully",
      data: cachedPostObj,
      pagination,
    });
  }
  const allPosts = await Post.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  const allPostString = JSON.stringify(allPosts);
  const totalPosts = allPosts.length;
  await req.redisClient?.setex(cachedPostsKey, 300, allPostString);
  logger.info(`Returning posts from the database, total posts:${totalPosts}`);
  const pagination = {
    totalItems: totalPosts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
    itemsPerPage: limit,
  };
  res.status(200).json({
    status: "success",
    message: "Fetched all post successfully",
    data: allPosts,
    pagination,
  });
})

export const getPostById = reqHandler(async(req:EXTENDEDREQ, res, next) => {
  const postId = req.params.id;
  if(!postId){
    throw new APIError(400, `post id is missing`);
  }
  const postKey = `post:${postId}`;
  const cachedPost = await req.redisClient?.get(postKey);
  if(cachedPost){
    const parshedCachedPost = await JSON.parse(cachedPost);
    logger.info(`Returning single post from the cache, postId:${postId}`)
    return res.status(200).json({
      status:"success",
      message:"post fetched successfully.",
      data:parshedCachedPost
    })
  }
  const post = await Post.findById(postId);
  if(!post){
    throw new APIError(404, 'Invalid post id');
  }
  await req.redisClient?.setex(postKey, 3600, JSON.stringify(post));
  logger.info(`Returning post from the database, postId:${postId}`);
  res.status(200).json({
    status:"success",
    message:"post fetched successfull",
    data:post
  })
})

export const updatePost = reqHandler(async (req:EXTENDEDREQ, res, next) => {
  const userId = req.user.userId
  const postId = req.params.id;
  if(!postId || typeof postId !== "string"){
    throw new APIError(400, "Invalid post id.")
  }
  const parshed = updatePostSchema.safeParse(req.body);
  if(!parshed.success){
    const errMsgArray = await JSON.parse(parshed.error.message);
    throw new APIError(400, `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`)
  }
  const {newContent, newMediaIds} = parshed.data;
  const updatedPost = await Post.findOneAndUpdate(
    {
      _id: postId,
      user: userId,
    },
    {
      $set: {
        content: newContent,
        mediaIds: newMediaIds ?? [],
      },
    },
    {
      new: true,
      upsert: true,
    },
  );
  if(!updatedPost){
    throw new APIError(406, "Post does not exists for the given user");
  }
  
  await publishTask(ENV.EXCHANGE_NAME1, "update.post", Buffer.from(JSON.stringify({
    userId,
    postId,
    content:newContent
  })))

  return res.status(200).json({
    status:"success",
    message:"Post update successfully.",
    date:{
      updatedPost
    }
  })
})

export const deletePostById = reqHandler(async(req:EXTENDEDREQ, res, next) => {
  const postId = req.params.id;
  const userId = req.user.userId;
  if(!postId){
    throw new APIError(400, `post id is missing`);
  }
  const deletedPost = await Post.findOneAndDelete({_id:postId, user:userId});
  if(!deletedPost){
    throw new APIError(404, "Invalid action");
  }
  logger.info(`Deleted one post from database, postId:${postId}`);

  await deletePostCache(req, postId.toString());
  logger.info(`Deleted one post fromt the cache if existed, postId:${postId}`);
  
  const message = {
    userId:userId.toString(),
    postId:postId.toString(),
    publicId:deletedPost.mediaIds
  }
  await publishTask(ENV.EXCHANGE_NAME1, "delete.post" ,Buffer.from(JSON.stringify(message)));

  res.status(200).json({
    status:"success",
    message:"post deleted successfully"
  })

})