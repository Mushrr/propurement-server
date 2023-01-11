import { validateUser, getCollection } from '@utils/fetchTools';
import { hasProperties, isSuperAdmin } from '@utils/base';
// 获取数据库中单选的数据项

import Route from 'koa-router';
import { ratioCollections } from 'config';


const ratioRoute = new Route();

ratioRoute.get('/', async (ctx, next) => {
    const req = ctx.request.query || {};
    if (hasProperties(req, ["openid", "ratio"])) {
        const userValidate = await validateUser(req.openid as string, ctx);
        if (userValidate === "agent" || userValidate === "user" ||
            userValidate === "admin" || isSuperAdmin(req.openid as string)) {
            const ratio = req.ratio as string;
            if (ratioCollections.indexOf(ratio) === -1) {
                ctx.body = {
                    code: 500,
                    message: "ratio 不存在!"
                }
                ctx.status = 500;
            } else {
                const ratioCollection = await getCollection(ctx, ratio as string);
                const ans = await ratioCollection.find({}).toArray();
                console.log(ans);
                ctx.body = {
                    code: 200,
                    data: ans
                }
            }
        } else {
            ctx.body = {
                code: 403,
                message: "没有权限"
            }
            ctx.status = 403;
        }
    } else {
        ctx.body = {
            code: 403,
            message: "参数错误，缺少openid或ratio"
        }
        ctx.status = 403;
    }
    await next();
})

export default ratioRoute;