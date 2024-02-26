<template>
    <div class="">
        <div class="fixed left-0 right-0 w-13vw h-100vh w-max-300px">
            <div>
                <div class="flex flex-row justify-center">
                    <div class="text-center flex flex-row items-center">
                        <div class="i-carbon-box text-2xl"></div>
                        <div>
                            采购后台系统
                        </div>
                    </div>
                </div>
                <ElCollapse v-model="currentState" accordion>
                    <ElCollapseItem>
                        <template #title>
                            <div flex flex-row items-center text-1rem pl-2>
                                <div i-carbon-user></div>
                                <div>用户</div>
                            </div>
                        </template>
                        <div v-for="route in allRoutes!.filter((el) => el.collection === 'user')" :key="route.name">
                            <router-link class="router-link-item text-black transition-all duration-200 hover:text-gray-600"
                                :to="'/board/' + route.path">{{ route.title
                                }}</router-link>
                        </div>
                    </ElCollapseItem>
                    <ElCollapseItem>
                        <template #title>
                            <div flex flex-row items-center text-1rem pl-2>
                                <div i-carbon-baggage-claim></div>
                                <div>产品</div>
                            </div>
                        </template>
                        <div v-for="route in allRoutes!.filter((el) => el.collection === 'pro')" :key="route.name">
                            <router-link class="router-link-item text-black transition-all duration-200 hover:text-gray-600"
                                :to="'/board/' + route.path">{{ route.title
                                }}</router-link>
                        </div>
                    </ElCollapseItem>
                    <ElCollapseItem>
                        <template #title>
                            <div flex flex-row items-center text-1rem pl-2>
                                <div i-carbon-data-check></div>
                                <div>订单</div>
                            </div>
                        </template>
                        <div v-for="route in allRoutes!.filter((el) => el.collection === 'trade')" :key="route.name">
                            <router-link class="router-link-item text-black transition-all duration-200 hover:text-gray-600"
                                :to="'/board/' + route.path">{{ route.title
                                }}</router-link>
                        </div>
                    </ElCollapseItem>
                </ElCollapse>
                <div flex flex-col justify-between>
                    <router-link class="router-link-item  text-black hover:bg-blue-200 transition-all duration-200"
                        :to="'/board/gethistory'">
                        <div flex flex-row items-center>
                            <div i-carbon-time></div>
                            <div>历史订单</div>
                        </div>
                    </router-link>
                    <router-link class="router-link-item  text-black hover:bg-blue-200 transition-all duration-200"
                        :to="'/board/chart'">
                        <div flex flex-row items-center>
                            <div i-carbon-chart-multitype></div>
                            <div>可视化面板</div>
                        </div>
                    </router-link>
                </div>
            </div>
            <ElCard body-style="{ background-color: #363636 }">
                <div text-rem>
                    今日待处理信息
                </div>
                <table>
                    <tr>
                        <td>正在等待的订单</td>
                        <td>{{ list.waiting }}</td>
                    </tr>
                    <tr>
                        <td>代理接受订单</td>
                        <td>{{ list["agent-accept"] }}</td>
                    </tr>
                    <tr>
                        <td>代理拒绝订单</td>
                        <td>{{ list["agent-refuse"] }}</td>
                    </tr>
                    <tr>
                        <td>正在配发</td>
                        <td>{{ list.distributing }}</td>
                    </tr>
                </table>
            </ElCard>
        </div>
        <div class="ml-13vw h-1000px w85vw relative">
            <div class="z-99 flex flex-row items-center p-2">
                <span class="i-carbon-car"></span>
                <Transition name="route-change">
                    <el-breadcrumb class="font-mono font-bold text-3xl">
                        <el-breadcrumb-item v-for="path in currentRoute.path.split('/')">
                            <span class="text-1.2rem">
                                {{ path }}
                            </span>
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </Transition>
            </div>
            <router-view></router-view>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { useRoute } from 'vue-router';
import { routes } from '../../router';
import useUser from '../../states/useUser';
import {
    ElTable, ElTableColumn, ElButton, ElDialog, ElTag, ElDescriptions,
    ElDescriptionsItem, ElSelect, ElOption, ElForm, ElFormItem,
    ElInput, ElPagination,
    ElBreadcrumb, ElBreadcrumbItem, ElCollapse, ElCollapseItem,
    ElMessage, ElCard
} from 'element-plus';
import { Ref, ref, watch } from 'vue'
import request from '../../request';

const currentRoute = useRoute();

// @ts-ignore
const allRoutes = routes.find((item) => item.path === '/board')?.children;

const userState = useUser();

type state = 'waiting' | 'agent-accept' | 'agent-refuse' | 'distributing'
const transfer = {
    'waiting': '等待',
    'agent-accept': '代理接受',
    'agent-refuse': '代理拒绝',
    'distributing': '配发',
}
const list = ref({
    waiting: 0,
    'agent-accept': 0,
    'agent-refuse': 0,
    distributing: 0,
})

const fetchState = async () => {
    for (const key of Object.keys(list.value)) {
        request.get(
            '/admin/transition',
            {
                params: {
                    openid: userState.openid,
                    page: 1,
                    pageSize: 10000,
                    state: key
                }
            }
        ).then(res => {
            console.log(res.data.data);

            // 看看数据是否跟新了，如果更新了，就提示一下
            if (list.value[key as state] < res.data.data.length) {
                ElMessage({
                    message: `发现新增了${res.data.data.length - list.value[key as state]}条${transfer[key as state]}订单`,
                    type: 'info'
                })
            }

            // @ts-ignore
            list.value[key] = res.data.data.length;
        })
    }
}
fetchState();
setInterval(fetchState, 10000);

const currentState = ref(['1']);

</script>

<style scoped>
.router-link-item {
    text-decoration: none;
    padding: 5px 10px;
    font-size: 1rem;
    user-select: none;
}

table>tr:nth-child(even) {
    background-color: #f2f2f2;
    padding: 2px 5px;
}

table>* {
    transition: all 200ms ease-in-out;
}

table>*:hover {
    background-color: #f2f2f2;
    font-size: 1.1rem;
}

table {
    margin-top: 4px;
    width: 100%;
    border-collapse: collapse;
    user-select: none;
}
</style>