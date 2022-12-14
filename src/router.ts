import { Db } from 'mongodb';
import Router from 'koa-router'
import { v4 as uuidv4 } from 'uuid';
import userRoute from "./routes/user"

const router = new Router()

router.use("/user", userRoute.routes(), userRoute.allowedMethods());

export default router