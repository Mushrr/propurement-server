// 月汇总数据转化 为 JSON
import { datetimeToDate } from "./base";
import { HistoryData } from "./typings";

export default function monthSummary(data: HistoryData[]) {
    // 月度汇总数据
    const monthData: { 日期: string, 单位名称: string, 开票金额: number }[] = [];
    let summary = 0;
    for (const item of data) {
        const date = datetimeToDate(new Date(item.lastModified));
        const ddl = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const company = item.agent.organization.company;
        const total = Number(item.price) * item.number;
        
        const index = monthData.findIndex((item) => item.日期 === ddl && item.单位名称 === company);
        if (index === -1) {
            monthData.push({
                日期: ddl,
                单位名称: company,
                开票金额: total
            });
        } else {
            monthData[index].开票金额 += total;
        }
        summary += total;
    }
    
    monthData.push({
        日期: "",
        单位名称: "合计",
        开票金额: summary
    })
    
    return monthData
}