// 聚合过滤

import { HistoryData } from "./typings";

// 相同计量单位 同一商品 聚合到一起求均价

export default function monthGroupBy(data: HistoryData[]) {
    const monthGroupByData: {商品名称: string, 规格型号: string, 计量单位: string, 数量: string, 单价?: string, 金额: string}[] = [];

    for (const item of data) {
        const 商品名称 = item.propurement.name;
        const 规格型号 = item.propurement.brand
        const 计量单位 = item.unit;
        const 数量 = Number(item.number).toFixed(2);
        const 单价 = Number(item.price).toFixed(2);
        const 金额 = (Number(item.price) * Number(item.number)).toFixed(2);

        const index = monthGroupByData.findIndex((item) => item.商品名称 === 商品名称 && item.计量单位 === 计量单位 && item.规格型号 === 规格型号 );
        if (index === -1) {
            monthGroupByData.push({
                商品名称,
                规格型号,
                计量单位,
                数量,
                单价: '0',
                金额
            })
        } else {
            monthGroupByData[index].数量 = (Number(monthGroupByData[index].数量) + Number(数量)).toFixed(2);
            monthGroupByData[index].金额 = (Number(monthGroupByData[index].金额) + Number(金额)).toFixed(2);
        }
    }

    for (const item of monthGroupByData) {
        item.单价 = (Number(item.金额) / Number(item.数量)).toFixed(2);
    }

    return monthGroupByData;
}