import {
    xhyStyle,
    xhyTrade,
    msGongshuiShiTangStyle,
    msGongshuiShiTangTrade,
    policeStyle,
    policeTrade,
    shuichangStyle,
    shuichangTrade,
    fuliyuanStyle,
    fuliyuanTrade,
    dangxiaoStyle,
    dangxiaoTrade,
    yilingqujiguanStyle,
    yilingqujiguanTrade
} from "./excel/excel"


const config = {
    allRoutes: ['/', '/about'],
    companyTitle: [
        '宜昌祺祯生猪养殖专业合作社',
        '湖北溪河源农业开发有限公司'
    ],
    excelExtractMapping: {
        '默认': {
            trade: policeTrade,
            style: policeStyle
        },
        '福利院': {
            trade: fuliyuanTrade,
            style: fuliyuanStyle
        },
        '夷陵区公安局': {
            trade: policeTrade,
            style: policeStyle
        },
        "三水厂食堂": {
            trade: xhyTrade,
            style: xhyStyle
        },
        "民生供水食堂": {
            trade: xhyTrade,
            style: xhyStyle
        },
        "宜昌市委党校": {
            trade: dangxiaoTrade,
            style: dangxiaoStyle
        },
        "夷陵区机关后勤服务中心食堂": {
            trade: yilingqujiguanTrade,
            style: yilingqujiguanStyle
        }
    }
}

export default config 