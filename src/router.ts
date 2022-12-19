import { Db } from 'mongodb';
import Router from 'koa-router'
import { v4 as uuidv4 } from 'uuid';
import userRoute from "@routes/user"
import adminRoute from '@routes/admin';
import propurementRoute from '@routes/propurement';

const router = new Router()

router.use("/user", userRoute.routes(), userRoute.allowedMethods());
router.use("/admin", adminRoute.routes(), adminRoute.allowedMethods());
router.use("/propurement", propurementRoute.routes(), propurementRoute.allowedMethods());

export default router