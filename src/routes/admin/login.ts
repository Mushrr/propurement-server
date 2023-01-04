import { getCollection } from '@utils/fetchTools';
import { Db } from 'mongodb';
import { hasProperties } from '@utils/base';
// admin login

import Route from 'koa-router'

const adminLoginRoute = new Route();

adminLoginRoute.post("/", async (ctx, next) => {
    const req = ctx.request.body || {};
    const userCollection = await getCollection(ctx, 'user'); 
    if (hasProperties(req, ["username", "password"])) {
        if (req.username === process.env.ADMIN_USERNAME && req.password === process.env.ADMIN_PASSWORD) {
            const userData = await userCollection.findOne({
                openid: process.env.ADMIN_OPENID
            })
            ctx.body = {
                code: 200,
                msg: "登录成功",
                data: userData
            }

        } else {
            ctx.body = {
                code: 400,
                msg: "用户名或密码错误"
            }
            ctx.status = 400;
        }
    } else {
        ctx.body = {
            code: 400,
            msg: "您缺少 username 或 password 参数"
        }
        ctx.status = 400;
    }
})

export default adminLoginRoute;