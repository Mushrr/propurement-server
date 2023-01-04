import { PurchaseRecord } from '@locTypes/items';
import { UserType } from '@locTypes/user';
import { Context } from 'koa';
import { Db } from 'mongodb';
import logger from './logger';

/**
 * 获取微信用户Openid
 * @param code 前端发来的Code信息
 * @returns Promise<>
 */
function getWxUserOpenid(code: string) {
    return new Promise((resolve, reject) => {
        const appid = process.env.APPID;
        const secret = process.env.APP_SECRET;
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization`;
        fetch(url).then(res => {
            if (res.ok) {
                res.json().then(data => {
                    resolve(data);
                })
            } else {
                reject(res);
            }
        }).catch(err => {
            reject(err);
        })
    })
}


/**
 * 查看用户的类型
 * @param db Mongo数据库
 * @param openid openid
 * @returns 用户的类型
 */
function getUserType(db: Db, openid: string): Promise<UserType> {
    return new Promise((resolve, reject) => {
        const userCollection = db.collection("user");
        userCollection.findOne({ openid: openid }).then(res => {
            if (res) {
                resolve(res.user_type);
            } else {
                reject(null);
            }
        }).catch(err => {
            reject(null);
            logger.error(err);
            throw err;
        })
    })
}

/**
 * 
 * @param openid 
 * @param ctx 
 * @returns 
 */
// TODO 将所有用户认证都放到这一个函数中!!!!!, 方便统一调度
async function validateUser(openid: string | undefined, ctx: Context): Promise<UserType | false> {
    const db = ctx.state.db as Db;
    const userCollection = db.collection('user');

    const userInfo = await userCollection.findOne({ openid });
    // 非授权用户禁止访问
    if (!userInfo?._id || userInfo?.user_type === "unknown") {
        return false;
    }
    return userInfo?.user_type
}

interface transitionBase {
    transitionId: string; // 交易ID
    uuid: string; // UUID
    [prop: string]: string | object | number;
}

/**
 * 从数据库中获取一个集合
 * @param ctx 上下文
 * @param collection 集合名
 * @returns 集合
 */
async function getCollection(ctx: Context, collection: string) {
    return (ctx.state.db as Db).collection(collection);
}

async function validateTransition(transitionInfo: transitionBase, ctx: Context) {
    const itemCollection = await getCollection(ctx, "items");
    const queryField: transitionBase = {
        transitionId: transitionInfo.transitionId,
        uuid: transitionInfo.uuid,
    }
    if (transitionInfo.agentOpenid) {
        queryField.agentOpenid = transitionInfo.agentOpenid;
        queryField.state = "waiting" // 只有等待中，才能被代理访问
    }

    const transition = await itemCollection.findOne(queryField);
    if (transition?._id) {
        return transition;
    } else {
        return false;
    }
}

export {
    getWxUserOpenid,
    getUserType,
    validateUser,
    getCollection,
    validateTransition
}