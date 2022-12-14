import { Db } from 'mongodb';
import { Context } from 'koa';
// User Route
import * as fs from 'fs';
import Router from "koa-router";
import path from 'path';
import { hasProperties } from '../utils/base';
import { getWxUserOpenid } from '../utils/fetchTools';
import logger from '../utils/logger';
import { UserInfo } from "@loctypes/user"


interface WxUserInfo {
    openid: string;
    session_key: string;
}

const userRoute: Router = new Router();

userRoute.post("/", async (ctx: Context) => {
    // UserInfo
    const mongo = ctx.state.db as Db;
    const userCollection = mongo.collection("user");

    if (hasProperties(ctx.request.body, ["session_key"])) {
        // 返回
        // 目前微信小程序已经不需要获取用户的个人信息了，可以直接通过open-data获得
        const session_key = ctx.request.body.session_key;

        ctx.body = {
            code: 200,
            msg: "session_key 登入成功",
            data: await userCollection.findOne({ session_key: session_key })
        }
        logger.info("用户登入 获取到的session_key为: " + session_key);
    } else if (hasProperties(ctx.request.body, ["code"])) {
        console.log(ctx.request.body.code);
        // 依据code 获取 openid
        const wxUserInfo = await getWxUserOpenid(ctx.request.body.code) as WxUserInfo;
        logger.info("有新用户登入 获取到的openid为: " + wxUserInfo.openid);
        logger.info("有新用户登入 获取到的session_key为: " + wxUserInfo.session_key);

        ctx.body = {
            code: 200,
            msg: "code 登入成功",
            data: await userCollection.findOne({ openid: wxUserInfo.openid })
        };

        // 保存用户信息
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
        if (!await userCollection.findOne({ openid: wxUserInfo.openid })) {
            // 不存在用户信息, 则插入
            userCollection.insertOne(userInfo); // 不需要阻塞
        }
        
        // 保存用户信息
        if (hasProperties(ctx.request.body, ["userInfo", "update"])) {
            const wxUserInfo: UserInfo = ctx.request.body.userInfo;
            if (ctx.request.body.update) {
                // 更新用户信息
                userCollection.findOneAndUpdate(
                    { openid: wxUserInfo.openid },
                    { $set: wxUserInfo }, // 更新UserInfo信息
                )
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