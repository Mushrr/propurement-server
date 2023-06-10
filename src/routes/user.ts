import { extractObject, isSuperAdmin, objectToMongoUpdateSchema, timePlus, Week } from '@utils/base';
import { Db } from 'mongodb';
import { Context } from 'koa';
// User Route
import Router from "koa-router";
import { hasProperties } from '../utils/base';
import logger from '@utils/logger';
import { v4 } from 'uuid';


interface WxUserInfo {
    openid: string;
    session_key: string;
}

/**
 * 如果用户完全未登录过，则会构造一个用户默认的信息
 * 如果用户登录过且session_key有效，则会返回用户的信息
 * 如果用户session_key过期，则修改session_key，返回用户的信息
 */

const userRoute: Router = new Router();

userRoute.post("/", async (ctx: Context, next) => {
    // UserInfo
    const mongo = ctx.state.db as Db;
    const userCollection = mongo.collection("user");

    if (hasProperties(ctx.request.body, ["session_key"])) {
        // 返回
        // 目前微信小程序已经不需要获取用户的个人信息了，可以直接通过open-data获得
        const session_key = ctx.request.body.session_key;
        const data = await userCollection.findOne({
            "principals": {
                $elemMatch: {
                    "session_key": session_key,
                }
            }
        });


        if (data) {

            const ans = extractObject(data, ["principals"]);
            let expired = false;
            for (const pair of data.principals) {
                console.log(pair);
                if (session_key === pair.session_key) {
                    ans.userInfo = pair
                    expired = new Date(pair.expired).getTime() < Date.now();
                }
            }
            if (expired) {
                // session 过期
                ctx.body = {
                    code: 400,
                    msg: "session_key 过期",
                    data: null
                };
                ctx.status = 400
                logger.warn("用户的session_key: " + session_key + "已经过期");
            } else {
                ctx.body = {
                    code: 200,
                    msg: "session_key 登入成功",
                    data: ans
                }
                logger.info("用户登入 获取到的session_key为: " + session_key);
            }
        } else {
            // session 过期
            ctx.body = {
                code: 400,
                msg: "session_key 不存在",
                data: null
            };
            ctx.status = 400
            logger.warn("用户的session_key: " + session_key + "不存在");
        }


    } else if (hasProperties(ctx.request.body, ["phone", "password"])) {

        await userCollection.findOneAndUpdate({
            "principals": {
                $elemMatch: {
                    "phone": ctx.request.body.phone,
                    "password": ctx.request.body.password
                }
            }
        }, {
            $set: {
                // 生成一个sessionkey
                "principals.$.session_key": v4(),
                "principals.$.expired": timePlus(new Date(), Week).toISOString()
            }
        })

        const data = await userCollection.findOne({
            "principals": {
                $elemMatch: {
                    "phone": ctx.request.body.phone,
                    "password": ctx.request.body.password
                }
            }
        })

        if (data?._id) {

            const ans = extractObject(data, ["principals"]);

            for (const pair of data.principals) {
                if (pair.phone === ctx.request.body.phone &&
                    pair.password === ctx.request.body.password) {
                    ans.userInfo = pair
                }
            }

            ctx.body = {
                code: 200,
                message: "登录成功",
                data: ans
            }
        } else {
            ctx.body = {
                code: 404,
                message: "您的账户不存在，请联系管理员"
            };
            ctx.status = 404;
        }

    } else {
        ctx.body = {
            code: 400,
            msg: "缺少必要参数, 请传入session_key或者code"
        }
        logger.warn("用户登入失败, 缺少必要参数, 请传入session_key或者code");
        ctx.status = 400;
    }
    await next();
})



export default userRoute;