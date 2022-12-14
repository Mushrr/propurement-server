import { Db } from 'mongodb';
import Koa from 'koa';
import * as dotenv from 'dotenv';
import router from "./src/router";
import logger from "koa-logger"
import koaBody from 'koa-body';
import cors from './src/middlewares/cors';
import mongo from './src/middlewares/mongo';

// 环境变量初始化
dotenv.config();

const app = new Koa();

if (process.env.NODE_ENV === "development") {
    app.use(cors); // 跨源请求
}

// logger
app.use(logger((str) => {
    console.log(`${new Date().toLocaleString()} ${str}`);
}));
app.use(mongo); // MongoDB
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024 // 设置上传文件大小最大限制，默认2M
    }
}));

// Routes
app.use(router.routes()).use(router.allowedMethods());


// listen
app.listen(process.env.PORT, () => {
    console.log(`
    ${new Date().toLocaleString()}, Server Start at ${process.env.PORT || 3000}, Env: ${process.env.NODE_ENV || "development"}.
    You can visit \x1B[36m\x1B[4mhttp://localhost:${process.env.PORT || 3000}\x1B[0m  to see the result.
                                                —— Developed By Mushr
    `)
});