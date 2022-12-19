import { UserType } from '@locTypes/user';
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

export {
    getWxUserOpenid,
    getUserType
}