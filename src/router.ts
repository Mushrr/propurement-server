import { Db } from 'mongodb';
import Router from 'koa-router'

const router = new Router()

router.get("/", async (ctx, next) => {
    ctx.body = "Hello World!" + process.env.ApplicationName + Object.keys(ctx.state.db.listCollections());
    await next();
})

export default router