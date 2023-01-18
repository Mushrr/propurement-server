import { isObject } from 'mushr';
import logger from '@utils/logger';
import { hasProperties, extractObject, objectToMongoUpdateSchema } from '@utils/base';
import { getCollection, validateUser } from '@utils/fetchTools';
// 涉及到订单层面的操作

import Route from 'koa-router'


const transitionRoute = new Route();

/**
 * @param {string} openid 管理员openid
 * @param {number} pageSize
 * @param {number} page
 * @param {query} query 其他查询信息
 * @return {object} 订单信息
 */
transitionRoute.get("/", async (ctx, next) => {
    const req = ctx.request.query || {};
    const itemsCollection = getCollection(ctx, "items");
    if (hasProperties(req, ["openid"])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "admin") {
            const query = extractObject(req, ["openid", "page", "pageSize"]);
            const itemsCursor = (await itemsCollection).find(
                query,
                {
                    sort: {
                        lastModified: -1
                    }
                }
            );
            const itemsData = [];
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
                for await (const items of itemsCursor) {
                    if (ind >= start) {
                        itemsData.push(items);
                    }
                    ind += 1;
                    if (ind >= end) {
                        break;
                    }
                }
                ctx.body = {
                    code: 200,
                    message: "获取成功",
                    data: itemsData
                }
            }
        } else {
            ctx.body = {
                code: 400,
                msg: "您没有权限访问该接口"
            }
            ctx.status = 400;
            logger.warn(`非管理员用户 ${req.openid} 尝试访问了订单 ${req.transitionId} 的数据`);
        }
    } else {
        ctx.body = {
            code: 400,
            msg: "您缺少 openid, transitionId 参数"
        }
        ctx.status = 400;
        logger.warn(`用户 ${req.openid} 尝试访问了订单 ${req.transitionId} 的数据, 但是缺少参数`);
    }

    await next();
})

/**
 * @param {string} openid 管理员openid
 * @param {string} transitionId 订单id
 * @param {{}} query // 查询额外条件
 * @param {string} transition 状态
 */
transitionRoute.post("/", async (ctx, next) => {
    const req = ctx.request.body || {};
    if (hasProperties(req, ["openid", "transitionId", "transition"])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "admin") {
            const itemsCollection = await getCollection(ctx, "items");
            if (!isObject(req.query)) {
                req.query = {};
            }
            itemsCollection.updateMany({
                transitionId: req.transitionId,
                ...req.query
            }, {
                $set: objectToMongoUpdateSchema(req.transition)
            })


            ctx.body = {
                code: 200,
                msg: "订单状态已更新"
            }
            logger.info(`管理员更新了订单 ${req.transitionId} 的数据为 ${req.transition}`);
        } else {
            ctx.body = {
                code: 400,
                msg: "您没有权限访问该接口"
            }
            ctx.status = 400;
            logger.warn(`非管理员用户 ${req.openid} 尝试更新了订单 ${req.transitionId} 数据为 ${req.transition}`);
        }
    } else {
        ctx.body = {
            code: 400,
            msg: "您缺少 openid, transitionId, transition 参数"
        }
        ctx.status = 400;
    }
    await next();
})



export default transitionRoute