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
                path: "userinfo",
                name: 'userinfo',
                title: "用户信息",
                component: () => import("./pages/trade/UserInfo.vue")
            },
            {
                path: "useradd",
                name: "useradd",
                title: "添加用户",
                component: () => import("./pages/trade/UserAdd.vue")
            },
            {
                path: "proinfo",
                name: 'proinfo',
                title: "产品信息",
                component: () => import("./pages/trade/ProInfo.vue")
            },
            {
                path: "proadd",
                name: 'proadd',
                title: "产品添加",
                component: () => import("./pages/trade/ProAdd.vue")
            },
            {
                path: "tradeinfo",
                name: 'tradeinfo',
                title: "订单信息",
                component: () => import("./pages/trade/TradeInfo.vue")
            },
            {
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