// register, refresh token, login, logout
import { APIError } from "../lib/customError.js";
import { reqHandler } from "../middlewares/reqHandler.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import User from "../models/user.model.js";
import { ENV } from "../shared/env.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { logger } from "../utils/logger.js";
import { getOTP } from "../utils/otp.js";
import { publishTask } from "../utils/rabbitmqConfig.js";
import {
  emailVerficationSchema,
  EXTENDEDREQ,
  loginSchema,
  passResetSchema,
  registrationSchema,
} from "../utils/schemaValidation.js";
import crypto from "crypto";

// user register
export const userRegister = reqHandler(async (req: EXTENDEDREQ, res, next) => {
  logger.info(`Registration endpoint hit : ${req.method} ${req.url} ${req.ip}`);

  const { username, email, password, confirmPassword } = req.body;

  const parshed = registrationSchema.safeParse({
    username,
    email,
    password,
    confirmPassword,
  });
  if (parshed.success !== true) {
    const errMsgArray = await JSON.parse(parshed.error.message);
    throw new APIError(
      400,
      `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
    );
  }
  if (password !== confirmPassword) {
    throw new APIError(
      400,
      "Data validation error: password must match confirm password",
    );
  }
  // cache key
  const cacheKey = `emailVerification:${email}`;
  // check cache
  const existingCache = await req.redisClient?.get(cacheKey);
  if (existingCache) {
    res.status(200).json({
      status: "success",
      message: "OTP already sent on the registered email.",
    });
  } else {
    let existingUser = await User.find({ $or: [{ username }, { email }] });
    if (existingUser.length > 0) {
      throw new APIError(406, "User already exists");
    }

    const newOTP = getOTP();

    const cacheUserData = {
      username,
      email,
      password,
      otp: newOTP,
    };

    await req.redisClient?.setex(cacheKey, 300, JSON.stringify(cacheUserData));

    await publishTask(
      ENV.EXCHANGE_NAME,
      "register.user",
      Buffer.from(JSON.stringify({ username, email, otp: newOTP })),
    );

    res.status(200).json({
      status: "success",
      message: "OTP sent on the registered email.",
    });
  }
});

// user email verification
export const userEmailVerification = reqHandler(
  async (req: EXTENDEDREQ, res, next) => {
    const { email, otp } = req.body;
    const parshed = emailVerficationSchema.safeParse({ email, otp });
    if (parshed.success !== true) {
      const errMsgArray = await JSON.parse(parshed.error.message);
      throw new APIError(
        400,
        `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
      );
    }
    const cacheKey = `emailVerification:${email}`;
    const cachedUserInfo = await req.redisClient?.get(cacheKey);
    if (!cachedUserInfo) {
      throw new APIError(406, "OTP expired, please register again.");
    }

    const cachedUser = await JSON.parse(cachedUserInfo);
    if (otp !== cachedUser.otp) {
      throw new APIError(400, "Invalid otp");
    }
    await req.redisClient?.del(cacheKey);
    const newUser = new User({
      username: cachedUser.username,
      email: cachedUser.email,
      password: cachedUser.password,
    });
    await newUser.save();
    logger.info(
      `New user ${cachedUser.username} created after successfull email verification.`,
    );

    const accessToken = generateAccessToken(newUser);
    const refreshToken = await generateRefreshToken(newUser);
    logger.info(
      `Access token and refresh token for the user ${newUser._id.toString()} created successfully.`,
    );

    await publishTask(
      ENV.EXCHANGE_NAME,
      "onboarding.user",
      Buffer.from(
        JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          verificationLink: `http://localhost:3001/v1/user/update`,
        }),
      ),
    );

    res.cookie("jwt_refresh", refreshToken, {
      httpOnly: true, // Prevents XSS attacks (JS cannot read it)
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
    });

    res.status(201).json({
      status: "success",
      message: "Onboarding procees completed successfully.",
      data: {
        userId: newUser._id,
        accessToken,
      },
    });
  },
);

// user profile setup/update(authentication required)
export const userProfileSetup = reqHandler(
  async (req: EXTENDEDREQ, res, next) => {
    const userId = req.user.userId;
    const { bio, mediaId } = req.body;
    let updateFields: {
      bio?: string | null;
      profilePic?: string | null;
    } = {};
    if (bio !== undefined) {
      updateFields.bio = bio;
    } else {
      updateFields.bio = null;
    }
    if (mediaId !== undefined) {
      updateFields.profilePic = mediaId;
    } else {
      updateFields.profilePic = null;
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    );
    if (!updateUser) {
      return res.status(400).json({
        status: "error",
        message: "User doest not exists.",
      });
    }
    res.status(201).json({
      status: "success",
      message: "Profile updated sucessfully",
    });
  },
);

// user login
export const userLogin = reqHandler(async (req, res, next) => {
  logger.info(`Login endpoint hit : ${req.method} ${req.url} ${req.ip}`);

  const { error, success, data } = loginSchema.safeParse(req.body);
  if (success === false) {
    throw new APIError(406, `User input validation error, ${error}`);
  }
  const { identifier, password } = data;

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) {
    throw new APIError(406, "Invalid credentials");
  }

  const validate = await user.comparePassword(password);
  if (!validate) {
    throw new APIError(406, "Invalid crdentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  res.cookie("jwt_refresh", refreshToken, {
    httpOnly: true, // Prevents XSS attacks (JS cannot read it)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
  });

  res.status(200).json({
    status: "success",
    message: "login successfull",
    userId: user._id,
    accessToken,
  });
});

// update refreshToken
export const updateRefreshToken = reqHandler(async (req, res, next) => {
  logger.info(
    `Refresh Token endpoint hit : ${req.method} ${req.url} ${req.ip}`,
  );

  const refreshToken = req.body;
  if (!refreshToken) {
    throw new APIError(400, "Users token is missing");
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken || storedToken?.expiresAt < new Date()) {
    throw new APIError(406, "Refresh token has expired, login needed.");
  }

  const user = await User.findById(storedToken.user);
  if (!user) {
    throw new APIError(
      401,
      "User associated with the Refresh Token does not exist any more.",
    );
  }

  await RefreshToken.deleteOne({ _id: storedToken._id });

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);

  res.cookie("jwt_refresh", newRefreshToken, {
    httpOnly: true, // Prevents XSS attacks (JS cannot read it)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
  });

  res.status(201).json({
    status: "success",
    message: "refresh token updated.",
    accessToken: newAccessToken,
  });
});

// logout -> auth required
export const userLogout = reqHandler(async (req, res, next) => {
  logger.info(
    `Refresh Token endpoint hit : ${req.method} ${req.url} ${req.ip}`,
  );

  const refreshToken = req.cookies["jwt_refresh"];
  if (!refreshToken) {
    throw new APIError(
      400,
      "Invalid request, refresh token cookie is missing.",
    );
  }
  await RefreshToken.deleteOne({ token: refreshToken });
  logger.info(`Refresh token deleted from database`);

  res.clearCookie("jwt_refresh", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(201).json({
    status: "success",
    message: "loged out successfull",
  });
});

// forgot password
export const userForgotPassword = reqHandler(
  async (req: EXTENDEDREQ, res, next) => {
    // username/email -> fetch user -> if not then throw error -> if user then cache(resetToken:email) + sendmail(frontendUrl/resetToken)
    const { identifier } = req.body;
    if (!identifier) {
      throw new APIError(400, "Missing username/email.");
    }
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      throw new APIError(400, "Invalid identifier");
    }

    const resetToken = crypto.randomBytes(40).toString("hex");

    await req.redisClient?.setex(
      `forgotPassword:${resetToken}`,
      300,
      user.email,
    );

    const resetUri = `${ENV.FRONTEND_DOMAIN}/user/reset/${resetToken}`;

    await publishTask(
      ENV.EXCHANGE_NAME,
      "forgotPassword",
      Buffer.from(
        JSON.stringify({
          resetUri,
          username: user.username,
          email: user.email,
        }),
      ),
    );

    res.status(200).json({
      status: "success",
      message: "Password reset url sent to registered email.",
    });
  },
);

// reset password
export const userResetPassword = reqHandler(
  async (req: EXTENDEDREQ, res, next) => {
    // token + newPass + newConfirmPass -> email -> user -> newPass !== newConfirmPass (error) -> newPass === oldPass (error) -> update pass
    const parshed = passResetSchema.safeParse(req.body);
    if (parshed.success !== true) {
      const errMsgArray = await JSON.parse(parshed.error.message);
      throw new APIError(
        400,
        `Validation error, ${errMsgArray[0].message} on field ${errMsgArray[0].path}`,
      );
    }
    if (parshed.data.newPass !== parshed.data.confirmNewPass) {
      throw new APIError(
        406,
        "New password does not matches the confirm password.",
      );
    }
    const cacheKey = `forgotPassword:${parshed.data.token}`;
    const resetUserEmail = await req.redisClient?.get(cacheKey);
    if (!resetUserEmail) {
      throw new APIError(406, "Reset uri expired please try again.");
    }
    await req.redisClient?.del(cacheKey);
    const user = await User.findOne({ email: resetUserEmail });
    if (!user) {
      throw new APIError(400, "User not found.");
    }
    const noChange = await user.comparePassword(parshed.data.newPass);
    if (noChange === true) {
      throw new APIError(406, "Please create a different password.");
    }
    user.password = parshed.data.newPass;
    await user.save();
    logger.info(
      `Password updated successfully for user ${user._id.toString()}`,
    );
    return res.status(201).json({
      status: "success",
      message: "Password updated successfully",
      userId: user._id,
    });
  },
);

// get users by username
export const searchUserByUsername = reqHandler(
  async (req: EXTENDEDREQ, res, next) => {
    logger.info(`Request hit a search user endpoint.`)
    const userId = req.user.userId;
    const { username } = req.body;

    if (!username || typeof username !== "string" || username.length === 0) {
      throw new APIError(400, "Invalid username");
    }
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { username: { $regex: username, $options: "i" } },
      ],
    }).select("_id username email profilePic bio");
    logger.info("Users fetched successfully")
    res.status(200).json({
      status:"success",
      message:"Users found",
      userCount:users.length,
      users
    })
  },
);

// get user by Id
export const getUserById = reqHandler(async (req:EXTENDEDREQ, res, next) => {
  logger.info(`Received req at get user by id end point`)
  const id = req.query.id;
  const user = await User.findById(id);
  if(!user){
    throw new APIError(400, "User not found");
  }
  logger.info(`User fetched successfully`)
  res.status(200).json({
    status:"success",
    message:"User found",
    user
  })
}); // fix needed ->  stop returning password.

// get current login user
export const getCurrentUserProfile = reqHandler(async (req:EXTENDEDREQ, res, next) => {
  logger.info(`Received req at get current user profile end point`)

  const userId = req.user.userId;
  const userProfile = await User.findById(userId).select("-password");
  if(!userProfile){
    throw new APIError(400, "User profile not found");
  }
  logger.info(`Current user profile fetched successfully.`);
  res.status(200).json({
    status:"success",
    message:"User profile fetched successfully.",
    user:userProfile
  })
});

// delete user
export const deleteUserAccount = reqHandler(async (req:EXTENDEDREQ, res, next) => {
  logger.info(`Received request at delete user account endpoint.`)
  const userId = req.user.userId;
  const deletedUser = await User.findByIdAndDelete(userId);
  const refreshTokens = await RefreshToken.deleteMany({user:userId})
  if(deletedUser){
    await publishTask(ENV.EXCHANGE_NAME, "delete.user", Buffer.from(JSON.stringify({deleteUserId:deletedUser._id.toString()})))
    logger.info(`"user.delete" task published successfully.`);
  }
  res.status(201).json({
    status:"success",
    message:"user deleted successfully."
  })
});
