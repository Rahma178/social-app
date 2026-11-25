import { PORT } from "./config/config.service";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { AppError, GlobalErrorHandling } from "./common/utilitis/globalErrorHandling";
import authRouter from "./modules/auth/auth.controller";
import ConnectionDB from "./DB/connectionDB";
import  RedisService  from "./DB/redis.connection";
import userRouter from "./modules/users/user.controller";
import { success_response } from "./common/utilitis/success.responce";
import { default_success } from "./common/middleware/success.res.middleware";
import { S3Service } from "./common/service/s3.service";
import {pipeline} from 'stream/promises'

const app = express();
const port = PORT;

const limiter = rateLimit({
  windowMs: 60 * 5 * 1000,
  limit: 20,
  message: {
    success: false,
    message: "Too Many Request...",
  },
});


export const bootstrap = async () => {

    app.use(express.json(), cors(), helmet(), limiter)

    await ConnectionDB()
    await RedisService.connect()

    app.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ message: "hello on my app" })
    })

    // app.use(success_response);

    app.use("/auth", authRouter)
    app.use("/user", userRouter)

    app.get("/upload/*path", async (req: Request, res: Response, next: NextFunction) => {
  const { path } = req.params as { path: string[] };
  const Key = path.join("/");
  const { download } = req.query;

  const result = await new S3Service().getFile(Key);
  const stream = result.Body as NodeJS.ReadableStream;

  res.setHeader("Content-type", result.ContentType!);
  res.setHeader("cross-origin-resource-policy", "cross-origin");

  if (download && download == "true") {
    res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`);
  }

  pipeline(stream, res);
});


    app.use("/*demo", (req: Request, res: Response, next: NextFunction) => {
        throw new AppError(`Url:${req.originalUrl} with method:${req.method} not found`, 404)
    })

    app.use(default_success);

    app.use(GlobalErrorHandling)

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

export default bootstrap;
