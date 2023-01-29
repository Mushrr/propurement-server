// 月汇总Excel
import monthDaySummary from "./monthDaySummary";
import monthSummary from "./monthSummary";
import { HistoryData } from "./typings";
import * as XLSX from 'xlsx';

function standardSheetStyle(sheet: any) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    sheet['!cols'] = [
        {
            wch: 16,
        },
        {
            wch: 21,
        },
        {
            wch: 18,
        },
        {
            wch: 10,
        },
        {
            wch: 10,
        },
        {
            wch: 10,
        },
    ]

    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const address = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = sheet[address];
            if (R === 0) {

                cell.s = {
                    fill: {
                        bgColor: {
                            rgb: 'C0C0C0'
                        },
                        fgColor: {
                            rgb: 'C0C0C0'
                        },
                        patternType: 'solid'
                    },
                    font: {
                        name: "FangSong",
                        bold: true
                    }
                }
            }

            const borderStyle = {
                style: 'thin',
                color: {
                    rgb: '000000'
                }
            }

            if (cell.s) {
                cell.s.alignment = {
                    horizontal: 'center',
                }
                cell.s.border = {
                    top: borderStyle,
                    bottom: borderStyle,
                    left: borderStyle,
                    right: borderStyle
                }
            } else {
                cell.s = {
                    alignment: {
                        horizontal: 'center'
                    },
                    border: {
                        top: borderStyle,
                        bottom: borderStyle,
                        left: borderStyle,
                        right: borderStyle
                    }
                }
            }
        }
    }
}

export default function monthSummaryExcel(data: HistoryData[]) {

    const monthDayData = monthDaySummary(data);
    const monthData = monthSummary(data);

    const book = XLSX.utils.book_new();

    const daySheet = XLSX.utils.json_to_sheet(monthDayData);
    const monthSheet = XLSX.utils.json_to_sheet(monthData);

    standardSheetStyle(daySheet);
    standardSheetStyle(monthSheet);

    XLSX.utils.book_append_sheet(book, monthSheet, '汇总');
    XLSX.utils.book_append_sheet(book, daySheet, '每日明分');

    // 汇总和每日细分的样式

    

    // TODO 样式配置

    return book;
}