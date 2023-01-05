import { Db } from 'mongodb';
// 管理员 对 user 的权限

import Route from "koa-router";
import { extractObject, hasProperties, objectStringSchema, objectToMongoUpdateSchema } from '@utils/base';
import logger from '@utils/logger';
import { UserInfo } from '@locTypes/user';


const adminUserRoute = new Route();

/**
 * @param: openid 管理员的Openid
 * @param: page 第几页 默认是第1页, 从 1 开始如果小于1会报错
 * @param: pageSize 每一页的代销 默认是10
 * @param: query 筛选选项, 直接通过get补充
 * @returns: 返回某一页用户的个人信息
 */
adminUserRoute.get("/", async (ctx, next) => {
    const db = ctx.state.db as Db;
    const userCollection = db.collection("user");
    const req = ctx.request.query || {};
    if (hasProperties(req, ["openid"])) {
        if (req.openid === process.env.ADMIN_OPENID) {
            const query = extractObject(req, ["openid", "page", "pageSize", "userOpenid"]);

            if (req.userOpenid) {
                query['openid'] = req.userOpenid 
            }
            const allUserCursor = userCollection.find(
                query
            );
            const userData = [];
            const page: number = req.page as number | undefined || 1;
            const pageSize: number = req.pageSize as number | undefined || 10;
            if (page < 1) {
                ctx.body = {
                    code: 500,
                    message: "page 不能小于1!"
                }
                ctx.status = 500;
            } else {
                const start = (page - 1) * pageSize;
                const end = (page) * pageSize;
                let ind = 0;
                for await (const user of allUserCursor) {
                    if (ind >= start) {
                        userData.push(user);
                    }
                    ind += 1;
                    if (ind >= end) {
                        break;
                    }
                }
                ctx.body = {
                    code: 200,
                    message: "获取成功",
                    data: userData
                }
            }
        } else {
            ctx.body = {
                code: 400,
                message: "您没有权限, 请与管理员联系",
            }
            ctx.status = 400;
            logger.warn(`用户 ${req.openid} 正在尝试获取用户信息!`);
        }
    }
    await next();
})

/**
 * 用户信息修改
 * @param: openid 管理员的OpenID
 * @param: userInfo 需要修改的用户信息, 在这里可以修改用户的类别
 */
adminUserRoute.post("/", async (ctx, next) => {
    const req = ctx.request.body || {};
    const db = ctx.state.db as Db;
    const userCollection = db.collection("user");
    console.log(req);
    if (hasProperties(req, ["openid", "userInfo"])) {
        const userInfo = req.userInfo as UserInfo;
        if (req.openid === process.env.ADMIN_OPENID) {
            if (await userCollection.findOne({ openid: userInfo.openid })) {
                const updateData = objectToMongoUpdateSchema(userInfo);
                userCollection.findOneAndUpdate(
                    { openid: userInfo.openid },
                    { $set: updateData }
                ); // update
                ctx.body = {
                    code: 200,
                    message: `用户 ${userInfo.openid} 修改成功, ${objectStringSchema(updateData)}`
                }
                logger.info(ctx.body.message);
            } else {
                ctx.body = {
                    code: 404,
                    message: `用户 ${userInfo.openid} 不存在,请仔细核实!`
                }
                ctx.status = 404;
            }
        } else {
            ctx.body = {
                code: 400,
                message: "您没有权限, 请与管理员联系",
            }
            ctx.status = 400;
            logger.warn(`用户 ${req.openid} 正在尝试获取用户信息!`);
        }
    }
    await next();
})

/**
 * 根据用户的OpenId 删除
 * @param: openid 管理员的OpenID
 * @param: userOpenid 用户的Openid
 */
adminUserRoute.del("/", async (ctx, next) => {
    const db = ctx.state.db as Db;
    const userCollection = db.collection('user');
    const req = ctx.request.query || {};
    if (hasProperties(req, ["openid", "userOpenid"])) {
        const userOpenid = req.userOpenid;
        if (req.openid === process.env.ADMIN_OPENID) {
            userCollection.findOneAndDelete({ openid: userOpenid });
            ctx.body = {
                code: 200,
                message: `用户 ${userOpenid} 已经成功删除`
            }
        } else {
            ctx.body = {
                code: 400,
                message: "您没有权限, 请与管理员联系",
            }
            ctx.status = 400;
            logger.warn(`用户 ${req.openid} 正在尝试获取用户信息!`);
        }

    } else {
        ctx.body = {
            code: 500,
            message: "信息补全，请出示 openid 以及 userOpenid, 否则将无法处理"
        }
        ctx.status = 500;
    }

    await next
})

export default adminUserRoute;