// 溪河源开发有限公司 -- 传丰商贸
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
export default function fengmaoTrade(data: HistoryData[], tradeId: number, fracId: number,
  date: Date, company: string, principal: string, title: string = '湖北溪河源农业开发有限公司') {
  const xhyTradeData: any[] = [];
  // header
  xhyTradeData.push([
    `${title}销售单`,
  ])
  xhyTradeData.push([
    `收货单位：${company}${tradeId}-${fracId}`,
    "",
    "",
    "客户地址：",
    "",
    "电话：",
    "",
    `日期：${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    "",
    ""
  ])
  // main
  xhyTradeData.push([
    "序号",
    "品名",
    "规格",
    "单位",
    "数量",
    "市场价",
    "市场金额",
    "折扣率",
    "折后价",
    "实际金额"
  ]);
  let ind = 1;
  let summary = 0;
  let summaryAfter = 0;
  for (const item of data) {
    xhyTradeData.push([
      ind,
      item.propurename,
      "",
      item.unit,
      item.number,
      Number(item.price).toFixed(2),
      (Number(item.number) * Number(item.price)).toFixed(2),
      "90%",
      (Number(item.price) * 0.9).toFixed(2),
      (Number(item.number) * Number(item.price) * 0.9).toFixed(2),
    ])
    summary += (Number(item.number) * Number(item.price));
    summaryAfter += (Number(item.number) * Number(item.price) * 0.9);
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
      '',
      '',
      '',
      ''
    ])
    ind += 1;
  }
  xhyTradeData.push([
    '本页合计',
    '',
    '',
    '',
    '',
    summary.toFixed(2),
    '',
    '',
    summaryAfter.toFixed(2),
    ''
  ])

  xhyTradeData.push([
    '合计金额(大写)：',
    '',
    '',
    convertCurrency(summaryAfter),
    '',
    '',
    '',
    ''
  ])

  // footer

  xhyTradeData.push([
    "采购人：",
    "",
    "",
    "",
    "",
    "食堂验货员：",
    "",
    "",
    "",
    "",
  ])

  xhyTradeData.push([
    "证明人：",
    "",
    "",
    "",
    "",
    "仓库保管员：",
    "",
    "",
    "",
    "",
  ])

  xhyTradeData.push([
    "送货员签字：",
    "",
    "",
    "",
    "",
    `制单员：${principal}`,
    "",
    "",
    "",
    "",
  ])

  xhyTradeData.push([
    "电话：",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ])


  console.log(xhyTradeData);
  return xhyTradeData;
}

export function fengmaoStyle(sheet: Sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref']!);

  sheet["!margins"] = {
    top: 0.43,
    bottom: 2.54,
    footer: 1.27,
    header: 0.43,
    left: 0.41,
    right: 0.41,
  }

  // wide

  // merge
  sheet["!merges"] = [
    {
      s: {
        c: 0,
        r: 0
      },
      e: {
        c: 9,
        r: 0
      }
    },
    {
      s: {
        c: 0,
        r: 1
      },
      e: {
        c: 2,
        r: 1
      },
    },
    {
      s: {
        c: 3,
        r: 1
      },
      e: {
        c: 4,
        r: 1
      }
    },
    {
      s: {
        c: 7,
        r: 1
      },
      e: {
        c: 9,
        r: 1
      }
    },
    {
      s: {
        c: 0,
        r: 17
      },
      e: {
        c: 2,
        r: 17
      }
    },
    {
      s: {
        c: 3,
        r: 17
      },
      e: {
        c: 5,
        r: 17
      }
    },
    {
      s: {
        c: 6,
        r: 17
      },
      e: {
        c: 8,
        r: 17
      }
    },
    {
      s: {
        c: 0,
        r: 18
      },
      e: {
        c: 1,
        r: 18
      }
    },
    {
      s: {
        c: 5,
        r: 18,
      },
      e: {
        c: 6,
        r: 18
      }
    },
    {
      s: {
        c: 0,
        r: 19
      },
      e: {
        c: 1,
        r: 19
      }
    },
    {
      s: {
        c: 5,
        r: 19,
      },
      e: {
        c: 6,
        r: 19
      }
    },
    {
      s: {
        c: 0,
        r: 20
      },
      e: {
        c: 1,
        r: 20
      }
    },
    {
      s: {
        c: 5,
        r: 20,
      },
      e: {
        c: 6,
        r: 20
      }
    },
    {
      s: {
        c: 0,
        r: 21
      },
      e: {
        c: 1,
        r: 21
      }
    },
  ]

  // TODO 不支持行高设置

  sheet["!cols"] = [
    {
      wch: 7,
    },
    {
      wch: 7,
    },
    {
      wch: 13,
    },
    {
      wch: 6,
    },
    {
      wch: 7,
    },
    {
      wch: 7,
    },
    {
      wch: 7,
    },
    {
      wch: 7,
    },
    {
      wch: 7,
    },
    {
      wch: 7,
    }
  ];

  const rows = []
  const heights = [35, 30, ...Array(26).fill(18)]
  rows.push(...heights.map((val) => ({
    hpx: val
  })))

  sheet["!rows"] = rows

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
              underline: true
            }
          }
        }

        else if (R === 1) {
          cell.s = {
            font: {
              sz: 11,
              underline: true
            }
          };
          if (C === 0) {
            cell.s.alignment = {
              horizontal: "left"
            }
          }
          if (C === 3) {
            cell.s.alignment = {
              horizontal: "left"
            }
          }
          if (C === 6) {
            cell.s.alignment = {
              horizontal: "left"
            }
          }
          if (C === 8) {
            cell.s.alignment = {
              horizontal: "left"
            }
          }
        } else if (R >= 17) {
          cell.s = {}
          cell.s.alignment = {
            horizontal: "left"
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