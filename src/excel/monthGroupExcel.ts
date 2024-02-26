// 月聚类表格

import monthGroupBy from "./monthGroupBy";
import { HistoryData } from "./typings";
import * as XLSX from 'xlsx-js-style';


export default function monthGroupExcel(data: HistoryData[]) {

    const monthGroupData = monthGroupBy(data);

    const book = XLSX.utils.book_new();

    const sheet = XLSX.utils.json_to_sheet(monthGroupData);

    const range = XLSX.utils.decode_range(sheet["!ref"]!);

    sheet['!cols'] = [
        {
            wch: 30,
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

    console.log(book);

    XLSX.utils.book_append_sheet(book, sheet, '单一汇率');
    // TODO 表格样式

    return book;
}