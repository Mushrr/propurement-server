import { Timestamp } from 'mongodb';
import { extractObject, hasProperties, objectToMongoUpdateSchema, objectStringSchema } from '@utils/base';
import { Db } from 'mongodb';
// 管理员商品页面
import Route from "koa-router";
import { PropurementInfo } from "@locTypes/propurement"
import logger from '@utils/logger';
import { v4 as uuidv4 } from 'uuid'

const adminPropurementRoute = new Route();

/**
 * 查询所有物品
 * @param openid 管理员openid
 * @param page 页
 * @param pageSize 单页的大小
 * @param query 其他查询参数 比方说 category 可以指定 物品类别查询 ...
 */
adminPropurementRoute.get("/", async (ctx, next) => {
    const db = ctx.state.db as Db;
    const propurementCollection = db.collection("propurement");
    const req = ctx.request.query || {};
    if (hasProperties(req, ["openid"])) {
        if (process.env.ADMIN_OPENID === req.openid) {
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
        } else {
            ctx.body = {
                code: 400,
                message: "您未拥有管理员权限，请重试!"
            }
            ctx.status = 400;
            logger.warn(`用户 ${req.openid} 正在尝试越权获取物品信息!`);
        }

    } else {
        ctx.body = {
            code: 400,
            message: "您未传入 管理员认证信息，请核实后重试!"
        }
        ctx.status = 400;
        logger.warn("物品添获取失败，原因：用户未通过身份认证！！");
    }

    await next();
})

/**
 * @param openid 管理员的openid
 * @param eventType “add" | ”change“ 事件类型
 * @param propurement 如果是 add 则需要提供 name price category 如果是 change 则需要提供 uuid
 */
adminPropurementRoute.post("/", async (ctx, next) => {
    const db = ctx.state.db as Db;
    const propurementCollection = db.collection("propurement");
    const req = ctx.request.body || {};
    if (hasProperties(req, ["openid"])) {
        if (req.openid === process.env.ADMIN_OPENID) {
            if (req.eventType === "add") {
                const propurementErrorHandler = (addtionalInfo = "") => {
                    ctx.body = {
                        code: 500,
                        message: "未含有 propurement 必要的相关信息!! " + addtionalInfo
                    }
                    ctx.status = 500;
                    logger.warn(`${ctx.body.message}`);
                }
                if (hasProperties(req, ["propurement"])) {
                    const propurement = req.propurement as PropurementInfo;
                    if (hasProperties(propurement, ["name", "defaultUnits", "category"])) {
                        const excludePropurement = extractObject(propurement, ["name", "uuid", "defaultUnits", "category"]);
                        const propurementSchema = {
                            uuid: uuidv4(),
                            name: propurement.name,
                            defaultUnits: propurement.defaultUnits,
                            category: propurement.category, // 上述都是必要信息, 必须得填的
                            ...excludePropurement, //  其他信息
                            lastChange: Timestamp.fromNumber(new Date().valueOf())
                        }
                        const insertAns = await propurementCollection.insertOne(propurementSchema);

                        logger.info(`[${propurementSchema.name} | ${propurement.defaultUnits.join("|")}] 添加成功!`);

                        ctx.body = {
                            code: 200,
                            propurement: await propurementCollection.findOne({ uuid: propurementSchema.uuid })
                        }
                    } else {
                        propurementErrorHandler(" name defaultPrice category");
                    }
                } else {
                    propurementErrorHandler("propurement");
                }
            } else if (req.eventType === "change") {
                const changeErrorHandler = (addtionalInfo = "") => {
                    ctx.body = {
                        code: 500,
                        message: "修改物品错误 " + addtionalInfo
                    }
                    ctx.status = 500;
                    logger.warn(`${ctx.body.message}`)
                }
                if (hasProperties(req, ["propurement"])) {
                    const propurement = req.propurement as PropurementInfo;
                    const changeFlatten = objectToMongoUpdateSchema(propurement, undefined, ["detailPage"]);
                    changeFlatten.lastChange = Timestamp.fromNumber(new Date().valueOf()); // 时间修改
                    const updateAns = propurementCollection.findOneAndUpdate(
                        { uuid: propurement.uuid },
                        {
                            $set: changeFlatten
                        }
                    )
                    updateAns.then(res => {
                        if (res.ok) {
                            logger.info(`${propurement.name} 修改成功 ${objectStringSchema(changeFlatten)}`);
                        } else {
                            logger.error(`${propurement.name} 修改失败 mongodb 出现错误!!`);
                        }
                    }).catch(err => {
                        logger.error(`${propurement.name} 修改失败 mongodb 出现错误!!`);
                        throw err;
                    })

                    ctx.body = {
                        code: 200,
                        message: `${propurement.name} 修改成功`,
                        propurement: await propurementCollection.findOne({ uuid: propurement.uuid })
                    }
                    ctx.status = 200;

                } else {
                    changeErrorHandler("缺少propurement");
                }
            } else {
                ctx.body = {
                    code: 500,
                    message: "未定义的eventType, 只能是 [ add | change ]"
                }
                ctx.status = 500;
            }
        } else {
            ctx.body = {
                code: 400,
                message: "您未拥有管理员权限，请重试!"
            }
            ctx.status = 400;
            logger.warn(`用户 ${req.openid} 正在尝试越权修改物品信息!`);
        }

    } else {
        ctx.body = {
            code: 400,
            message: "您未传入 管理员认证信息，请核实后重试!"
        }
        ctx.status = 400;
        logger.warn("物品添加或者修改失败，原因：用户未通过身份认证！！");
    }

    await next();
})

/**
 * 删除物品
 * @param openid 管理员openid
 * @param uuid 物品uuid
 */
adminPropurementRoute.del("/", async (ctx, next) => {
    const db = ctx.state.db as Db;
    const propurementCollection = db.collection("propurement");
    const req = ctx.request.query || {};
    if (hasProperties(req, ["openid"])) {
        if (process.env.ADMIN_OPENID === req.openid) {
            if (hasProperties(req, ["uuid"])) {
                const ifExist = await propurementCollection.findOne({ uuid: req.uuid });
                if (!ifExist) {
                    ctx.body = {
                        code: 404,
                        message: `未找到 ${req.uuid} 表示的物品`
                    }
                    ctx.status = 404;
                    logger.warn(`${ctx.body.message}`);
                } else {
                    propurementCollection.deleteOne({ uuid: req.uuid });
                    ctx.body = {
                        code: 200,
                        message: `删除 ${ifExist.name} 物品 成功`
                    }
                    logger.info(`${ctx.body.message}`);
                }
            } else {
                ctx.body = {
                    code: 500,
                    message: "您未传入物品的UUID 无法删除"
                }    
                ctx.status = 500;
                logger.warn(`未传入物品UUID 无法删除!!`)
            }
        } else {
            ctx.body = {
                code: 400,
                message: "您未拥有管理员权限，请重试!"
            }
            ctx.status = 400;
            logger.warn(`用户 ${req.openid} 正在尝试越权删除物品信息!`);
        }

    } else {
        ctx.body = {
            code: 400,
            message: "您未传入 管理员认证信息，请核实后重试!"
        }
        ctx.status = 400;
        logger.warn("物品删除失败，原因：用户未通过身份认证！！");
    }

    await next();
})

export default adminPropurementRoute;