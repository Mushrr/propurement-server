<template>
    <div class="absolute w-full h-full bg-[#e9e9e9] 
    dark:bg-black flex flex-col place-content-center overflow-hidden">
        <div class="
        flex  place-content-center
        flex-col md:flex-row 
        items-center">
            <div class="relative flex flex-row items-center place-content-center">
                <img ref="logo" v-motion :initial="{
                    opacity: 0,
                    y: 100,
                }" :enter="{
                    opacity: 1,
                    y: 0,
                }" class="md:w-[500px]" src="/icon.svg" @mouseover="openLoginCard" />
            </div>


            <div ref="loginCard" class="hidden p-4 rounded-10 
            shadow shadow-[#b6b6b6] shadow-2xl
            items-center 
            ">
                <div class="i-carbon-arrows-vertical text-2xl absolute right-5 border-2 bg-black hover:animate-spin"
                    @click="(isLoginCardShow = !isLoginCardShow)">

                </div>

                <div class="h-70% i-carbon-user text-6xl absolute">

                </div>
                <Transition name="lr-change">
                    <div class="h-30% flex flex-col absolute bottom-2">
                        <div class="flex flex-row items-center mb-4">
                            <div class="text-2xl i-carbon-carbon mr-2"></div>
                            <input class="pl-4" :placeholder="placeholders.username" @keypress.enter="login"
                                v-model="account" />
                        </div>
                        <div class="flex flex-row items-center mb-4">
                            <div class="text-2xl i-carbon-account mr-2"></div>
                            <input class="pl-4" type="password" :placeholder="placeholders.password"
                                @keypress.enter="login" v-model="password" />
                        </div>
                        <div>
                            <button ref="loginButton" class="w-100% bg-[#eae9e9] hover:bg-[#d6d5d5] focus:border-1px"
                                @click="login">
                                <span class="mr-2">登录</span>
                            </button>
                        </div>
                    </div>
                    <!-- <div v-else class="h-30% flex flex-col  absolute bottom-25">
                        <div class="flex flex-row items-center mb-4">
                            <div class="text-2xl i-carbon-carbon mr-2"></div>
                            <input class="pl-4" :placeholder="placeholders.username" v-model="account" />
                        </div>
                        <div class="flex flex-row items-center mb-4">
                            <div class="text-2xl i-carbon-user-certification mr-2"></div>
                            <input class="pl-4" :placeholder="placeholders.nickname" v-model="nickname" />
                        </div>
                        <div class="flex flex-row items-center mb-4">
                            <div class="text-2xl i-carbon-account mr-2"></div>
                            <input class="pl-4" type="password" :placeholder="placeholders.password" v-model="password"
                            @keypress.enter="registry" />
                        </div>
                        <div class="flex flex-row items-center mb-4">
                            <div class="text-2xl i-carbon-account mr-2"></div>
                            <input class="pl-4" type="password" :placeholder="placeholders.recheck" v-model="recheck"
                                @keypress.enter="registry" />
                        </div>
                        <div>
                            <button ref="registryButton" class="w-100% bg-[#eae9e9] hover:bg-[#d6d5d5] focus:border-1px"
                                @click="registry">
                                <span class="mr-2">注册</span>
                            </button>
                        </div>
                    </div> -->
                </Transition>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { ref } from "vue";
import { useMotion } from "@vueuse/motion"
import progressIcon from "../assets/icons/progress.svg"
import request from "../request"
import { ElMessage } from "element-plus";
import useUser  from "../states/useUser"
import { useRouter } from "vue-router";

const logo = ref<HTMLImageElement | null>(null);
const loginCard = ref<HTMLDivElement | null>(null);
const loginButton = ref<HTMLButtonElement | null>(null);
const registryButton = ref<HTMLButtonElement | null>(null);

const placeholders = ref({
    username: "请输入用户名",
    password: "请输入密码",
    nickname: "如何称呼您?",
    recheck: "请再次输入密码"
})
const isLoginCardShow = ref(true);
const account = ref<string | null>(null);
const password = ref<string | null>(null);
const nickname = ref<string | null>(null);
const recheck = ref<string | null>(null);

const userState = useUser();
const router = useRouter()


function openLoginCard() {
    useMotion(logo.value, {
        initial: {
            x: 0
        },
        enter: {
            x: -200,
        }
    })

    useMotion(loginCard.value!, {
        initial: {
            opacity: 0,
            x: 0,
            width: 0,
            height: 0,
            display: "none"
        },
        enter: {
            opacity: 1,
            x: 100,
            width: 400,
            height: 400,
            backgroundColor: "#f0efef",
            display: "flex",
            flexDirection: "column"
        },
    })
}

function wait(button: HTMLButtonElement) {

    const loginSvg = document.createElement("img");
    loginSvg.src = progressIcon;
    loginSvg.classList.add("w-3", "h-3", "animate-spin");
    button.appendChild(loginSvg);
    button.classList.add("text-gray", "cursor-not-allowed")
}

function cancelButtonWait(button: HTMLButtonElement) {
    button.removeChild(button.lastChild!);
    button.classList.remove("text-gray", "cursor-not-allowed")
}

function login() {
    if (!loginButton.value!.classList.contains("cursor-not-allowed")) {
        // try login here TODO
        wait(loginButton.value!);
        request({
            url: "/user",
            method: "POST",
            data: {
                phone: account.value,
                password: password.value
            }
        }).then(res => {
            console.log(res);
            ElMessage.success(`${res.data.data.organization.company}登录成功，欢迎回来`);
            cancelButtonWait(loginButton.value!);
            userState.updateUserState(res.data.data);
            router.push({
                path: `/board`
            })
        }).catch(err => {
            ElMessage.error(err.response.data.message);
            cancelButtonWait(loginButton.value!);
        })
    }
}



// function registry() {
//     if (!registryButton.value!.classList.contains("cursor-not-allowed")) {
//         wait(registryButton.value!);
//         if (account.value && nickname.value && password.value && recheck.value) {
//             if (password.value === recheck.value) {
//                 request({
//                     url: "/user/registry",
//                     method: "POST",
//                     data: {
//                         username: account.value,
//                         password: password.value,
//                         nickname: nickname.value
//                     }
//                 }).then(res => {
//                     console.log(res)
//                     ElMessage.success(`${account.value}注册成功，欢迎加入`);
//                     cancelButtonWait(registryButton.value!)
//                     isLoginCardShow.value = !isLoginCardShow.value;
//                 }).catch(err => {
//                     cancelButtonWait(registryButton.value!)
//                 })
//             } else {
//                 ElMessage.error("两次密码不一致，请重试");
//                 cancelButtonWait(registryButton.value!)
//             }
//         } else {
//             ElMessage.error("有一项为空，请重试");
//             cancelButtonWait(registryButton.value!)
//         }
//     }
// }
</script>

<style scoped>
.login-card {
    display: absolute;
}


.lr-change-enter-active,
.lr-change-leave-active {
    transition: all 0.5s;
    opacity: 0;
}

.lr-change-enter,
.lr-change-leave-to {
    transform: translateX(40px);
}
</style>