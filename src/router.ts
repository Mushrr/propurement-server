import { Db } from 'mongodb';
import Router from 'koa-router'
import { v4 as uuidv4 } from 'uuid';
import userRoute from "@routes/user"
import adminRoute from '@routes/admin';
import propurementRoute from '@routes/propurement';
import bucketRoute from '@routes/bucket';
import historyRoute from '@routes/history';
import priceRoute from '@routes/price';
import ratioRoute from '@routes/ratio';
import transitionRoute from '@routes/transition';
import agentHistoryRoute from '@routes/agenthistory';

const router = new Router()

router.use("/user", userRoute.routes(), userRoute.allowedMethods());
router.use("/admin", adminRoute.routes(), adminRoute.allowedMethods());
router.use("/propurement", propurementRoute.routes(), propurementRoute.allowedMethods());
router.use("/bucket", bucketRoute.routes(), bucketRoute.allowedMethods());
router.use("/history", historyRoute.routes(), historyRoute.allowedMethods());
router.use("/price", priceRoute.routes(), priceRoute.allowedMethods());
router.use("/ratio", ratioRoute.routes(), ratioRoute.allowedMethods());
router.use("/transition", transitionRoute.routes(), transitionRoute.allowedMethods());
router.use("/agenthistory", agentHistoryRoute.routes(), agentHistoryRoute.allowedMethods());


export default router