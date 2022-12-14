
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

export {
    getWxUserOpenid
}