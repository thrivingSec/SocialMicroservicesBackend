import express, {Express, NextFunction, Request, Response} from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiVersionHandler } from "./middlewares/apiVersionHandler.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { logger } from "./utils/logger.js";
import { authProxy } from "./controllers/auth.proxy.controllers.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { postProxy } from "./controllers/post.proxy.controllers.js";
import { validateToken, validateTokenAuthService } from "./middlewares/auth.js";
import { searchProxy } from "./controllers/search.proxy.controllers.js";
import { mediarPoxyRouter } from "./middlewares/mediaProxyRouter.js";


const app: Express = express();

// MIDDLEWARES
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use(apiVersionHandler("v1"));
app.use(rateLimiter);
app.use((req:Request, res:Response, next:NextFunction) => {
  logger.info(`Request from:${req.ip} method:${req.method} url:${req.url}`);
  next();
});
app.use("/v1/user", validateTokenAuthService, authProxy);
app.use("/v1/post", validateToken, postProxy);
app.use("/v1/media", validateToken, mediarPoxyRouter);
app.use("/v1/search", validateToken, searchProxy);

app.use(errorHandler)

export default app;