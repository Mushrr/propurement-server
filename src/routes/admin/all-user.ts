import Route from 'koa-router'
import { Db } from 'mongodb'
import { UserInfo } from '@locTypes/user';
import logger from '@utils/logger';
import { v4 } from 'uuid';
import { validateUser } from '@utils/fetchTools';

const allUserRoute = new Route();

allUserRoute.get("/", async (ctx, next) => {
  // type
  const req = ctx.request.query || {};
  const db = ctx.state.db as Db;
  const userCollection = db.collection("user");
  const openid = req.openid as string;
  const userValidate = await validateUser(openid, ctx);
  const query: Record<string, string> = {}
  if (req.type) {
    query["user_type"] = req.type as string;
  }
  if (userValidate === "admin") {
    const users = await userCollection.find(query).toArray();
    ctx.body = {
      code: 200,
      message: "获取成功",
      data: users
    }
  } else {
    ctx.body = {
      code: 500,
      message: "权限不足"
    }
  }

  await next()
})

export default allUserRoute;