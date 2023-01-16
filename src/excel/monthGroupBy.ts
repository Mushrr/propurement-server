// 聚合过滤

import { HistoryData } from "./typings";

// 相同计量单位 同一商品 聚合到一起求均价

export default function monthGroupBy(data: HistoryData[]) {
    const monthGroupByData: {商品名称: string, 规格型号: string, 计量单位: string, 数量: number, 单价?: number, 金额: number}[] = [];

    for (const item of data) {
        const 商品名称 = item.propurement.name;
        const 规格型号 = item.propurement.brand
        const 计量单位 = item.unit;
        const 数量 = Number(item.number);
        const 单价 = Number(item.price);
        const 金额 = 数量 * 单价;

        const index = monthGroupByData.findIndex((item) => item.商品名称 === 商品名称 && item.计量单位 === 计量单位 && item.规格型号 === 规格型号 );
        if (index === -1) {
            monthGroupByData.push({
                商品名称,
                规格型号,
                计量单位,
                数量,
                单价: 0,
                金额
            })
        } else {
            monthGroupByData[index].数量 += 数量;
            monthGroupByData[index].金额 += 金额;
        }
    }

    for (const item of monthGroupByData) {
        item.单价 = item.金额 / item.数量;
    }

    return monthGroupByData;
}