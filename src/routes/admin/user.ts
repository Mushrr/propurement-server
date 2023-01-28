import { v4 } from 'uuid';
import { validateUser } from '@utils/fetchTools';
import { Db } from 'mongodb';
// 管理员 对 user 的权限

import Route from "koa-router";
import { extractObject, hasProperties, objectStringSchema, objectToMongoUpdateSchema, timePlus, Week, isSuperAdmin } from '@utils/base';
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
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "admin" || isSuperAdmin(req.openid as string)) {
            if (hasProperties(req, ['userOpenid[]']) && Array.isArray(req['userOpenid[]'])) {
                const query = extractObject(req, ["openid", "page", "pageSize", "userOpenid", "userOpenid[]"]) || {};
                const data = await userCollection.find({
                    openid: {
                        $in: req['userOpenid[]']
                    },
                    ...query
                }).toArray();
                ctx.body = {
                    code: 200,
                    data
                }
            } else {
                const query = extractObject(req, ["openid", "page", "pageSize", "userOpenid", "openid[]"]);
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
    // UserInfo
    const mongo = ctx.state.db as Db;
    const userCollection = mongo.collection("user");

    if (hasProperties(ctx.request.body, ["session_key"])) {
        // 返回
        // 目前微信小程序已经不需要获取用户的个人信息了，可以直接通过open-data获得
        const session_key = ctx.request.body.session_key;
        const data = await userCollection.findOne({
            "principals": {
                $elemMatch: {
                    "session_key": session_key,
                }
            }
        });

        if (data) {
            ctx.body = {
                code: 200,
                msg: "session_key 登入成功",
                data
            }
            logger.info("用户登入 获取到的session_key为: " + session_key);
        } else {
            // session 过期
            ctx.body = {
                code: 400,
                msg: "session_key 过期",
                data: null
            };
            ctx.status = 400
            logger.warn("用户的session_key: " + session_key + "已经过期");
        }


    } else if (hasProperties(ctx.request.body, ["create", "openid"])) {
        const req = ctx.request.body;
        const userValidate = await validateUser(req.openid, ctx);
        if (userValidate === "admin" || isSuperAdmin(req.openid)) {
            const userInfo = req.userInfo as UserInfo || {};

            // 检查必须的资料
            if (userInfo.organization && userInfo.organization?.company) {
                const data = userInfo;
                if (!data.openid) {
                    data.openid = v4(); // 使用uuid 随机创建一个
                }
                userCollection.insertOne(data);
                logger.info(`管理员添加用户成功  ${userInfo.organization.company}`);
                ctx.body = {
                    code: 200,
                    message: "添加了一个新用户"
                }
            } else {
                ctx.body = {
                    code: 500,
                    message: "您填写的信息中存在确实，必须填写 公司名称"
                }
                ctx.status = 500;
                logger.warn("在添加用户时填写的信息有缺失")
            }


        } else {
            ctx.body = {
                code: 400,
                message: "您无权创建用户，请联系管理员创建"
            }
        }
    } else if (hasProperties(ctx.request.body, ["update", "openid"])) {
        const req = ctx.request.body;
        const userInfo = req.userInfo as UserInfo || {};
        const userValidate = await validateUser(req.openid, ctx);
        if (userValidate === "admin" || isSuperAdmin(req.openid)) {

            const basicData = extractObject(userInfo, ["principals"]);
            const principals = userInfo.principals || [];

            // 一次性更新.
            const data = await userCollection.findOneAndUpdate({
                openid: userInfo.openid
            }, {
                $set: {
                    principals: principals,
                    ...objectToMongoUpdateSchema(basicData)
                }
            })

            if (data.ok) {
                ctx.body = {
                    code: 200,
                    message: "修改成功",
                }
                logger.info(`管理员修改用户openid为:${basicData.openid}成功`);
            } else {
                ctx.body = {
                    code: 500,
                    message: "修改失败, Mongodb 出现错误"
                }
                ctx.status = 500;
                logger.error(`管理员修改用户openid为:${basicData.openid} 遇到了Mongodb 错误`);
            }

        } else {
            ctx.body = {
                code: 400,
                message: "您无权修改用户，请联系管理员修改"
            }
            ctx.status = 400;
        }
    } else if (hasProperties(ctx.request.body, ["phone", "password"])) {

        await userCollection.findOneAndUpdate({
            "principals": {
                $elemMatch: {
                    "phone": ctx.request.body.phone,
                    "password": ctx.request.body.password
                }
            }
        }, {
            $set: {
                // 生成一个sessionkey
                "principals.$.session_key": v4(),
                "principals.$.expired": timePlus(new Date(), Week).toISOString()
            }
        })

        const data = await userCollection.findOne({
            "principals": {
                $elemMatch: {
                    "phone": ctx.request.body.phone,
                    "password": ctx.request.body.password
                }
            }
        })

        if (data?._id) {

            const ans = extractObject(data, ["principals"]);

            for (const pair of data.principals) {
                if (pair.phone === ctx.request.body.phone &&
                    pair.password === ctx.request.body.password) {
                    ans.userInfo = pair
                }
            }

            ctx.body = {
                code: 200,
                message: "登录成功",
                data: ans
            }
        } else {
            ctx.body = {
                code: 404,
                message: "您的账户不存在，请联系管理员"
            };
            ctx.status = 404;
        }

    } else {
        ctx.body = {
            code: 400,
            msg: "缺少必要参数, 请核实您要进行的服务类型后再操作"
        }
        logger.warn("缺少必要参数, 请核实您要进行的服务类型后再操作");
        ctx.status = 400;
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
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "admin" || isSuperAdmin(req.openid as string)) {
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