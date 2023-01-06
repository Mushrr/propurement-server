import { objectToMongoUpdateSchema } from '@utils/base';
import { Db } from 'mongodb';
import { Context } from 'koa';
// User Route
import Router from "koa-router";
import { hasProperties } from '../utils/base';
import { getWxUserOpenid } from '../utils/fetchTools';
import logger from '@utils/logger';
import { UserInfo } from "@locTypes/user"


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

userRoute.post("/", async (ctx: Context) => {
    // UserInfo
    const mongo = ctx.state.db as Db;
    const userCollection = mongo.collection("user");

    if (hasProperties(ctx.request.body, ["session_key"])) {
        // 返回
        // 目前微信小程序已经不需要获取用户的个人信息了，可以直接通过open-data获得
        const session_key = ctx.request.body.session_key;
        const data = await userCollection.findOne({ session_key: session_key });
        if (data) {
            ctx.body = {
                code: 200,
                msg: "session_key 登入成功",
                data
            }
        } else {
            // session 过期
            ctx.body = {
                code: 400,
                msg: "session_key 过期",
                data: null
            };
            ctx.status = 400
        }

        logger.info("用户登入 获取到的session_key为: " + session_key);
    } else if (hasProperties(ctx.request.body, ["code"])) {
        console.log(ctx.request.body.code);
        // 依据code 获取 openid
        const wxUserInfo = await getWxUserOpenid(ctx.request.body.code) as WxUserInfo;
        logger.info("有新用户登入 获取到的openid为: " + wxUserInfo.openid);
        logger.info("有新用户登入 获取到的session_key为: " + wxUserInfo.session_key);

        // 保存用户信息

        if (!await userCollection.findOne({ openid: wxUserInfo.openid })) {
            // 用户schema
            const userInfo: UserInfo = {
                openid: wxUserInfo.openid,
                session_key: wxUserInfo.session_key,
                user_type: "unknown", // 还待验证!!!!, 后期根据这个区分不同的用户
                organization: {
                    company: "unknown",
                    department: "unknown",
                    position: "unknown",
                    phone_number: "unknown",
                    principal: "unknown"
                }
            }
            // 不存在用户信息, 则插入
            userCollection.insertOne(userInfo); // 不需要阻塞
        } else {
            userCollection.findOneAndUpdate({ openid: wxUserInfo.openid }, {
                $set: { session_key: wxUserInfo.session_key }
            }); // 不需要阻塞
        }
        const data = await userCollection.findOne({ openid: wxUserInfo.openid });
        ctx.body = {
            code: 200,
            msg: "code 登入成功",
            data
        };
        // 保存用户信息

    } else if (hasProperties(ctx.request.body, ["userInfo", "update"])) {
        const wxUserInfo: UserInfo = objectToMongoUpdateSchema(ctx.request.body.userInfo);
        if (ctx.request.body.update) {
            // 更新用户信息
            userCollection.findOneAndUpdate(
                { openid: wxUserInfo.openid },
                { $set: wxUserInfo }, // 更新UserInfo信息
            )
            ctx.body = {
                code: 200,
                msg: "更新用户信息成功",
                data: wxUserInfo
            }
        }
    } else {
        ctx.body = {
            code: 400,
            msg: "缺少必要参数, 请传入session_key或者code"
        }
        logger.warn("用户登入失败, 缺少必要参数, 请传入session_key或者code");
        ctx.status = 400;
    }
})



export default userRoute;