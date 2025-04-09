import express, {Express, urlencoded} from "express"
import * as http from "node:http";
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import config from "./config/app.config";
import authRouter from "./services/auth/auth.routes";
import errorHandler from "./middlewares/error.middleware";
import paymentRouter from "./services/payments/payment.routes";
import userRouter from "./services/user/user.routes";
import { authMiddleware } from "./middlewares/protected.middleware";
import redis from "./config/redis.config";
import { systemLogger } from "./utils/logger";
import { InternalServerException } from "./utils/error";
import { ErrorCode } from "./@types/errorCode.enum";
import { setupBullBoard } from "./queue/board";

const app: Express = express()

const server = http.createServer(app)

setupBullBoard(app)


app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());




app.use(`/${config.BASE_PATH}/auth`, authRouter);
app.use(`/${config.BASE_PATH}/payments`, authMiddleware, paymentRouter);
app.use(`/${config.BASE_PATH}/users`, authMiddleware, userRouter);

app.use(errorHandler)

export {
    app, server
}