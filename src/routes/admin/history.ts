import { AnyObject } from '@locTypes/base';
import { extractObject, timeValid, hasProperties } from '@utils/base';
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

export default historyRoute;