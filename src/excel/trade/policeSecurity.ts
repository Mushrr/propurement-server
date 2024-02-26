// 溪河源开发有限公司
import { Sheet } from "xlsx-js-style";
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
export default function policeTrade(data: HistoryData[], tradeId: number, fracId: number, 
    date: Date, company: string, principal: string, title: string = '湖北溪河源农业开发有限公司') {
    const xhyTradeData: any[] = [];
    // header
    xhyTradeData.push([
        `${title}配送单`,
    ])
    xhyTradeData.push([
        `购买单位：${company}${tradeId}-${fracId}`,
        ``,
        "",
        "",
        `录单日期：${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`,
        "",
        ``
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
        '合计金额',
        `大写: ${convertCurrency(summary)}`,
        '',
        '',
        '',
        summary.toFixed(2),
        ''
    ])

    // footer

    xhyTradeData.push([
        `食堂负责人：                 采购员：${principal}         仓库保管员:                       供应商:             `,
    ])
    console.log(xhyTradeData);
    return xhyTradeData;
}

export function policeStyle(sheet: Sheet) {
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
                c: 0,
                r: 1
            },
            e: {
                c: 3,
                r: 1
            },
        },
        {
            s: {
                c: 4,
                r: 1
            },
            e: {
                c: 6,
                r: 1
            }
        },
        {
            s: {
                c: 1,
                r: 16
            },
            e: {
                c: 4,
                r: 16
            }
        },
        {
            s: {
                c: 0,
                r: 17
            },
            e: {
                c: 6,
                r: 17
            }
        },
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

    sheet["!margins"] = {
        "top": 0.43,
        "bottom": 2.54,
        "footer": 1.27,
        "header": 0.43,
        "left": 0.41,
        "right": 0.41
    }

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
                            sz: 21,
                        }
                    }
                }

                else if (R === 1) {
                    cell.s = {
                        font: {
                            sz: 11
                        }
                    };

                    if (C === 0) {
                        cell.s.alignment = {
                            horizontal: "left"
                        }
                    }
                    if (C === 6) {
                        cell.s.alignment = {
                            horizontal: "left"
                        }
                    }
                } else if (R === 16) {
                    // 公安总计行
                    cell.s = {
                        font: {
                            name: "宋体",
                            sz: 11,
                            bold: false
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
                            bold: false
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
                        },
                        alignment: {
                            horizontal: 'center'
                        }
                    };
                }
            }
        }
    }

    console.log(sheet);
    return sheet;
}