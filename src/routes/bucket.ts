import logger from '@utils/logger';
import { validateUser, getCollection } from '@utils/fetchTools';
import { createTransitionId, hasProperties } from '@utils/base';
import Route from 'koa-router'


const bucketRoute = new Route();

/**
 * 获取当前用户的购物车中的数据
 * @param {string} openid 用户的openid
 * @return 购物车中的数据
 */
bucketRoute.get("/", async (ctx, next) => {
    const req = ctx.request.query || {};
    const itemsCollection = getCollection(ctx, "items");
    if (hasProperties(req, ["openid"])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "user" || userValidate === "admin") {
            const bucketData = await (await itemsCollection).find({
                openid: req.openid,
                transitionId: process.env.DEFAULT_ORDERID
            })

            const data = [];

            for await (const item of bucketData) {
                data.push(item);
            }

            ctx.body = {
                code: 200,
                data: data
            }
        }
    } else {
        ctx.body = {
            code: 400,
            msg: "您缺少 openid 参数"
        }
        ctx.status = 400;
    }
    await next();
})

/**
 * 
 * @param {string} openid 用户的openid
 * @return 用户提交, 订单状态变成waiting
 */
bucketRoute.post("/", async (ctx, next) => {
    const req = ctx.request.body || {};

    if (hasProperties(req, ["openid"])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "user" || userValidate === "admin") {
            const itemsCollection = await getCollection(ctx, "items");
            if (req.lastModified) {
                itemsCollection.updateMany({
                    openid: req.openid,
                    transitionId: process.env.DEFAULT_ORDERID
                }, {
                    $set: {
                        transitionId: createTransitionId(),
                        lastModified: !isNaN(new Date(req.lastModified).getTime()) ? new Date(req.lastModified) : new Date(),
                        state: "waiting"
                    }
                })
            } else {
                itemsCollection.updateMany({
                    openid: req.openid,
                    transitionId: process.env.DEFAULT_ORDERID
                }, {
                    $set: {
                        transitionId: createTransitionId(),
                        state: "waiting"
                    },
                    $currentDate: {
                        lastModified: true
                    }
                })
            }
            ctx.body = {
                code: 200,
                msg: "提交成功"
            }
        } else {
            ctx.body = {
                code: 403,
                msg: "您没有权限执行此操作"
            }
            ctx.status = 403;
        }
    } else {
        ctx.body = {
            code: 400,
            msg: "您缺少 openid 参数"
        }
        ctx.status = 400;
    }
})



export default bucketRoute;