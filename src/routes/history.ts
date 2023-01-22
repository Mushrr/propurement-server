import { hasProperties, extractObject, timePlus, Week } from '@utils/base';
import { getCollection } from '@utils/fetchTools';
// 获得历史订单数据


import Route from "koa-router"



const historyRoute = new Route();

/**
 * 
 * @param {string} openid 用户的openid
 * @param {number} pageSize
 * @param {number} page
 */
historyRoute.get("/", async (ctx, next) => {
    const req = ctx.request.query || {};

    if (hasProperties(req, ["openid"])) {
        const openid = req.openid as string;
        const userCollection = await getCollection(ctx, "items");
        const query = extractObject(req, ["openid", "page", "pageSize"]);
        const allUserCursor = userCollection.find({
            openid: openid,
            lastModified: {
                $lte: timePlus(new Date(), Week),
            },
            ...query
        });
        const userData = [];
        const page: number = req.page as number | undefined || 0;
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
            msg: "您缺少 openid 参数"
        }
        ctx.status = 400;
    }
    await next();
})

export default historyRoute;