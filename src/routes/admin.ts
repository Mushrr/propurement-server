// 管理员

import Route from "koa-router";
import adminUserRoute from "@routes/admin/user";
import adminPropurementRoute from "./admin/propurement";

const adminRoute = new Route();

adminRoute.use('/user', adminUserRoute.routes(), adminUserRoute.allowedMethods());
adminRoute.use('/propurement', adminPropurementRoute.routes(), adminPropurementRoute.allowedMethods());

export default adminRoute;