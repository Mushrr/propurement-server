// 溪河源开发有限公司
import { HistoryData } from "../typings";

/**
 * 
 * @param data 数据
 * @param tradeId 订单号
 * @param fracId 分号
 * @returns 
 */
export default function xhyTrade(data: HistoryData[], tradeId: number, fracId: number) {
    const xhyTradeData: any[] = [];
    // header

    // main
    xhyTradeData.push([
        "商品编号",
        "商品全名",
        "单位",
        "数量",
        "单价",
        "金额",
        "备注"
    ])

    let ind = 1;
    let summary = 0;
    for (const item of data) {
        xhyTradeData.push([
            ind,
            item.propurename,
            item.unit,
            item.number,
            item.price,
            Number(item.number) * Number(item.price),
            item.userComment
        ])
        summary += Number(item.number) * Number(item.price);
        ind += 1;
    }

    while (ind < 14) {
        xhyTradeData.push([
            ind,
            '',
            '',
            '',
            '',
            '',
            ''
        ])
        ind += 1;
    }
    xhyTradeData.push([
        '总计',
        '',
        '',
        '',
        '',
        summary,
        ''
    ])

    // footer


    return xhyTradeData;
}