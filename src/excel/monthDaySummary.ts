// 日总结

import { datetimeToDate } from "./base";
import { HistoryData } from "./typings";

export default function monthDaySummary(data: HistoryData[]) {
    const monthDayData: {日期: string, 商品名称: string, 计量单位: string, 数量: number | string, 单价: number | string, 金额: number}[] = [];
    let summary = 0;
    for (const item of data) {
        const date = datetimeToDate(new Date(item.lastModified));
        const ddl = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const name = item.propurement.name;
        const unit = item.unit;
        const number = Number(item.number);
        const price = Number(item.price);
        const total = number * price;

        monthDayData.push({
            日期: ddl,
            商品名称: name,
            计量单位: unit,
            数量: number,
            单价: price,
            金额: total
        });
        summary += total;
    }

    monthDayData.push({
        日期: '',
        商品名称: '合计',
        计量单位: '',
        数量: '',
        单价: '',
        金额: summary
    })

    return monthDayData;
}