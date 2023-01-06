<template>
    <el-table :data="data">
        <template v-for="col in columns" :key="col.label">
            <el-table-column :prop="col.prop" :label="col.label">
                <template #default="scope" v-if="col.label === '修改'">
                    <div class="flex flex-row">
                        <el-button type="info" @click="detail(data[scope.$index])">查看</el-button>
                        <el-button type="primary" @click="change(data[scope.$index])">修改</el-button>
                    </div>
                </template>
                <template #default="scope" v-if="col.label === '用户类型'">
                    <el-tag type="" v-if="data[scope.$index].user_type === 'admin'">
                        管理员
                    </el-tag>
                    <el-tag type="success" v-else-if="data[scope.$index].user_type === 'user'">
                        用户
                    </el-tag>
                    <el-tag type="warning" v-else-if="data[scope.$index].user_type === 'agent'">
                        代理商
                    </el-tag>
                    <el-tag type="danger" v-else>
                        未知
                    </el-tag>
                </template>
            </el-table-column>
        </template>
    </el-table>
    <el-pagination :total="1000" v-model:current-page="userPageIndex"></el-pagination>

    <el-dialog v-model="dialogVisible" :before-close="handleClose" width="90%">
        <template v-if="dialogData.dialogType === 'info'">
            <ElDescriptions title="用户个人信息">
                <ElDescriptionsItem label="微信Openid">
                    {{ dialogData.data.openid }}
                </ElDescriptionsItem>

                <ElDescriptionsItem label="Session编号">
                    {{ dialogData.data.session_key }}
                </ElDescriptionsItem>

                <ElDescriptionsItem label="用户类型">
                    <el-tag type="" v-if="dialogData.data.user_type === 'admin'">
                        管理员
                    </el-tag>
                    <el-tag type="success" v-else-if="dialogData.data.user_type === 'user'">
                        用户
                    </el-tag>
                    <el-tag type="warning" v-else-if="dialogData.data.user_type === 'agent'">
                        代理商
                    </el-tag>
                    <el-tag type="danger" v-else>
                        未知
                    </el-tag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="公司">
                    {{ dialogData.data.organization.company }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="代理人">
                    {{ dialogData.data.organization.principal }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="地址">
                    {{ dialogData.data.organization.position }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="电话">
                    {{ dialogData.data.organization.phone_number }}
                </ElDescriptionsItem>
            </ElDescriptions>
            <ElDescriptions title="历史价格">
                <ElDescriptionsItem label="点击获取用户历史价格信息">
                    <el-form>
                        <el-form-item label="获取">
                            <el-button type="primary" @click="getHistoryPrice">获取</el-button>
                        </el-form-item>
                    </el-form>
                    <div class="flex flex-row">
                        <el-input v-model="filterStr" @keypress.enter="filterFunc"></el-input>
                        <el-button @click="filterFunc">过滤</el-button>
                    </div>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="历史价格">
                    <el-table :data="historyPriceData">
                        <el-table-column prop="name" label="物品名称" width="100">
                        </el-table-column>
                        <el-table-column prop="category" label="类别" width="100">
                            <template #default="scope">
                                <el-tag type="success">
                                    {{ scope.row.category }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="defaultUnits" label="常见单位" width="100">
                            <template #default="scope">
                                <el-tag type="success" v-for="unit in scope.row.defaultUnits" :key="unit">
                                    {{ unit }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="lastPrice" label="价格">
                            <template #default="scope">
                                <el-tag>
                                    <el-tag type="success" v-for="price in scope.row.lastPrice">
                                        {{ price.price }}元/{{ price.unit }}
                                    </el-tag>
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="添加价格记录" width="100">
                            <template #default="scope">
                                <el-button type="primary" @click="addPriceRecord(scope.row)">添加</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination :total="1000" v-model:current-page="currentProPageIndex"></el-pagination>
                </ElDescriptionsItem>
            </ElDescriptions>


            <el-dialog v-model="addUnitDialogVisible">
                <el-form :model="changeUnitData">
                    <el-form-item label="单位">
                        <el-select v-model="changeUnitData.unit" placeholder="请选择单位" size="large">
                            <el-option v-for="unit in currentRow.defaultUnits" :key="unit" :label="unit"
                                :value="unit"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="价格">
                        <el-input type="number" v-model="changeUnitData.price" placeholder="请输入价格"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="changeUnit">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </template>
        <template v-else-if="dialogData.dialogType === 'change'">
            <!-- 修改用户个人信息 -->
            <el-form :model="changeData" label-width="100px">
                <el-form-item label="微信Openid">
                    <el-input disabled v-model="changeData.openid" placeholder="请输入微信Openid"></el-input>
                </el-form-item>
                <el-form-item label="Session编号">
                    <el-input disabled v-model="changeData.session_key" placeholder="请输入Session编号"></el-input>
                </el-form-item>
                <el-form-item label="用户类型">
                    <el-select v-model="changeData.user_type" placeholder="请选择用户类型">
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="用户" value="user"></el-option>
                        <el-option label="代理商" value="agent"></el-option>
                        <el-option label="未知" value="unknown"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="公司">
                    <el-input v-model="changeData.organization.company" placeholder="请输入公司名称"></el-input>
                </el-form-item>
                <el-form-item label="代理人">
                    <el-input v-model="changeData.organization.principal" placeholder="请输入代理人名称"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="changeData.organization.position" placeholder="请输入地址"></el-input>
                </el-form-item>
                <el-form-item label="电话">
                    <el-input v-model="changeData.organization.phone_number" placeholder="请输入电话"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="changeUserData">提交</el-button>
                </el-form-item>
            </el-form>
        </template>
    </el-dialog>
</template>

<script lang='ts' setup>
// 用户信息模块

import useUser from '../../states/useUser';
import {
    ElTable, ElTableColumn, ElButton, ElDialog, ElTag, ElDescriptions,
    ElDescriptionsItem, ElSelect, ElOption, ElForm, ElFormItem,
    ElInput, ElPagination,
    ElMessage
} from 'element-plus';
import { Ref, ref, watch } from 'vue'
import request from '../../request';
const userState = useUser();
type UserType = "admin" | "agent" | "user" | null;


interface UserInfo {
    openid: string;
    session_key: string;
    user_type?: UserType;
    organization?: {
        company: string;
        department: string;
        position: string;
        phone_number: string;
        principal: string;
    };
}

let data: Ref<UserInfo[]> = ref([]);

const columns = [
    {
        prop: 'openid',
        label: '微信Openid'
    },
    {
        label: '用户类型'
    },

    {
        prop: 'organization.company',
        label: '公司名称'
    },
    {
        prop: 'organization.position',
        label: '地址'
    },
    {
        prop: 'organization.principal',
        label: "复杂人"
    },
    {
        prop: 'organization.phone_number',
        label: '电话号码'
    },
    {
        label: "修改"
    }
]

// @ts-ignore
const dialogData: Ref<{
    dialogType: "info" | "change" | "delete"
    data: UserInfo | any
}> = ref({
    dialogType: "info",
    data: {}
})

const userPageIndex = ref(1);

const getUser = (page = 1) => {
    request.get(
        '/admin/user',
        {
            params: {
                page,
                pageSize: 10,
                openid: userState.openid
            }
        }
    ).then((res) => {
        data.value = res.data.data;
        console.log(res);
    })
}

watch(userPageIndex, (v) => {
    getUser(v);
})

getUser();


const dialogVisible = ref(false);

function open() {
    if (!dialogVisible.value) {
        dialogVisible.value = true;
    }
}

function close() {
    if (dialogVisible.value) {
        dialogVisible.value = false;
    }
    historyPriceData.value = [];
}

function detail(row) {
    dialogData.value.dialogType = "info";
    dialogData.value.data = row;

    open();
}

function change(row) {
    dialogData.value.dialogType = "change";
    dialogData.value.data = row;

    // 在这里修改哦
    changeData.value.openid = row.openid;
    changeData.value.user_type = row.user_type;
    changeData.value.session_key = row.session_key;
    changeData.value.organization.company = row.organization.company;
    changeData.value.organization.department = row.organization.department;
    changeData.value.organization.position = row.organization.position;
    changeData.value.organization.phone_number = row.organization.phone_number;
    changeData.value.organization.principal = row.organization.principal;

    open();
    console.log(row);
}

function del(row) {
    dialogData.value.dialogType = "delete";
    dialogData.value.data = row;
    open();
    console.log(row);
}

function handleClose() {

    close();
}


const getHistoryPriceFunc = (page = 1) => {
    request.get(
        '/price',
        {
            params: {
                openid: dialogData.value.data.openid,
                page,
                pageSize: 100
            }
        }
    ).then((res) => {
        historyPriceData.value = res.data.data;
        console.log(res);
    })
}

const historyPriceData = ref([]);
const currentProPageIndex = ref(1);
function getHistoryPrice() {
    console.log("这里");
    getHistoryPriceFunc();
}
watch(currentProPageIndex, (v) => {
    getHistoryPriceFunc(v);
})


const addUnitDialogVisible = ref(false);
const currentRow: Ref<{
    defaultUnits: string[];
    lastPrice: number;
    uuid: string
}> = ref({
    defaultUnits: [],
    lastPrice: 0,
    uuid: ""
});
const changeUnitData = ref({
    unit: '',
    price: 0
})
function addPriceRecord(data) {
    addUnitDialogVisible.value = true;
    currentRow.value = data;
    console.log(data);
}
function changeUnit() {
    if (changeUnitData.value.unit === '' || changeUnitData.value.price <= 0) {
        // 重置
        changeUnitData.value = {
            unit: '',
            price: 0
        }
        addUnitDialogVisible.value = false;
        return;
    } else {
        console.log(dialogData.value, "在这里!!!!!!!!!!!!!!!!!!");
        request.post(
            '/price',
            {
                openid: dialogData.value.data.openid,
                uuid: currentRow.value.uuid,
                unit: changeUnitData.value.unit,
                price: changeUnitData.value.price
            }
        ).then((res) => {
            console.log(res);
            addUnitDialogVisible.value = false;
            changeUnitData.value = {
                unit: '',
                price: 0
            }
            ElMessage.success('添加/修改成功');
            getHistoryPrice();
        }).catch(err => {
            ElMessage.error('添加/修改失败', err);
            close();
        })
    }
}




const changeData = ref({
    openid: "",
    user_type: "",
    session_key: "",
    organization: {
        company: '',
        department: '',
        position: '',
        phone_number: '',
        principal: ''
    }
})

function changeUserData() {
    // 修改用户信息
    request.post(
        '/admin/user',
        {
            openid: userState.openid,
            userInfo: changeData.value
        }
    ).then(res => {
        console.log(res);
        ElMessage.success('修改成功');
        getUser();
        close();
    }).catch(err => {
        ElMessage.error('修改用户信息错误');
        console.log(err);
        close();
    })
}


const filterStr = ref('');
let hasSearch = false;
let historyData = []
const filterFunc = () => {
    if (hasSearch) {
        hasSearch = true;
        historyData = historyPriceData.value
    }
    if (filterStr.value === '') {
        // @ts-ignore
        historyPriceData.value = historyData;
        hasSearch = false;
    } else {
        historyPriceData.value = historyPriceData.value.filter((e) => {
            return e.name.indexOf(filterStr.value) !== -1;
        })
    }
}
</script>

<style scoped>

</style>