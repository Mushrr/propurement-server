import { Db } from 'mongodb';
import Router from 'koa-router'
import { v4 as uuidv4 } from 'uuid';
import userRoute from "@routes/user"
import adminRoute from '@routes/admin';
import propurementRoute from '@routes/propurement';
import bucketRoute from '@routes/bucket';
import historyRoute from '@routes/history';
import priceRoute from '@routes/price';

const router = new Router()

router.use("/user", userRoute.routes(), userRoute.allowedMethods());
router.use("/admin", adminRoute.routes(), adminRoute.allowedMethods());
router.use("/propurement", propurementRoute.routes(), propurementRoute.allowedMethods());
router.use("/bucket", bucketRoute.routes(), bucketRoute.allowedMethods());
router.use("/history", historyRoute.routes(), historyRoute.allowedMethods());
router.use("/price", priceRoute.routes(), priceRoute.allowedMethods());


export default router