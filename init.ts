import logger from './src/utils/logger';
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGO_URL as string);

mongoClient.connect().then(res => {
    logger.info("成功连接mongodb");
    const db = mongoClient.db(process.env.MONGO_DATABASE as string);
    const collection = db.collection("user");
    collection.findOneAndDelete({
        openid: 'admin'
    }).then(() => {
        collection.insertOne({
            openid: "admin",
            organization: {
                company: "admin",
                department: "admin",
                position: "unknown"
            },
            principals: [
                {
                    phone: "admin",
                    name: "管理员",
                    password: "aaddmin"
                }
            ]
        })
    })
}).catch(err => {
    logger.error(err);
})