import { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import { Context, Next } from 'koa';
export default async function mongo(ctx: Context, next: Next): Promise<void> {
    const client = new MongoClient(process.env.MONGO_URL as string);
    await client.connect();
    const state: {
        db: Db;
    } = {
        db: client.db(process.env.MONGO_DATABASE)
    }
    ctx.state = state 
    await next();
    client.close();
}