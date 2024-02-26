import { createRouter, createWebHistory } from "vue-router";
import useUser from "./states/useUser";


const routes = [
    { path: "/", component: () => import("./pages/Main.vue") },
    {
        path: "/board", 
        name: "board",
        component: () => import("./pages/trade/Layout.vue"),
        redirect: '/board/userinfo',
        children: [
            {
                collection: "user",
                path: "userinfo",
                name: 'userinfo',
                title: "用户信息",
                component: () => import("./pages/trade/UserInfo.vue")
            },
            {
                collection: "user",
                path: "useradd",
                name: "useradd",
                title: "添加用户",
                component: () => import("./pages/trade/UserAdd.vue")
            },
            {
                collection: "pro",
                path: "proinfo",
                name: 'proinfo',
                title: "产品信息",
                component: () => import("./pages/trade/ProInfo.vue")
            },
            {
                collection: "pro",
                path: "proadd",
                name: 'proadd',
                title: "产品添加",
                component: () => import("./pages/trade/ProAdd.vue")
            },
            {
                collection: "trade",
                path: "tradeinfo",
                name: 'tradeinfo',
                title: "订单信息(记录层级)",
                component: () => import("./pages/trade/TradeInfo.vue")
            },
            {
                collection: "trade",
                path: "transition",
                name: 'transition',
                title: '订单信息(订单层级)',
                component: () => import("./pages/trade/Transition.vue")
            },
            {
                collection: "trade",
                path: "tradeadd",
                name: "tradeadd",
                title: "订单添加",
                component: () => import("./pages/trade/TradeAdd.vue")
            },
            {
                path: "gethistory",
                name: 'gethistory',
                title: "历史信息",
                component: () => import("./pages/trade/GetHistory.vue")
            },
            {
                path: "chart",
                name: 'chart',
                title: "可视化展示",
                component: () => import("./pages/trade/Chart.vue")
            }
        ]
    },
    // 404 page
    { path: "/:pathMatch(.*)*", component: () => { return import("./pages/404.vue") } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export {
    routes
}


export default router;