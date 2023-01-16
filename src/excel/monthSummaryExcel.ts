// 月汇总Excel
import monthDaySummary from "./monthDaySummary";
import monthSummary from "./monthSummary";
import { HistoryData } from "./typings";
import * as XLSX from 'xlsx';

export default function monthSummaryExcel(data: HistoryData[]) {

    const monthDayData = monthDaySummary(data);
    const monthData = monthSummary(data);

    const book = XLSX.utils.book_new();

    const daySheet = XLSX.utils.json_to_sheet(monthDayData);
    const monthSheet = XLSX.utils.json_to_sheet(monthData);

    XLSX.utils.book_append_sheet(book, monthSheet, '汇总');
    XLSX.utils.book_append_sheet(book, daySheet, '每日细分');

    // TODO 样式配置

    return book;
}