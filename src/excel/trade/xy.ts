// 溪河源开发有限公司
import { Sheet } from "xlsx";
import { convertCurrency } from "../base";
import { XLSX } from "../excel";
import { HistoryData } from "../typings";

/**
 * 
 * @param data 数据
 * @param tradeId 订单号
 * @param fracId 分号
 * @returns 
 */
export default function xhyTrade(data: HistoryData[], tradeId: number, fracId: number, date: Date, company: string, principal: string) {
    const xhyTradeData: any[] = [];
    // header
    xhyTradeData.push([
        "湖北溪河源农业开发有限公司配送单",
    ])
    xhyTradeData.push([
        "购买单位：",
        `${company}${tradeId}-${fracId}`,
        "",
        "",
        "录单日期：",
        "",
        date.toLocaleDateString()
    ])
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
            Number(item.price).toFixed(2),
            (Number(item.number) * Number(item.price)).toFixed(2),
            item.userComment
        ])
        summary += (Number(item.number) * Number(item.price));
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
        summary.toFixed(2),
        ''
    ])

    // footer

    xhyTradeData.push([
        `采购人：${principal}`,
        "证明人：",
        "",
        "",
        "大写：",
        convertCurrency(summary)
    ])
    console.log(xhyTradeData);
    return xhyTradeData;
}

export function xhyStyle(sheet: Sheet) {
    const range = XLSX.utils.decode_range(sheet['!ref']!);

    // merge
    sheet["!merges"] = [
        {
            s: {
                c: 0,
                r: 0
            },
            e: {
                c: 6,
                r: 0
            }
        },
        {
            s: {
                c: 4,
                r: 1
            },
            e: {
                c: 5,
                r: 1
            }
        },
        {
            s: {
                c: 2,
                r: 17
            },
            e: {
                c: 3,
                r: 17
            }
        },
        {
            s: {
                c: 5,
                r: 17
            },
            e: {
                c: 6,
                r: 17
            }
        }
    ]

    // TODO 不支持行高设置

    sheet["!cols"] = [
        {
            wch: 14,
        },
        {
            wch: 18,
        },
        {
            wch: 8,
        },
        {
            wch: 8,
        },
        {
            wch: 8,
        },
        {
            wch: 8,
        },
        {
            wch: 10,
        }
    ];

    const borderStyle = {
        style: "thin",
        color: {
            rgb: '000000'
        }
    }

    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const address = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = sheet[address];
            if (cell) {
                if (R === 0) {
                    cell.s = {
                        alignment: {
                            horizontal: "center",
                        },
                        font: {
                            sz: 20,
                        }
                    }
                }

                else if (R === 1) {
                    cell.s = {
                        font: {
                            sz: 11
                        }
                    };

                    if (C === 0 || C === 4) {
                        cell.s.alignment = {
                            horizontal: "right"
                        }
                    }
                    if (C === 6) {
                        cell.s.alignment = {
                            horizontal: "left"
                        }
                    }
                } else if (R === 17) {
                    cell.s = {}
                    if (C === 0 || C === 1 || C === 5 || C === 6) {
                        cell.s.alignment = {
                            horizontal: "left"
                        }
                    }
                } else if (R === 2) {
                    cell.s = {
                        font: {
                            name: "宋体",
                            sz: 11,
                            bold: true
                        },
                        border: {
                            top: borderStyle,
                            left: borderStyle,
                            right: borderStyle,
                            bottom: borderStyle
                        }
                    };
                    cell.s.alignment = {
                        horizontal: 'center'
                    }
                } else {
                    cell.s = {
                        font: {
                            name: "宋体",
                            sz: 11,
                        },
                        border: {
                            top: borderStyle,
                            left: borderStyle,
                            right: borderStyle,
                            bottom: borderStyle
                        }
                    };
                    if (C !== 1 && C !== 6) {
                        cell.s.alignment = {
                            horizontal: 'center'
                        }
                    }
                }
            }
        }
    }

    console.log(sheet);
    return sheet;
}