<template>
    <el-form class="flex flex-row p-2 flex-wrap " :model="querySchema">
        <el-form-item label="状态">
            <el-select v-model="querySchema.state">
                <el-option key="1" label="等待中" value="waiting"></el-option>
                <el-option key="2" label="代理接收" value="agent-accept"></el-option>
                <el-option key="3" label="代理拒绝" value="agent-refuse"></el-option>
                <el-option key="4" label="配送中" value="distributing"></el-option>
                <el-option key="5" label="用户拒绝" value="user-refuse"></el-option>
                <el-option key="6" label="完成" value="finished"></el-option>
            </el-select>
        </el-form-item>
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
        <el-form-item label="是否是免配送">
            <el-select v-model="querySchema.isFree">
                <el-option key="" label="未选择" :value="''"></el-option>
                <el-option key="true" label="是" :value="true"></el-option>
                <el-option key="false" label="否" :value="false"></el-option>
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
        <el-form-item label="表格类型">
            <el-select v-model="querySchema.excelType">
                <el-option key="1" label="月数据" value="月数据" default></el-option>
                <el-option key="2" label="表单" value="表单"></el-option>
                <el-option key="3" label="财务系统表" value="财务系统表"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="发票单位">
            <el-select v-model="querySchema.company">
                <el-option v-for="user in userInfo" :key="user.openid" :value="user.organization?.company!"
                    :label="user.organization?.company"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="单号">
            <el-input v-model="tradeId" type="number"></el-input>
        </el-form-item>
        <el-form-item label="订单号">
            <el-select v-model="querySchema.transitionId">
                <div v-if="data.length > 0 && data[0].buyer">
                    <el-option key="" value="" label="未选择"></el-option>
                    <el-option
                        v-for="transition in new Set(data.map((e: PurchaseRecord) => { return e.transitionId + '|' + e.buyer.organization.company }))"
                        :key="transition" :value="transition.split('|')[0]" :label="transition"></el-option>
                </div>
            </el-select>
        </el-form-item>
        <el-form-item label="采购人">
            <el-input v-model="principal" type="string"></el-input>
        </el-form-item>
        <el-form-item label="导出Excel">
            <el-button @click="extractAsExcel">导出</el-button>
        </el-form-item>
        <el-form-item class="ml-2">
            <el-button @click="showUsage = true">用法说明</el-button>
        </el-form-item>
    </el-form>
    <el-table :data="data">
        <el-table-column label="订单号" prop="transitionId" width="200">
        </el-table-column>
        <el-table-column label="购买者" width="100">
            <template #default="scope">
                <ElTag v-if="scope.row.buyer">
                    {{ scope.row.buyer.organization.company }}
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
                    {{ scope.row.agent.organization.company }}
                </ElTag>
            </template>
        </el-table-column>
        <el-table-column label="免配送订单">
            <template #default="scope">
                <ElTag v-if="scope.row.isFree" type="danger">
                    免配送
                </ElTag>
                <ElTag v-else>
                    正常配送
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

    <el-dialog v-model="showUsage">
        <usage></usage>
    </el-dialog>
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
import monthSummaryExcel from '../../excel/monthSummaryExcel';
import monthGroupExcel from '../../excel/monthGroupExcel';
import save from '../../excel/save';
import { xhyTrade, XLSX, xhyStyle } from '../../excel/excel';
import Usage from '../../components/Usage.vue'

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
const pageSize = ref(13);

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
    transitionId?: string;
    start?: string;
    state?: "waiting" | "agent-accept" | "agent-refuse" | "distributing" | "user-refuse" | "finished"
    end?: string;
    category?: string;
    isFree?: boolean,
    company: string,
    excelType: "月数据" | "表单" | "财务系统表"
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
        if (value === '' || key === 'excelType' || key === 'company') {
            continue
        } else {
            queryObj[key] = value;
        }
    }

    console.log(queryObj);
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

watch(pageIndex, (newVal, oldVal) => {
    const queryObj: AnyObject = {};
    for (const [key, value] of Object.entries(querySchema.value)) {
        if (value === '' || key === 'excelType' || key === 'company') {
            continue
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

const getPorpurement = (uuid: string | string[]) => {
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

// v1
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
    } else if (Boolean(item.isFree)) {
        item.agent = {
            openid: "未知", organization: {
                company: "未知",
                principal: "未知",
                department: "未知",
                position: "未知",
                phone_number: "未知"
            }
        }
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

// bindItem v2

const bindItemList = async (itemList: PurchaseRecord[]) => {
    const allUserOpenid = itemList.map(item => item.openid);
    const allAgentOpenid = itemList.map(item => item.agentOpenid);
    const allUUID = itemList.map(item => item.uuid);

    const allUsers = (await getUserInfo('user', { userOpenid: allUserOpenid })).data.data || [];
    const allAgents = (await getUserInfo('agent', { userOpenid: allAgentOpenid })).data.data || [];
    const allPropurements = (await getPorpurement(allUUID)).data.data || [];


    for (const item of itemList) {
        // user
        let userFind = false;
        let agentFind = false;
        let propurementFind = false;
        for (const user of allUsers) {

            if (user.openid === item.openid) {
                item.buyer = user;
                userFind = true;
                break;
            }
        }

        for (const agent of allAgents) {

            if (agent.openid === item.agentOpenid) {
                item.agent = agent;
                agentFind = true;
                break;
            }
        }

        for (const propurement of allPropurements) {

            if (propurement.uuid === item.uuid) {
                item.propurement = propurement;
                propurementFind = true;
                break;
            }
        }

        if (!userFind) {
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

        if (!agentFind) {
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

        if (!propurementFind) {
            item.propurement = {
                uuid: "未知",
                name: "未知",
                unit: "未知",
                price: 0,
                category: "未知",
                openid: "未知",
                lastPrice: []
            }
        }
    }

}

const principal = ref('');

watch(() => data.value, async (newVal, oldVal) => {
    bindItemList(newVal);
})

const tradeId = ref(1);

function exportExcel(data: any, name: string, page: number) {
    let book = null;
    switch (querySchema.value.excelType) {
        case "月数据":
            book = monthSummaryExcel(data);
            save(book, `${name}`);
            break;
        case "表单":
            if (querySchema.value.company) {
                const arrayData = xhyTrade(data, tradeId.value, page, new Date(data[0].lastModified), querySchema.value.company, principal.value);
                const sheet = xhyStyle(XLSX.utils.aoa_to_sheet(arrayData));
                const book = XLSX.utils.book_new();

                XLSX.utils.book_append_sheet(book, sheet, '订单');

                save(book, `${name}`);
            } else {
                ElMessage.error("请选择开票单位");
            }
            break;
        case "财务系统表":
            book = monthGroupExcel(data);
            save(book, `${name}`);
            ElMessage.success('导出成功');
            break;
        default:
            ElMessage.warning("请选择导出表格的类型");
            break
    }
}


// 提取excel的函数
async function extractAsExcel() {
    const query: AnyObject = {};
    for (const [key, value] of Object.entries(querySchema.value)) {
        console.log(key);
        if (value !== '' && key !== 'excelType' && key !== 'company') {
            query[key] = value;
        }
    }

    let page = 1;
    let data = [];
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
    while (data.length !== 0) {

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
        await exportExcel(data, name, page);
        page++;


        data = (await request.get(
            '/admin/history',
            {
                params: {
                    openid: userState.openid,
                    page: page,
                    pageSize: pageSize.value,
                    ...query
                }
            }
        )).data.data;
    }
}

const showUsage = ref(false);


</script>

<style scoped>

</style>