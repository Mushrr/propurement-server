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

app.use(cors); // 跨源请求
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
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);