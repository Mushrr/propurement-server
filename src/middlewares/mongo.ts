import { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import { Context, Next } from 'koa';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export default async function mongo(ctx: Context, next: Next): Promise<void> {
    const client = new MongoClient(process.env.MONGO_URL as string);
    await client.connect();
    const uuid = uuidv4();
    const state: {
        db: Db;
    } = {
        db: client.db(process.env.MONGO_DATABASE)
    }
    ctx.state = state 
    await next();

    setTimeout(() => {
        client.close();
        logger.info(uuid + " MongoDB connection closed");
    }, 1000)
}