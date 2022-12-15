import { Timestamp } from "mongodb";
import { AgentInfo } from "./agent";
import { GoodDocument } from "./base";
import { UserInfo } from "./user";

interface PropurementInfo {
    uuid: string,
    name: string,
    category: string, // 类别
    brand?: string, // 品牌
    detailPage?: GoodDocument // 物品介绍页面
    defaultPrice: number, // 默认价格用户默认是这个价格, 修改之后会传递到User中
    agentPrices: { agent: AgentInfo, price: number, timeStamp: Timestamp }[], // 存储历史价格，方便查阅历史数据
    userPrices: { user: UserInfo, price: number, timeStamp: Timestamp }[], // 一般来说不在User端显示价格，这里只是为了方便后台统计
    lastChange: Timestamp | Date | string // 允许使用Mongodb 的系统变量 $$NOW
}

export {
    PropurementInfo
}