import { getCollection, validateUser } from '@utils/fetchTools';
import { hasProperties } from '@utils/base';
// 代理History

import Route from 'koa-router'

const agentHistoryRoute = new Route();


agentHistoryRoute.get('/', async (ctx, next) => {
    const req = ctx.request.query || {};
    if (hasProperties(req, ["openid"])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "agent") {
            const itemsCollection = await getCollection(ctx, "items");

            const items = await itemsCollection.find({
                agentOpenid: req.openid,
                state: req.state || "agent-accept"
            }).toArray();

            ctx.body = {
                code: 200,
                message: "获取成功",
                data: items
            }
        } else {
            ctx.body = {
                code: 400,
                message: "您没有权限查询!"
            }
            ctx.status = 400
        }
    } else {
        ctx.body = {
            code: 400,
            message: "您未提供必要的参数openid"
        }
        ctx.status = 400;
    }

    await next();
})

export default agentHistoryRoute;