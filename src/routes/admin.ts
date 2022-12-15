// 管理员

import Route from "koa-router";
import adminUserRoute from "@routes/admin/user";


const adminRoute = new Route();

adminRoute.use(adminUserRoute.routes(), adminUserRoute.allowedMethods());



export default adminRoute;