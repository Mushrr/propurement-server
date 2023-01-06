import { createApp } from 'vue'
import './style.css'
import 'uno.css'
import App from './App.vue'
import router from "./router"
import ElementPlus from "element-plus";
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion'
import "element-plus/dist/index.css"
import useUser from './states/useUser'
import config from "./config"

const pinia = createPinia();
const app = createApp(App)
app.use(ElementPlus);
app.use(router);
app.use(MotionPlugin);
app.use(pinia);


const userState = useUser();

router.beforeEach((to, from) => {
    console.log(to);
    if (!(config.allRoutes.indexOf(to.path) > -1)) {
        if (!userState.openid) {
            router.push({
                path: "/"
            })
        } else {
            console.log("不能");
        }
    }
})




app.mount("#app"); // 绑定
