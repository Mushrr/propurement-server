import Route from 'koa-router'
import { Db } from 'mongodb'
import { validateUser } from '@utils/fetchTools'



const singleTransitionRoute = new Route();

singleTransitionRoute.get("/", async (ctx, next) => {
  const req = ctx.request.query || {};
  const db = ctx.state.db as Db;
  const itemsCollection = db.collection("items");
  const userValidate = await validateUser(req.openid as string, ctx);
  if (userValidate === "admin") {
    const query = {
      "transitionId": req.transitionId
    }
    const itemsCursor = itemsCollection.find(query);
    const itemsData = [];
    for await (const items of itemsCursor) {
      itemsData.push(items);
    }
    ctx.body = {
      code: 200,
      message: "获取成功",
      data: itemsData
    }
  } else {
    ctx.body = {
      code: 500,
      message: "您没有权限"
    }
  }
  await next();
})


export default singleTransitionRoute;