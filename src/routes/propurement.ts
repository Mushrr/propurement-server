import { UserType } from '@locTypes/user';
import { hasProperties, extractObject, objectToMongoUpdateSchema, objectStringSchema } from '@utils/base';
import { getCollection, getUserType, validateTransition, validateUser } from '@utils/fetchTools';
import logger from '@utils/logger';
import { UserItemDetail, PurchaseRecord, AgentItemDetail } from '@locTypes/items'
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
import { isNumber, isObject, isString } from 'mushr';
import { agentStates } from 'config';

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
                await userHandler(ctx);
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
    const finalQuery = extractObject(query, ['category', 'unit', 'uuid[]']);
    logger.info(JSON.stringify(finalQuery));
    if (query.category) {
        finalQuery.category = {
            $elemMatch: {
                $eq: query.category
            }
        }
    }

    if (query.name) {
        finalQuery.name = {
            $regex: new RegExp(`.*${query.name}.*`)
        }
    }
    
    if (hasProperties(query, ['uuid[]'])) {
        if (isString(query['uuid[]'])) {
            query['uuid[]'] = [query['uuid[]'] as string]
        }
        logger.info(JSON.stringify(query['uuid[]']))
        finalQuery.uuid = {
            $in: query['uuid[]']
        }
        const data = await propurementCollection.find(finalQuery).toArray();
        ctx.body = {
            code: 200,
            message: "获取物品信息成功",
            data: data
        }
    } else {
        const propurementCursor = propurementCollection.find(
            finalQuery
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

    const itemsCollection = await getCollection(ctx, "items");
    const req = ctx.request.query || {};

    if (hasProperties(req, ["openid"]) && isString(req.openid)) {
        const isUserValidate = await validateUser(req.openid as string, ctx);
        if (isUserValidate === "agent") {
            const data = []
            const queryObj: Record<string, string> = {
                agentOpenid: req.openid as string,
            }

            if (req.state && req.state !== "") {
                queryObj["state"] = req.state as string
            } else if (req.state === "") {
                queryObj["state"] = {
                    $in: ["agent-accept", "waiting", "agent-refuse", "distributing"]
                }
            }

            if (req.transitionId && req.transitionId !== "") {
                queryObj["transitionId"] = req.transitionId as string
            }

            const cursor = itemsCollection.find(queryObj)

            for await (const item of cursor) {
                data.push(item)
            }
            ctx.body = {
                code: 200,
                message: "获取订单信息成功!",
                data: data || []
            }
        }
    } else {
        ctx.body = {
            code: 400,
            message: `获取订单错误!!!您身份有误 ${ctx.ip}`
        }
        ctx.status = 400
        logger.warn(`${ctx.ip} 正在尝试越权 访问代理信息`);
    }
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
/**
 * 
 * @param {string} openid 用户openid
 * @param {string} uuid 用户物品信息
 * @param {{
 *      unit: string,
 *      price: number,
 *      comment: string
 * }}  comment 评论信息
 */

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
            console.log(req);
            const purchaseRecord: PurchaseRecord = {
                uuid: req.uuid,
                openid: req.openid,
                transitionId: process.env.DEFAULT_ORDERID as string,
                propurename: req.propurename || "", 
                number: detail.number,
                unit: detail.unit || "个",
                userComment: detail.comment || "",
                state: "uncommitted",
                isFree: false // 默认是false，并非是免配送的
            }
            if (detail.isFree) {
                purchaseRecord.isFree = Boolean(detail.isFree);
            }


            // upload
            const primaryKey = {
                uuid: req.uuid,
                openid: req.openid,
                transitionId: process.env.DEFAULT_ORDERID as string,
            };
            const result = await itemsCollection.findOne(primaryKey);

            if (result) {
                if (purchaseRecord.number === 0) {
                    await itemsCollection.deleteOne(primaryKey); // 删除记录
                    logger.info(`${ctx.request.ip} 删除了一条订单记录!`);
                } else {
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
                }
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


// agentID, uuid
// 状态 + 代理人 + transitionId + UUID
// 在分配给当前代理人的待处理订单中找到自己的订单，然后处理更新订单中的UUID，给出自己的detail
// openid + transition + uuid + detail
/**
 * 
 * @param {string} openid openid
 * @param {string} uuid 物品唯一编码
 * @param {string} transitionId 交易编码
 * @param {"waiting" | "agent-accept" | "agent-refuse"} state 状态修改
 * @param {{
 *      unit: string,
 *      number: number,
 *      price: number,
 *      comment: string
 * }} detail 详细信息
 */
async function agentChangeHandler(ctx: Context) {
    // TODO 代理获取到分配的订单之后，需要处理订单，产生报价，修改订单状态，反馈意见。
    const db = ctx.state.db as Db;
    const itemsCollection = db.collection("items");
    const propurementCollection = db.collection("propurement");
    const req = ctx.request.body || {};

    if (hasProperties(req, ["openid", "uuid", "transitionId", "detail", "state"])) {
        const isUserValidate = await validateUser(req.openid, ctx);
        if (agentStates.indexOf(req.state) > -1) {
            if (isUserValidate) {
                const transitionField = {
                    transitionId: req.transitionId,
                    uuid: req.uuid,
                    agentOpenid: req.openid
                };
                const transitionValidate = await validateTransition(transitionField, ctx);
    
                if (transitionValidate) {
                    const agentReqDetail: AgentItemDetail = req.detail;
                    console.log(agentReqDetail);
                    if (isNumber(agentReqDetail.number) && isNumber(agentReqDetail.price)) {
                        
                        // 1, 更新当前物品信息  
                        const ans = await itemsCollection.findOneAndUpdate(transitionField, {
                            $set: objectToMongoUpdateSchema({
                                agentDetail: agentReqDetail,
                                state: req.state,
                                number: agentReqDetail.number,
                                unit: agentReqDetail.unit
                            })
                        })
                        if (ans.ok) {
                            ctx.body = {
                                code: 200,
                                message: `对 ${req.uuid} 的修改成功`
                            }
                            logger.info(`代理 ${req.openid} 完成了 对 ${req.uuid} 的修改`);
    
    
                            //2. 修改 物品的代理人报价
    
                            const ifExist = await (await propurementCollection).findOne({
                                uuid: req.uuid,
                                "agentPrice.agent": {
                                    // 数组元素匹配的时候需要使用 $elemMatch
                                    $elemMatch: {
                                        agent: req.openid,
                                        unit: agentReqDetail.unit
                                    }
                                }
                            })
                            console.log(ifExist);
                            if (ifExist) {
                                logger.info("发现此价格，正在修改")
                                const updateRes = await (await propurementCollection).updateOne({
                                    uuid: req.uuid,
                                    "agentPrice.agent": {
                                        $elemMatch: {
                                            agent: req.openid,
                                            unit: agentReqDetail.unit
                                        }
                                    }
                                }, {
                                    $set: {
                                        "agentPrice.agent.$.price": agentReqDetail.price
                                    }
                                })
                                if (updateRes.modifiedCount > 0) {
                                    ctx.body = {
                                        code: 200,
                                        message: "修改成功"
                                    }
                                } else {
                                    ctx.body = {
                                        code: 500,
                                        message: "修改失败"
                                    }
                                }
                            } else {
                                logger.info("没有发现此数据，正在添加")
                                const updateRes = await (await propurementCollection).updateOne({
                                    uuid: req.uuid
                                }, {
                                    $push: {
                                        "agentPrice.agent": {
                                            agent: req.openid,
                                            price: agentReqDetail.price,
                                            unit: agentReqDetail.unit
                                        }
                                    }
                                })
                                if (updateRes.modifiedCount > 0) {
                                    ctx.body = {
                                        code: 200,
                                        message: "添加成功"
                                    }
                                } else {
                                    ctx.body = {
                                        code: 500,
                                        message: "添加失败"
                                    }
                                }
                            }
    
                        } else {
                            ctx.body = {
                                code: 500,
                                message: "后台出现错误"
                            }
                            ctx.status = 500
                            logger.error("代理修改物品失败，可能是后台数据库出现错误，运行异常!");
                        }
                    } else {
                        ctx.body = {
                            code: 500,
                            message: "agentPrice和number的数据格式不对!"
                        }
                        logger.warn(`代理 ${req.openid} 上传了一个错误的请求 数据格式不对`)
                    }
    
                } else {
                    ctx.body = {
                        code: 404,
                        message: "未找到您需要的记录"
                    }
                    ctx.status = 404;
                    logger.warn(`代理 ${req.openid} 未找到对应的记录`)
                }
    
            } else {
                ctx.body = {
                    code: 400,
                    message: "用户非法，请确认身份后访问"
                }
                ctx.status = 400;
            }
        } else {
            logger.warn(`${ctx.ip} ${req.openid} 正在越权修改订单状态!!`);
            ctx.body = {
                code: 400,
                message: `${req.openid} 您正在越权访问，请向管理员申诉以获得相应权限`
            }
            ctx.status = 400
        }
    } else {
        ctx.body = {
            code: 500,
            message: "缺少必要元素: openid, uuid, transitionId, detail"
        }
        ctx.status = 500;
    }
}

/**
 * 处理用户对单个订单的操作, 第一次插入订单，第二次修改订单🐼
 * @param {string} openid 用户的openid, 将会备用来查找用户的身份信息， 这个身份信息只能管理员更改
 * @param {string} uuid 物品的uuid
 * @param {UserItemDetail} detail 物品的详细信息: number, unit, comment
 * @return 是否插入成功
 * @description 用户将会在这里插入订单，这个订单将会在购物车中，等待代理的处理, 如果不是则直接更新订单
 */
propurementRoute.post("/", async (ctx, next) => {
    console.log(ctx.request.body);
    await handler(
        ctx.request.body,
        userChangeHandler,
        userChangeHandler,
        agentChangeHandler,
        ctx,        
    )

    await next();
})

/**
 * 从购物车中删除
 * @param {string} uuid,
 * @param {string} openid,
 */
propurementRoute.del("/", async (ctx, next) => {
    const req = ctx.request.query || {};
    const itemCollection = await getCollection(ctx, "items");
    if (req.openid && req.uuid) {
        // 1. 删除订单
        const ans = await itemCollection.findOneAndDelete({
            uuid: req.uuid,
            openid: req.openid,
            transitionId: process.env.DEFAULT_ORDERID
        })
        if (ans.ok) {
            ctx.body = {
                code: 200,
                message: `对 ${req.uuid} 的删除操作成功`
            }
            logger.info(`用户 ${req.openid} 完成了 对 ${req.uuid} 的删除`);
        } else {
            ctx.body = {
                code: 500,
                message: "后台出现错误"
            }
            ctx.status = 500
            logger.error("用户删除物品失败，可能是后台数据库出现错误，运行异常!");
        }
    }

    await next()
})

export default propurementRoute;
