import express from "express";
import { authUser } from "../middlewares/auth.js";
import { createPost, deletePostById, getAllPost, getPostById } from "../controllers/post.controllers.js";

const postRouter = express.Router();

// API dsc: create post
// API method: POST
// API endpoint: localhost:3000/v1/post/create-post -> localhost:3001/api/post/create-post
postRouter.post("/create-post", authUser, createPost)

// API dsc: retrieve all posts
// API method: GET
// API endpoint: localhost:3000/v1/post/posts -> localhost:3001/api/post/posts
postRouter.get("/posts", authUser, getAllPost)

// API dsc: retrieve post by id
// API method: GET
// API endpoint: localhost:3000/v1/post/:id -> localhost:3001/api/post/:id
postRouter.get("/:id", authUser, getPostById)

// API dsc: delete post by id
// API method: DELETE
// API endpoint: localhost:3000/v1/post/:id -> localhost:3001/api/post/:id
postRouter.delete("/:id", authUser, deletePostById)

export default postRouter;