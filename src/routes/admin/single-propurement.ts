import Route from 'koa-router'
import { Db } from 'mongodb'
import { validateUser } from '@utils/fetchTools'

const singlePropurementRoute = new Route();

singlePropurementRoute.get("/", async (ctx, next) => {
  const req = ctx.request.query || {};
  const db = ctx.state.db as Db;
  const itemsCollection = db.collection("propurement");
  const userValidate = await validateUser(req.openid as string, ctx);
  if (userValidate === "admin") {
    const query = {
      "uuid": req.uuid
    }
    const itemsCursor = await itemsCollection.findOne(query);
    ctx.body = {
      code: 200,
      message: "获取成功",
      data: itemsCursor
    }
  } else {
    ctx.body = {
      code: 500,
      message: "您没有权限"
    }
  }
  await next();
})


export default singlePropurementRoute