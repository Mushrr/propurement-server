//  单位：夷陵区机关后勤服务中心食堂（一食堂） 
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
export default function yilingqujiguanTrade(data: HistoryData[], tradeId: number, fracId: number,
  date: Date, company: string, principal: string, title: string = '湖北溪河源农业开发有限公司') {
  const xhyTradeData: any[] = [];
  // header
  xhyTradeData.push([
    `采购单`,
  ])
  xhyTradeData.push([
    `单位：${company}${tradeId}-${fracId}`,
    "",
    "",
    "",
    "",
    `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    ""
  ])
  // main
  xhyTradeData.push([
    "序号",
    "品名",
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

  while (ind < 26) {
    // 不足 25 个自动添加空数据
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
    "",
    `大写：${convertCurrency(Number(summary.toFixed(2)))}           小写：¥${summary.toFixed(2)}`,
    "",
    "",
    "",
    ""
  ])
  // footer

  xhyTradeData.push([
    `食堂负责人：`,
    "",
    `采购员：${principal}`,
    "",
    "",
    '供应商：',
    ""
  ])
  console.log(xhyTradeData);
  // TODO
  return xhyTradeData;
}

export function yilingqujiguanStyle(sheet: Sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref']!);

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
              sz: 14
            }
          };
        } else if (R === 28) {
          cell.s = {}
          if (C === 0) {
            cell.s.alignment = {
              horizontal: "center"
            }
          }
        } else if (R === 2) {
          cell.s = {
            font: {
              name: "宋体",
              sz: 12,
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
        } else if (R === 28) {
          cell.s = {
            font: {
              name: "宋体",
              sz: 12
            },
            alignment: {
              horizontal: 'center'
            },
          }
          if (C === 0 || C === 2) {
            cell.s.border = {
              top: borderStyle,
              left: borderStyle,
              bottom: borderStyle
            }
          } else if (C === 1 || C === 6) {
            cell.s.border = {
              top: borderStyle,
              right: borderStyle,
              bottom: borderStyle
            }
          } else {
            cell.s.border = {
              top: borderStyle,
              bottom: borderStyle
            }
          }
        } else if (R === 29) {
          cell.s = {
            font: {
              name: "宋体",
              sz: 12
            },
            alignment: {
              horizontal: 'center'
            },
          }
        } else {
          cell.s = {
            font: {
              name: "宋体",
              sz: 12,
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

  sheet["!margins"] = {
    top: 0.59,
    bottom: 0.4,
    footer: 0.315,
    header: 0.315,
    left: 0.98,
    right: 0.4,
  }

  const rows = []
  const heights = [35, 30, ...Array(26).fill(24), 28, 33.8]
  rows.push(...heights.map((val) => ({
    hpx: val
  })))

  sheet["!rows"] = rows

  // wide

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
        c: 5,
        r: 1
      },
      e: {
        c: 6,
        r: 1
      }
    },
    {
      s: {
        c: 0,
        r: 28
      },
      e: {
        c: 1,
        r: 28
      }
    },
    {
      s: {
        c: 2,
        r: 28
      },
      e: {
        c: 6,
        r: 28
      }
    },
    {
      s: {
        c: 0,
        r: 29
      },
      e: {
        c: 1,
        r: 29
      }
    },
    {
      s: {
        c: 2,
        r: 29
      },
      e: {
        c: 4,
        r: 29
      }
    },
    {
      s: {
        c: 5,
        r: 29
      },
      e: {
        c: 6,
        r: 29
      }
    },
  ]

  // TODO 不支持行高设置

  sheet["!cols"] = [
    {
      wch: 4,
    },
    {
      wch: 20,
    },
    {
      wch: 6,
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
    {
      wch: 16,
    }
  ];

  return sheet;
}