// 管理员

import Route from "koa-router";
import adminUserRoute from "@routes/admin/user";
import adminPropurementRoute from "./admin/propurement";
import fileRoute from "./admin/file";

const adminRoute = new Route();

adminRoute.use('/user', adminUserRoute.routes(), adminUserRoute.allowedMethods());
adminRoute.use('/propurement', adminPropurementRoute.routes(), adminPropurementRoute.allowedMethods());
adminRoute.use('/file', fileRoute.routes(), fileRoute.allowedMethods());

export default adminRoute;