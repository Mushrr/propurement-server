// 管理员

import Route from "koa-router";
import adminUserRoute from "@routes/admin/user";
import adminPropurementRoute from "./admin/propurement";
import fileRoute from "./admin/file";
import transitionRoute from "./admin/transition";
import adminLoginRoute from "./admin/login";
import historyRoute from './admin/history';

const adminRoute = new Route();

adminRoute.use('/user', adminUserRoute.routes(), adminUserRoute.allowedMethods());
adminRoute.use('/propurement', adminPropurementRoute.routes(), adminPropurementRoute.allowedMethods());
adminRoute.use('/file', fileRoute.routes(), fileRoute.allowedMethods());
adminRoute.use('/transition', transitionRoute.routes(), transitionRoute.allowedMethods());
adminRoute.use('/login', adminLoginRoute.routes(), adminLoginRoute.allowedMethods());
adminRoute.use('/history', historyRoute.routes(), historyRoute.allowedMethods());

export default adminRoute;