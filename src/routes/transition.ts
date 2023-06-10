import logger from '@utils/logger';
import { validateUser, getCollection } from '@utils/fetchTools';
import { hasProperties } from '@utils/base';
// 用户最后确认的路由

import Route from 'koa-router';

const transitionRoute = new Route();

/**
 * 查询当前用户的历史信息
 * @param { string } openid 用户的openid
 */
transitionRoute.get('/', async (ctx, next) => {
    const req = ctx.request.query || {};

    if (hasProperties(req, ["openid"])) {
        const { openid } = req;
        const userValidate = validateUser(openid as string, ctx);
        const itemCollection = getCollection(ctx, 'items');
        if ((await userValidate) === 'user') {
            // 如果是用户才能获取自己的订单信息
            const data = await (await (await itemCollection).find({
                openid: openid,
                state: "distributing", // 正在配发的项目用户可以上线查看，确认是否收获完成。
            })).toArray();
            ctx.body = {
                code: 200,
                message: "获取订单信息成功",
                data
            }
            logger.info(`用户${openid}获取订单信息成功`);
        } else {
            ctx.body = {
                code: 400,
                message: "您不是用户，没有权限获取"
            },
                ctx.status = 400;
            logger.warn(`用户${openid}获取订单信息失败，不是用户`);
        }
    } else {
        ctx.body = {
            code: 500,
            message: "参数不正确,缺少用户凭证"
        },
            ctx.status = 500;
        logger.error(`用户获取订单信息失败，参数不正确`);
    }
    await next();
})

/**
 * 
 * @param { string } openid        用户的openid
 * @param { string } transitionId  用户的订单id
 * @param { string } uuid          物品UUID
 * @param { boolean } all          是否一键签约所有的
 */
transitionRoute.post('/', async (ctx, next) => {
    const req = ctx.request.body || {};
    if (hasProperties(req, ["openid", "transitionId", "uuid", "state"])) {
        const { openid, transitionId, uuid, state } = req;
        const userValidate = validateUser(openid as string, ctx);
        const itemCollection = getCollection(ctx, 'items');
        if ((await userValidate) === 'user') {
            // 如果是用户才能获取自己的订单信息
            if (state === "finished" || state === "user-refuse") {
                const ifExist = await (await itemCollection).findOne({
                    openid: openid,
                    transitionId: transitionId,
                    uuid: uuid
                })
                if (ifExist?._id) {
                    const data = (await itemCollection).updateOne({
                        openid: openid,
                        transitionId: transitionId,
                        uuid: uuid,
                    }, {
                        $set: {
                            state: state
                        }
                    });
                    ctx.body = {
                        code: 200,
                        message: "更新订单信息成功",
                        data
                    }
                    if (state === "finished") {
                        logger.info(`用户${openid}更新订单信息成功`);
                    } else {
                        logger.info(`用户${openid}拒绝收货 ${uuid} 成功`);
                    }
                } else {
                    ctx.body = {
                        code: 400,
                        message: "订单信息不存在"
                    },
                        ctx.status = 400;
                    logger.warn(`用户${openid}更新订单信息失败，订单信息不存在`);
                }
            } else {
                ctx.body = {
                    code: 500,
                    message: "状态只能是用户拒绝和完成"
                }
                ctx.status = 500;
            }


        } else {
            ctx.body = {
                code: 400,
                message: "您不是用户，没有权限获取"
            },
                ctx.status = 400;
            logger.warn(`用户${openid}获取订单信息失败，不是用户`);
        }
    } else if (hasProperties(req, ['openid', 'all'])) {
        const userValidate = validateUser(req.openid, ctx);
        if ((await userValidate) === "user") {
            const itemCollection = getCollection(ctx, 'items');
            const data = await (await itemCollection).updateMany({
                openid: req.openid,
                state: "distributing"
            }, {
                $set: {
                    state: "finished"
                }
            });
            ctx.body = {
                code: 200,
                message: "一键签收成功",
                data
            }
            logger.info(`用户${req.openid}一键签收成功`);
        } else {
            ctx.body = {
                code: 400,
                message: "您不是用户，没有权限获取"
            };
            ctx.status = 400;
            logger.warn(`用户${req.openid}一键签收失败，不是用户`);
        }
    } else {
        ctx.body = {
            code: 500,
            message: "参数不正确,缺少必要信息(openid, transitionId, uuid)"
        };
        ctx.status = 500;
    }

    await next();
})


export default transitionRoute;
