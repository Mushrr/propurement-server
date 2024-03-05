// 管理员

import Route from "koa-router";
import adminUserRoute from "@routes/admin/user";
import adminPropurementRoute from "./admin/propurement";
import fileRoute from "./admin/file";
import transitionRoute from "./admin/transition";
import adminLoginRoute from "./admin/login";
import historyRoute from './admin/history';
import allUserRoute from "./admin/all-user";
import companyTransition from "./admin/company-transition";
import singleTransitionRoute from "./admin/single-transition";
import singlePropurementRoute from "./admin/single-propurement";
import setAgentRoute from "./admin/set-agent";

const adminRoute = new Route();

adminRoute.use('/user', adminUserRoute.routes(), adminUserRoute.allowedMethods());
adminRoute.use('/propurement', adminPropurementRoute.routes(), adminPropurementRoute.allowedMethods());
adminRoute.use('/file', fileRoute.routes(), fileRoute.allowedMethods());
adminRoute.use('/transition', transitionRoute.routes(), transitionRoute.allowedMethods());
adminRoute.use('/login', adminLoginRoute.routes(), adminLoginRoute.allowedMethods());
adminRoute.use('/history', historyRoute.routes(), historyRoute.allowedMethods());
adminRoute.use('/company', allUserRoute.routes(), allUserRoute.allowedMethods());
adminRoute.use('/company-transition', companyTransition.routes(), companyTransition.allowedMethods());
adminRoute.use('/single-transition', singleTransitionRoute.routes(), singleTransitionRoute.allowedMethods());
adminRoute.use('/single-propurement', singlePropurementRoute.routes(), singlePropurementRoute.allowedMethods());
adminRoute.use('/set-agent', setAgentRoute.routes(), setAgentRoute.allowedMethods());

export default adminRoute;