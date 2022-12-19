import { UserType } from '@locTypes/user';
import { hasProperties, extractObject, objectToMongoUpdateSchema, objectStringSchema } from '@utils/base';
import { getUserType } from '@utils/fetchTools';
import logger from '@utils/logger';
import { UserItemDetail, PurchaseRecord } from '@locTypes/items'
// 用户能够对物品的操作
// 普通用户: 
// search: 搜索
// add: 添加
// delete: 删除

// 代理人: 
// search: 搜索, 局限于分配给他的物品
// change: 修改某个物品的价格，或者反馈一些信息回去, decline, accept

import Route from "koa-router";
import { Context } from 'koa';
import { Db } from 'mongodb';
import { AnyFunc } from '@locTypes/base';
import { isObject } from 'mushr';

const propurementRoute = new Route();


/**
 * 分权处理
 * @param queryBody 请求体
 * @param userHandler 普通用户的处理函数
 * @param adminHandler 管理员处理函数
 * @param agentHandler 代理人处理函数
 * @param callback 回调函数 允许传入ctx
 * @param ctx 上下文
 */

async function handler(
    queryBody: any, 
    userHandler: AnyFunc,
    adminHandler: AnyFunc,
    agentHandler: AnyFunc,
    ctx: Context,
    callback?: (ctx: Context) => any
) {
    const req = queryBody || {};
    if (hasProperties(req, ["openid"])) {
        const userType: UserType = await getUserType(ctx.state.db as Db, req.openid);
        switch (userType) {
            case "admin": {
                await userHandler(ctx);
                break;
            }
            case "user": {
                await adminHandler(ctx);
                break;
            }
            case "agent": {
                await agentHandler(ctx);
                break;
            }
            default: {
                ctx.body = {
                    code: 400,
                    message: "用户未通过身份认证, 您的身份不属于 admin, user, agent中的任何一个!"
                };
                ctx.status = 400;
                logger.warn(`用户 ${req.openid} 物品修改失败，原因：用户未通过身份认证！！`);
            }
        }
    } else {
        ctx.body = {
            code: 400,
            message: "缺少参数 openid"
        }
        ctx.status = 400;
        logger.warn("物品修改失败，原因：用户未通过身份认证！！");
    }
    if (callback) {
        return await callback(ctx);
    }
}

/**
 * 处理普通用户和管理员的搜索功能
 * @param ctx 上下文
 */
async function userSearchHandler(ctx: Context) {
    const db = ctx.state.db as Db;
    const propurementCollection = db.collection("propurement");
    const req = ctx.request.query || {};
    const query = extractObject(req, ["openid", "page", "pageSize"]);
    const propurementCursor = propurementCollection.find(
        query
    );
    const propurementData = [];
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
        for await (const propurement of propurementCursor) {
            if (ind >= start) {
                propurementData.push(propurement);
            }
            ind += 1;
            if (ind >= end) {
                break;
            }
        }
        ctx.body = {
            code: 200,
            message: "获取成功",
            data: propurementData
        }
    }
}

/**
 * 处理代理人的搜索功能
 * @param ctx 上下文
 */
async function agentSearchHandler(ctx: Context) {
    // TODO
    /**
     * 通过 状态和 代理人的openid 来查找所要处理的信息，代理人可以在返回的数据中自由筛选
     * 这些物品都会绑定uuid，代理人可以通过uuid直接修改价格，价格将会反馈在物品的agent price中
     * 代理人可以通过uuid来修改物品的状态，状态将会反馈在物品的 status 中
     * 同时代理人也可以反馈一些信息回来，这些信息将会反馈在物品的 message 中
     */
}

/**
 * 处理物品的搜索
 * @param {string} openid 用户的openid, 将会备用来查找用户的身份信息， 这个身份信息只能管理员更改
 * @param {number} page 页码
 * @param {number} pageSize 每页的数量
 * @param {string} query 其他搜索信息
 */
propurementRoute.get("/", async (ctx, next) => {

    await handler(
        ctx.request.query, 
        userSearchHandler, 
        userChangeHandler, 
        agentSearchHandler, 
        ctx
    );

    await next();
})

// OPENID + DEFAULT+UUID
// 物品的UUID + OPENID + number 

async function userChangeHandler(ctx: Context) {
    // TODO 用户是产生订单的，这些信息将即在一个临时订单号中，这个订单号将与购物车绑定。
    const db = ctx.state.db as Db;
    const itemsCollection = db.collection("items");
    const propurementCollection = db.collection("propurement");
    const userCollection = db.collection("user");
    const req = ctx.request.body || {};

    if (hasProperties(req, ["openid", "uuid", "detail"])) {
        const detail: UserItemDetail = isObject(req.detail) ? req.detail : {};
        
        const propurementExist = await propurementCollection.findOne({
            uuid: req.uuid,
        });
        const userExist = await userCollection.findOne({
            openid: req.openid,
        });

        if (propurementExist && userExist) {
            const purchaseRecord: PurchaseRecord = {
                uuid: req.uuid,
                openid: req.openid,
                transitionId: process.env.DEFAULT_ORDERID as string,
                number: detail.number || 1,
                unit: detail.unit || "个",
                userComment: detail.comment || "",
            }

            // upload
            const primaryKey = {
                uuid: req.uuid,
                openid: req.openid,
                transitionId: process.env.DEFAULT_ORDERID as string,
            };
            const result = await itemsCollection.findOne(primaryKey);

            if (result) {
                await itemsCollection.updateOne({
                    ...primaryKey,
                },{
                    $set: objectToMongoUpdateSchema(purchaseRecord)   
                })
                ctx.body = {
                    code: 200,
                    message: ` ${objectStringSchema(primaryKey)} 物品订单更新成功！`
                }
                logger.info(`${ctx.request.ip} 更新了一条订单记录!`);
            } else {
                await itemsCollection.insertOne({
                    ...purchaseRecord,
                })
                
                ctx.body = {
                    code: 200,
                    message: ` ${objectStringSchema(primaryKey)} 物品插入成功！`
                }
                logger.info(`${ctx.request.ip} 添加了一条订单记录!`);
            }

            
        } else {
            ctx.body = {
                code: 500,
                message: "订单不存在或者用户不存在！"
            }
            ctx.status = 500;
            logger.warn(`${ctx.request.ip} 尝试使用一个不存在的 openid 请求!`);
        }
    } else {
        ctx.body = {
            code: 500,
            message: "请指出您的openid、物品的uuid和物品的详细信息！"
        }
        ctx.status = 500;
        logger.warn(`${ctx.request.ip} 出现非法请求!`);
    }
}

async function agentChangeHandler(ctx: Context) {
    // TODO 代理获取到分配的订单之后，需要处理订单，产生报价，修改订单状态，反馈意见。
}

/**
 * 
 */
propurementRoute.post("/", async (ctx, next) => {

    await handler(
        ctx.request.body,
        userChangeHandler,
        userChangeHandler,
        agentChangeHandler,
        ctx,        
    )

    await next();
})

export default propurementRoute;