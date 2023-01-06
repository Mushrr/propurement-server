import logger from '@utils/logger';
import { getCollection, validateUser } from '@utils/fetchTools';
import { hasProperties, extractObject } from '@utils/base';
// 获取价格的路由

import Route from 'koa-router';

const priceRoute = new Route();

// 查物品，继而查询价格

priceRoute.get("/", async (ctx, next) => {
    const req = ctx.request.query || {};
    const propurementCollection = getCollection(ctx, 'propurement');
    if (hasProperties(req, ["page", "pageSize", "openid"])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        const query = extractObject(req, ["page", "pageSize", "openid"]);
        const page: number = req.page as number | undefined || 1;
        const pageSize: number = req.pageSize as number | undefined || 10;
        const cursor = (await propurementCollection).find({
            ...query
        })
        const data = [];
        let ind = 0;
        for await (const propure of cursor) {
            if (ind >= (page - 1) * pageSize) {
                data.push(propure);
            }
            ind += 1;
            if (ind >= (page) * pageSize) {
                break;
            }
        }
        const priceData = [];
        for (const propure of data) {
            const dataSchema = {
                id: propure._id,
                uuid: propure.uuid,
                name: propure.name,
                defaultUnits: propure.defaultUnits,
                category: propure.category,
                lastPrice: []
            }
            try {
                switch(userValidate) {
                    case "user": {
                        if (propure.userPrice && Array.isArray(propure.userPrice.user)) {
                            for (const price of propure.userPrice.user) {
                                if (price.openid === req.openid) {
                                    dataSchema.lastPrice.push(price);
                                }
                            }
                        }
                        break;
                    }
                    case "admin": {
                        if (propure.userPrice && Array.isArray(propure.agentPrice.agent)) {
                            for (const price of propure.agentPrice.agent) {
                                if (price.agent === req.openid) {
                                    dataSchema.lastPrice.push(price);
                                }
                            }
                        }
                        if (propure.userPrice && Array.isArray(propure.userPrice.user)) {
                            for (const price of propure.userPrice.user) {
                                if (price.openid === req.openid) {
                                    dataSchema.lastPrice.push(price);
                                }
                            }
                        }
                        break;
                    }
                    case "agent": {
                        if (propure.userPrice && Array.isArray(propure.agentPrice.agent)) {
                            for (const price of propure.agentPrice.agent) {
                                if (price.agent === req.openid) {
                                    dataSchema.lastPrice.push(price);
                                }
                            }
                        }
                        break;
                    }
                    default: {
                        dataSchema.lastPrice = []
                        break;
                    }
                }
            } catch (err) {
                dataSchema.lastPrice = [];
            }
            priceData.push(dataSchema);
        }
        ctx.body = {
            code: 200,
            message: "获取成功",
            data: priceData
        }
    } else {
        ctx.body = {
            code: 500,
            message: "缺少参数page, pageSize, Openid",
        }
        ctx.status = 500;
    }
    await next();
})


priceRoute.post('/', async (ctx, next) => {
    const req = ctx.request.body || {};
    const propurementCollection = getCollection(ctx, 'propurement');
    if (hasProperties(req, ["openid", "uuid", "price", "unit"])) {
        // 先找找看有没有，没有的话就添加一个进去
        const ifExist = await (await propurementCollection).findOne({
            uuid: req.uuid,
            "userPrice.user": {
                // 数组元素匹配的时候需要使用 $elemMatch
                $elemMatch: {
                    openid: req.openid,
                    unit: req.unit
                }
            }
        })
        console.log(ifExist);
        if (ifExist) {
            logger.info("发现此价格，正在修改")
            const updateRes = await (await propurementCollection).updateOne({
                uuid: req.uuid,
                "userPrice.user": {
                    $elemMatch: {
                        openid: req.openid,
                        unit: req.unit
                    }
                }
            }, {
                $set: {
                    "userPrice.user.$.price": req.price
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
                    "userPrice.user": {
                        openid: req.openid,
                        price: req.price,
                        unit: req.unit
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
            message: "缺少参数 openid, uuid, price, unit"
        }
        ctx.status = 500;
    }

    await next();
})



export default priceRoute;
