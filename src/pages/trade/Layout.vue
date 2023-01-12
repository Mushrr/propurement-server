<template>
    <div class="">
        <div class="bg-[#363636] fixed left-0 right-0 w-200px h-100vh flex flex-col justify-between">
            <div>
                <div class="flex flex-row justify-center">
                    <div class="text-center text-white flex flex-row items-center">
                        <div class="i-carbon-box"></div>
                        <div>
                            采购后台系统 v1
                        </div>
                    </div>
                </div>
                <div v-for="route in allRoutes" :key="route.name" class="
            margin-top-10px flex flex-row items-center cursor-pointer hover:bg-gray-200
            border-b-1px border-gray-500
            hover:border-l-2 
            ">
                    <router-link class="router-link-item" :to="'/board/' + route.path">{{ route.title }}</router-link>
                </div>
            </div>
            <ElCard body-style="{ background-color: #363636 }">
                <ElTag type="success">
                    今日待处理信息
                </ElTag>
                <ElTag>
                    正在等待的订单: {{ list.waiting }}
                </ElTag>

                <ElTag>
                    代理接受订单: {{ list["agent-accept"] }}
                </ElTag>

                <ElTag type="danger">
                    代理拒绝订单: {{ list["agent-refuse"] }}
                </ElTag>

                <ElTag>
                    正在配发: {{ list.distributing }}
                </ElTag>
            </ElCard>
        </div>
        <div class="ml-200px h-1000px">
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
    ElBreadcrumb, ElBreadcrumbItem,
    ElMessage, ElCard
} from 'element-plus';
import { Ref, ref, watch } from 'vue'
import request from '../../request';

const currentRoute = useRoute();

// @ts-ignore
const allRoutes = routes.find((item) => item.path === '/board')?.children;

const userState = useUser();

const list = ref({
    waiting: 0,
    'agent-accept': 0,
    'agent-refuse': 0,
    distributing: 0,
})

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
        list.value[key] = res.data.data.length;
    })
}


</script>

<style scoped>
.router-link-item {
    text-decoration: none;
    color: #9ac9ff;
    background-color: #363636;
    padding: 5px 10px;
    width: 100%;
}
</style>