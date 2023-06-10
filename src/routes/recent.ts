// 最近一段时间购买的物品
import { extractObject, isSuperAdmin, objectToMongoUpdateSchema, timePlus, Week } from '@utils/base';
import { Db } from 'mongodb';
import { Context } from 'koa';
import Router from "koa-router";
import { hasProperties } from '../utils/base';
import logger from '@utils/logger';
import { v4 } from 'uuid';
import { isString } from 'mushr';

const recentRoute: Router = new Router();

// 从mongodb中查询出用户最常购买的物品集合
recentRoute.get("/", async (ctx: Context, next) => {
    const mongo = ctx.state.db as Db;
    const req = ctx.request.query || {};

    if (hasProperties(req, ["openid"]) && isString(req.openid)) {
        const recentCollection = mongo.collection("recent");
        const data = await recentCollection.findOne({
            openid: req.openid
        }) 

        if (data) {
            ctx.body = {
                code: 200,
                msg: "查询成功",
                data: data
            }
        } else {
            ctx.body = {
                code: 200,
                msg: "查询成功",
                data: null
            }
        }
    } else {
        ctx.body = {
            code: 400,
            msg: "缺少openid",
            data: null
        }
        ctx.status = 400;
    }

    await next();
})


// 用户发起请求，更新自己最近一段时间频繁购买的物品
recentRoute.post("/", async (ctx: Context, next) => {
    const mongo = ctx.state.db as Db;
    const req = ctx.request.body || {};

    if (hasProperties(req, ["openid"]) && isString(req.openid)) {
        const itemsCollection = mongo.collection("items");
        const propurementCollection = mongo.collection("propurement");
        const recentCollection = mongo.collection("recent");
        const data = await itemsCollection.find({
            openid: req.openid,
            lastModified: {
                $gte: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
            }
        })

        // 按照uuid进行聚类，统计购买次数
        const uuidMap = new Map<string, any>();
        for await (const item of data) {
            if (uuidMap.has(item.uuid)) {
                const value = uuidMap.get(item.uuid);
                value.count += 1;
                value.lastModified = item.lastModified;
                uuidMap.set(item.uuid, value);
            } else {
                uuidMap.set(item.uuid, {
                    count: 1,
                    lastModified: item.lastModified
                })
            }
        }
        
        let uuidArray = Array.from(uuidMap.entries());
        uuidArray = uuidArray.sort((a, b) => {
            return b[1].count - a[1].count;
        })

        const recentItems = []
        for (const [key, value] of uuidArray) {
            recentItems.push(await propurementCollection.findOne({
                uuid: key
            }))
        }

        const recent = {
            openid: req.openid,
            recent: recentItems
        }

        // check if recent exists
        const recentData = await recentCollection.findOneAndUpdate({
            openid: req.openid
        }, {
            $set: recent
        })

        if (recentData.value) {
            ctx.body = {
                code: 200,
                msg: "更新成功",
            }
        } else {
            await recentCollection.insertOne(recent);
            ctx.body = {
                code: 200,
                msg: "插入成功",
            }
        }

    } else {
        ctx.body = {
            code: 400,
            msg: "缺少openid",
            data: null
        }
        ctx.status = 400;
    }

    await next();
})

export default recentRoute;