import { ElMessage } from "element-plus"
import { defineStore } from "pinia"
import router from "../router"

interface UserState {
    openid: string,
    user_type: string,
    session_key: string,
    organization: {
        organization_id: string,
        organization_name: string,
        department: string,
        position: string,
        phone_number: string,
        principal: string
    }
}

export default defineStore('userinfo', {
    state: () => ({
        openid: '',
        user_type: '',
        session_key: '',
        organization: {
            organization_id: '',
            organization_name: '',
            department: '',
            position: '',
            phone_number: '',
            principal: ''
        }
    }),
    actions: {
        updateUserState(state: UserState) {
            console.log(state);
            for (let [key, value] of Object.entries(state)) {
                if (key === "avator") {
                // @ts-ignore
                    this.$state[key] = import.meta.env.VITE_URL_PREFIX + "/" + value
                } else {
                    // @ts-ignore
                    this.$state[key] = value
                }
            }
        },
        
        quit() {
            // @ts-ignore
            ElMessage.info(`${this.username}退出成功，欢迎下次再来!`)
            router.replace({
                path: "/"
            })
        }
    }
})