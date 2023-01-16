// 月聚类表格

import monthGroupBy from "./monthGroupBy";
import { HistoryData } from "./typings";
import * as XLSX from 'xlsx';


export default function monthGroupExcel(data: HistoryData[]) {
    
    const monthGroupData = monthGroupBy(data);

    const book = XLSX.utils.book_new();

    const sheet = XLSX.utils.json_to_sheet(monthGroupData);
    
    XLSX.utils.book_append_sheet(book, sheet, '单一汇率');

    // TODO 表格样式

    return book;
}