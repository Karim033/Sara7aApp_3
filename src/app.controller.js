import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Message/message.controller.js";
import connectDB from "./DB/connection.js";
import { globalErrorHandler } from "./Utils/globalErrorHandler.utils.js";
import cors from "cors";
import path from "node:path";
import { attachRouterWithLogger } from "./Utils/logger/logger.util.js";
import helmet from "helmet";
import { corsOption } from "./Utils/cors/cors.util.js";
import { rateLimit } from "express-rate-limit";

const bootstrap = async (app, express) => {
  app.use(express.json());
  app.use(cors(corsOption()));
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: {
      statusCode: 429,
      message: "Too Many Request, Please try again later",
    },
    legacyHeaders: false,
  });
  app.use(limiter);
  await connectDB();
  attachRouterWithLogger(app, "/api/v1/auth", authRouter, "auth.log");
  attachRouterWithLogger(app, "/api/v1/user", userRouter, "users.log");
  attachRouterWithLogger(app, "/api/v1/message", messageRouter, "messages.log");
  app.get("/", (req, res) => {
    return res.status(200).json({ message: "Done" });
  });
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/message", messageRouter);
  app.all("/*dummy", (req, res) => {
    return res.status(404).json({ message: "Not Found Hnalder!!" });
  });
  app.use(globalErrorHandler);
};

export default bootstrap;
