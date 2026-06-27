import express from "express";
import { getCurrentUserProfile, getUserById, searchUserByUsername, updateRefreshToken, userEmailVerification, userForgotPassword, userLogin, userLogout, userProfileSetup, userRegister, userResetPassword } from "../controllers/user.controllers.js";
import { authUser } from "../middlewares/auth.js";

const router = express.Router();

// API dsc: register new user
// API method: POST
// API endpoint: api-gateway/v1/user/register -> localhost/api/user/register
router.post("/register", userRegister);

// API dsc: verify new user
// API method: POST
// API endpoint: api-gateway/v1/user/verify -> localhost/api/user/verify
router.post("/verify", userEmailVerification);

// API dsc: verify new user
// API method: PUT
// API endpoint: api-gateway/v1/user/update -> localhost/api/user/update
router.put("/update", authUser, userProfileSetup);

// API dsc: login user
// API method: POST
// API endpoint: api-gateway/v1/user/login -> localhost/api/user/login 
router.post("/login", userLogin);

// API dsc: update refresh token
// API method: POST
// API endpoint: api-gateway/v1/user/refresh-token -> localhost/api/user/refresh-token 
router.post("/refresh-token", authUser, updateRefreshToken);

// API dsc: logout user
// API method: POST
// API endpoint: api-gateway/v1/user/logout -> localhost/api/user/logout 
router.post("/logout", authUser, userLogout);

// API dsc: forgot password
// API method: POST
// API endpoint: api-gateway/v1/user/forgot -> localhost/api/user/forgot 
router.post("/forgot", userForgotPassword);

// API dsc: reset password
// API method: POST
// API endpoint: api-gateway/v1/user/reset -> localhost/api/user/reset
router.post("/reset", userResetPassword);

// API dsc: search user by user name
// API method: POST
// API endpoint: api-gateway/v1/user/search -> localhost/api/user/search
router.post("/search", authUser, searchUserByUsername);

// API dsc: get user by user id
// API method: GET
// API endpoint: api-gateway/v1/user/search -> localhost/api/user/search
router.get("/search", authUser, getUserById);

// API dsc: get current user
// API method: GET
// API endpoint: api-gateway/v1/user -> localhost/api/user
router.get("/", authUser, getCurrentUserProfile);

export default router;