import Route from 'koa-router'
import { Db } from 'mongodb'
import { validateUser } from '@utils/fetchTools'

const setAgentRoute = new Route();

setAgentRoute.post('/', async (ctx, next) => {
  const req = ctx.request.body || {};
  const db = ctx.state.db as Db;
  const itemsCollections = db.collection("items");
  const openid = req.openid
  const userType = await validateUser(openid, ctx)
  if (!req.agentOpenid) {
    ctx.body = {
      code: 500,
      message: "agentOpenid不能为空"
    }
    return;
  }

  if (userType === 'admin') {
    const query = {
      "transitionId": req.transitionId
    }
    await itemsCollections.updateMany(query, {
      '$set': {
        'agentOpenid': req.agentOpenid
      }
    })

    ctx.body = {
      code: 200,
      message: "设置成功"
    }
  } else {
    ctx.body = {
      code: 500,
      message: "权限不够"
    }
  }


  await next();
})

export default setAgentRoute;