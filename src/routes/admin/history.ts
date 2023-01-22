import logger from '@utils/logger';
import { AnyObject } from '@locTypes/base';
import { extractObject, timeValid, hasProperties, isSuperAdmin } from '@utils/base';
import { validateUser, getCollection } from '@utils/fetchTools';
// history data
import Route from 'koa-router';


const historyRoute = new Route();


historyRoute.get('/', async (ctx, next) => {
    const req = ctx.request.query || {};

    if (hasProperties(req, ['openid'])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === 'admin') {
            const itemsCollection = await getCollection(ctx, 'items');
            // userOpenid, state(finished), page, pageSize
            const page = req.page as number | undefined || 1;
            const pageSize = req.pageSize as number | undefined || 10;
            const query: AnyObject = extractObject(req, ['userOpenid', 'state', 'page', 'pageSize', 'openid', 'start', 'end']);
            if (req.userOpenid) {
                query['openid'] = req.userOpenid;
            }
            query['lastModified'] = {};
            if (req.start && timeValid(req.start as string)) {
                query['lastModified'] = {
                    $gte: new Date(req.start as string)
                }
            } else {
                query['lastModified'].$gte = new Date();
            }

            if (req.end && timeValid(req.start as string)) {
                query['lastModified'].$lte = new Date(req.end as string);
            }

            query.state = req.state as string || 'finished';

            if (hasProperties(query, ['isFree'])) {
                query.isFree = query.isFree === "true" || false
            }

            let ind = 0;
            const start = (page - 1) * pageSize;
            const end = page * pageSize;
            const cursor = itemsCollection.find(query);

            console.log(query);

            const itemsData = [];
            for await (const item of cursor) {
                if (ind >= start) {
                    itemsData.push(item);
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
        } else {
            ctx.body = {
                code: 403,
                msg: '您没有权限访问该页面'
            }
            ctx.status = 403;
        }
    } else {
        ctx.body = {
            code: 400,
            msg: '您缺少 openid 参数'
        }
        ctx.status = 400;
    }
    await next();
})


// 删除 items

historyRoute.del('/', async (ctx, next) => {
    const req = ctx.request.query || {};
    if (hasProperties(req, ['openid', 'uuid', 'transitionId', 'userOpenid'])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "admin" || isSuperAdmin(req.openid as string)) {
            const itemsCollection = await getCollection(ctx, 'items');

            const data = await itemsCollection.findOneAndDelete({
                openid: req.userOpenid,
                uuid: req.uuid,
                transitionId: req.transitionId
            })

            if (data.ok) {
                ctx.body = {
                    code: 200,
                    message: "删除成功",
                }
                logger.info("管理员删除订单成功!");
            } else {
                ctx.body = {
                    code: 404,
                    message: "未发现此订单项目"
                }
            }
        } else {
            ctx.body = {
                code: 400,
                message: "您并非管理员，无法尝试删除items"
            }
            ctx.status = 400;
            logger.info(`${ctx.ip} 正在尝试越权删除物品`);
        }
    } else {
        ctx.body = {
            code: 500,
            message: "缺少openid，uuid，transitionId和userOpenid",
        }
        logger.error(`${ctx.ip} 并未提供必要信息`);
        ctx.status = 500;
    }

    await next();
})

export default historyRoute;