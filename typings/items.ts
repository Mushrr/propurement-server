import { Timestamp } from 'mongodb';
import { GoodDocument } from './base';
// 购买记录


interface PurchaseRecord {
    uuid: string, // 物品UUID, 可以查到代理给出的报价
    transitionId: string, // 交易订单号ID
    openid: string, // 用户的openid
    number: number, // 购买的数量
    unit: string, // 在这里被指定，后台选择单位后，转发到指定代理处
    state?: "uncommitted" | "waiting" | "agent-accept" | "agent-refuse" | "distributing" | "user-refuse" | "finished"
    agentOpenid?: string, // 指定代理人的openid
    userComment?: GoodDocument | string, // 用户的评价
    agentComment?: GoodDocument | string, // 代理人的评价
    [props: string]: string | number | undefined | GoodDocument,
}

interface UserItemDetail {
    unit: string, // 单位
    number: number, // 数量
    comment: GoodDocument | string | null, // 可以是富文本，也可以是单纯的字符串
}

// 代理的修改意见
interface AgentItemDetail {
    unit: string, // 单位
    number: number,
    price: number, // 代理给出的价格
    comment: GoodDocument | string | null,
}

export {
    PurchaseRecord,
    UserItemDetail,
    AgentItemDetail
}