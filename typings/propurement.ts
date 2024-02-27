import { Timestamp } from "mongodb";
import { AgentInfo } from "./agent";
import { GoodDocument } from "./base";
import { UserInfo } from "./user";

/**
 * 采购单位
 * 单位信息
 * 与规格信息
 */
type Unit = { unit: string, specification: string }

interface PropurementInfo {
    uuid: string,
    name: string,
    category: string, // 类别
    brand?: string, // 品牌
    detailPage?: GoodDocument // 物品介绍页面
    defaultUnits: Unit[], // 默认单位
    agentPrices: { agent: AgentInfo, unit: string, price: number, timeStamp: Timestamp }[], // 存储历史价格，方便查阅历史数据
    userPrices: { user: UserInfo, unit: string, price: number, timeStamp: Timestamp }[], // 一般来说不在User端显示价格，这里只是为了方便后台统计
    lastChange: Timestamp | Date | string // 允许使用Mongodb 的系统变量 $$NOW
}

export {
    PropurementInfo
}