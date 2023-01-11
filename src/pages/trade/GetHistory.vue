<template>
    <el-form class="flex flex-row p-2 " :model="querySchema">
        <el-form-item label="用户">
            <el-select v-model="querySchema.userOpenid">
                <el-option key="" label="未选择" value=""></el-option>
                <el-option v-for="user in userInfo" :key="user.openid" :label="user.organization?.company"
                    :value="user.openid"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="代理商">
            <el-select v-model="querySchema.agentOpenid">
                <el-option key="" label="未选择" value=""></el-option>
                <el-option v-for="agent in agentInfo" :key="agent.openid" :label="agent.organization?.company"
                    :value="agent.openid"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
            <el-date-picker v-model="querySchema.start" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
            <el-date-picker v-model="querySchema.end" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="页">
            <el-input type="number" v-model="pageIndex"></el-input>
        </el-form-item>
        <el-form-item label="页大小">
            <el-input type="number" v-model="pageSize"></el-input>
        </el-form-item>
        <el-form-item label="导出Excel">
            <el-button @click="extractAsExcel">导出</el-button>
        </el-form-item>
    </el-form>
    <el-table :data="data">
        <el-table-column label="订单号" prop="transitionId" width="200">
        </el-table-column>
        <el-table-column label="购买者" width="100">
            <template #default="scope">
                <ElTag v-if="scope.row.buyer">
                    {{ scope.row.buyer.organization.company }}({{ scope.row.buyer.organization.principal }})
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="商品名称" width="100">
            <template #default="scope">
                <ElTag v-if="scope.row.propurement">
                    {{ scope.row.propurement.name }}
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="类别" width="100">
            <template #default="scope">
                <ElTag v-if="scope.row.propurement" v-for="category in scope.row.propurement.category">
                    {{ category }}
                </ElTag>
            </template>
        </el-table-column>

        <el-table-column label="单位" width="100">
            <template #default="scope">
                <ElTag>
                    {{ scope.row.unit }}
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="数量" width="100">
            <template #default="scope">
                <ElTag>
                    {{ scope.row.number }}
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="代理人报价" width="100">
            <template #default="scope">
                <ElTag v-if="scope.row.agentDetail">
                    {{ scope.row.agentDetail.price }}￥ / {{ scope.row.agentDetail.unit }}
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="我方报价" width="100">
            <template #default="scope">
                <ElTag>
                    {{ scope.row.price }}￥/ {{ scope.row.unit }}
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="预计盈利" width="100">
            <template #default="scope">
                <div v-if="scope.row.agentDetail">
                    <ElTag type="danger" v-if="scope.row.agentDetail.price > scope.row.price">
                        {{ ((scope.row.price - scope.row.agentDetail.price) * scope.row.number).toFixed(2) }}￥
                    </ElTag>
                    <ElTag type="success" v-else>
                        {{ ((scope.row.price - scope.row.agentDetail.price) * scope.row.number).toFixed(2) }}￥
                    </ElTag>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="代理人信息">
            <template #default="scope">
                <ElTag v-if="scope.row.agent">
                    {{ scope.row.agent.organization.company }}({{ scope.row.agent.organization.principal }})
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="购买时间">
            <template #default="scope">
                <ElTag>
                    {{ new Date(scope.row.lastModified).toLocaleString() }}
                </ElTag>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageIndex" :total="1000">
    </el-pagination>
</template>

<script lang='ts' setup>
import useUser from '../../states/useUser';
import {
    ElTable, ElTableColumn, ElButton, ElDialog, ElTag, ElDescriptions,
    ElDescriptionsItem, ElSelect, ElOption, ElForm, ElFormItem,
    ElInput, ElPagination, ElRadioGroup, ElRadioButton,
    ElMessage, ElDatePicker
} from 'element-plus';
import { Ref, ref, watch } from 'vue'
import request from '../../request';
import * as xlsx from 'xlsx'

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
const userState = useUser();
const pageSize = ref(10);

const userInfo: Ref<UserInfo[]> = ref([]);
const agentInfo: Ref<UserInfo[]> = ref([]);
const getUserInfo = (userType: 'user' | 'agent' | 'admin' = 'user', query = {}) => {
    return request.get(
        '/admin/user',
        {
            params: {
                openid: userState.openid,
                user_type: userType,
                page: 1,
                pageSize: 10000,
                ...query
            }
        }
    )
}

getUserInfo().then(res => {
    userInfo.value = res.data.data;
    console.log(res);
})

getUserInfo('agent').then(res => {
    agentInfo.value = res.data.data;
    console.log(res);
})

interface QuerySchema {
    userOpenid?: string;
    agentOpenid?: string;
    start?: string;
    end?: string;
    category?: string;
}

interface PurchaseRecord {
    uuid: string, // 物品UUID, 可以查到代理给出的报价
    transitionId: string, // 交易订单号ID
    openid: string, // 用户的openid
    number: number, // 购买的数量
    unit: string, // 在这里被指定，后台选择单位后，转发到指定代理处
    state?: "uncommitted" | "waiting" | "agent-accept" | "agent-refuse" | "distributing" | "finished"
    agentOpenid?: string, // 指定代理人的openid
    userComment?: string, // 用户的评价
    agentComment?: string, // 代理人的评价
    lastPrice: {
        openid: string,
        unit: string,
        price: number
    }[],
    [props: string]: string | number | undefined | AnyObject | AnyObject[] | { openid: string, unit: string, price: number }[]
}

const pageIndex = ref(1);

const querySchema: Ref<QuerySchema> = ref({});


type AnyObject = {
    [propName: string]: any
}

const data: Ref<PurchaseRecord[]> = ref([]);

watch(querySchema.value, (newVal, oldVal) => {
    pageIndex.value = 1; // 重置
    const queryObj: AnyObject = {};
    for (const [key, value] of Object.entries(querySchema.value)) {
        if (value === '') {
            continue;
        } else {
            queryObj[key] = value;
        }
    }

    request.get(
        '/admin/history',
        {
            params: {
                openid: userState.openid,
                ...queryObj,
                page: pageIndex.value,
            }
        }
    ).then(res => {
        data.value = res.data.data;
    }).catch(err => {
        ElMessage.error(err.response.data.message);
    })
})

request.get(
    '/admin/history',
    {
        params: {
            openid: userState.openid,
            page: pageIndex.value,
        }
    }
).then(res => {
    data.value = res.data.data;
}).catch(err => {
    ElMessage.error(err.response.data.message);
})

watch(pageIndex, (newVal, oldVal) => {
    const queryObj: AnyObject = {};
    for (const [key, value] of Object.entries(querySchema.value)) {
        if (value === '') {
            continue;
        } else {
            queryObj[key] = value;
        }
    }

    request.get(
        '/admin/history',
        {
            params: {
                openid: userState.openid,
                ...queryObj,
                page: pageIndex.value,
            }
        }
    ).then(res => {
        data.value = res.data.data;
        ElMessage.success(res.data.message);
    }).catch(err => {
        ElMessage.error(err.response.data.message);
    })
})


function getPrice(uuid = "", openid = "", unit = "") {
    return request.get(
        '/price',
        {
            params: {
                openid: openid,
                uuid: uuid,
                page: 1,
                pageSize: pageSize.value
            }
        }
    )
}

// 物品信息, 获取物品的种类

const getPorpurement = (uuid: string) => {
    return request.get(
        '/propurement',
        {
            params: {
                openid: userState.openid,
                page: 1,
                pageSize: pageSize.value,
                uuid: uuid
            }
        }
    )
}

const bindItemData = async (item) => {
    const buyerInfo = (await getUserInfo('user', { userOpenid: item.openid })).data.data as AnyObject;
    if (buyerInfo.length === 1) {
        item.buyer = buyerInfo[0];
    } else {
        item.buyer = {
            openid: "未知", organization: {
                company: "未知",
                principal: "未知",
                department: "未知",
                position: "未知",
                phone_number: "未知"
            }
        }
    }
    console.log(item);
    // 代理信息
    const agentInfo = (await getUserInfo('agent', { userOpenid: item.agentOpenid })).data.data as AnyObject;
    if (agentInfo.length === 1) {
        item.agent = agentInfo[0];
    } else {
        ElMessage.error(`获取${item.agentOpenid}信息失败`);
        item.agent = {
            openid: "未知", organization: {
                company: "未知",
                principal: "未知",
                department: "未知",
                position: "未知",
                phone_number: "未知"
            }
        }
    }

    // 物品信息

    const propurementInfo = (await getPorpurement(item.uuid)).data.data[0] || {};
    item.propurement = propurementInfo || {
        uuid: "未知",
        name: "未知",
        unit: "未知",
        price: 0,
        category: "未知",
        openid: "未知",
        lastPrice: []
    };
}

watch(() => data.value, async (newVal, oldVal) => {
    for (const item of newVal) {
        bindItemData(item);
    }
})

function exportExcel(data: any, name: string) {
    const workbook = xlsx.utils.book_new();

    const sheetData = data.map((el: any) => {
        return {
            "交易单号": el.transitionId,
            "购买者": `${el.buyer.organization.company}(${el.buyer.organization.principal})`,
            "商品名称": el.propurename,
            "商品类型": el.propurement.category,
            "单位": el.unit,
            "数量": el.number,
            "价格": `${el.price}￥/${el.unit}`,
            "购买时间": new Date(el.lastModified).toLocaleString()
        }
    })
    type AnyObject = {
        [prop: string]: any
    }

    const base: AnyObject = {};

    for (const key of Object.keys(sheetData[0])) {
        base[key] = 0;
    }

    for (const row of sheetData) {
        for (const key of Object.keys(row)) {
            // @ts-ignore
            base[key] = Math.max(base[key], row[key].toString().length, key.length) * 1.1;
        }
    }
    const columns = []

    for (const key of Object.keys(base)) {
        columns.push({
            wch: base[key]
        })
    }
    const sheet = xlsx.utils.json_to_sheet(sheetData);
    sheet["!cols"] = columns;

    xlsx.utils.book_append_sheet(workbook, sheet);
    xlsx.writeFileXLSX(workbook, `${name}`);
}


// 提取excel的函数
async function extractAsExcel() {
    const query: AnyObject = {};
    for (const [key, value] of Object.entries(querySchema.value)) {
        if (value !== '') {
            query[key] = value;
        }
    }

    let page = 1;
    let data = [];
    do {
        const res = await request.get(
            '/admin/history',
            {
                params: {
                    openid: userState.openid,
                    page: page,
                    pageSize: pageSize.value,
                    ...query
                }
            }
        );
        data = res.data.data;
        for (const item of data) {
            await bindItemData(item);
        }
        let name = `交易记录-${page}.xlsx`;
        if (querySchema.value.end && querySchema.value.start) {
            name = `交易记录-${querySchema.value.start}-${querySchema.value.end}.xlsx`;
        } else if (querySchema.value.start) {
            name = `交易记录-${querySchema.value.start}.xlsx`;
        }


        if (querySchema.value.userOpenid) {
            name = `${data[0].buyer.organization.company}-${name}`
        }
        await exportExcel(data, name);
        page++;
    } while (data.length !== 0);
}


</script>

<style scoped>

</style>