<template>
    {{ checked }}
    {{ showAlignDialog }}
    <div class="flex flex-row justify-center items-center">

        <div class="flex flex-col items-center">
            <el-tag class="">
                订单状态状态
            </el-tag>
            <el-radio-group v-model="state">
                <el-radio-button label="waiting">等待中</el-radio-button>
                <el-radio-button label="agent-accept">代理人已接受</el-radio-button>
                <el-radio-button label="agent-refuse">代理人已拒绝</el-radio-button>
                <el-radio-button label="distributing">正在配发中</el-radio-button>
                <el-radio-button label="user-refuse">用户拒收</el-radio-button>
                <el-radio-button label="finished">完成</el-radio-button>
            </el-radio-group>
            <el-button @click="showAlignDialog = true">委派</el-button>
        </div>
    </div>
    <div v-if="state === 'waiting'">
        <el-checkbox-group v-model="checked">
            <el-table :data="data">
                <el-table-column label="选择">
                    <template #default="scope">
                        <el-checkbox :label="scope.row._id"></el-checkbox>
                    </template>
                </el-table-column>
                <el-table-column label="商品名称" prop="propurename"></el-table-column>
                <el-table-column label="交易单号" prop="transitionId"></el-table-column>
                <el-table-column label="购买者Openid" prop="openid"></el-table-column>
                <el-table-column label="订单配送时间" prop="lastModified"></el-table-column>
                <el-table-column label="单位" width="80">
                    <template #default="scope">
                        <ElTag>
                            {{ scope.row.unit }}
                        </ElTag>
                    </template>
                </el-table-column>
                <el-table-column label="数量" width="80">
                    <template #default="scope">
                        <ElTag>
                            {{ scope.row.number }}
                        </ElTag>
                    </template>
                </el-table-column>
                <el-table-column label="委派">
                    <template #default="scope">
                        <template v-for="agent in agentInfo">
                            <el-tag v-if="agent.openid === scope.row.agentOpenid">
                                {{ agent.organization.company }}
                            </el-tag>
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="价格">
                    <template #default="scope">
                        <div v-for="price in scope.row.lastPrice">
                            <template v-if="price.unit === scope.row.unit">
                                <ElTag>
                                    {{ price.price }}￥ /{{ price.unit }}
                                </ElTag>
                                <ElTag>
                                    总计: {{ (price.price * scope.row.number).toFixed(2) }}￥
                                </ElTag>
                            </template>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="用户备注">
                    <template #default="scope">
                        <div>
                            <ElTag>
                                {{ scope.row.userComment }}
                            </ElTag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="免配送">
                    <template #default="scope">
                        <div>
                            <el-tag v-if="scope.row.isFree" type="danger">
                                免配送
                            </el-tag>
                            <el-tag v-else>
                                正常配送
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label='编辑'>
                    <template #default="scope">
                        <div class="flex flex-row">
                            <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                            <el-button type="danger" @click="handleDelete(scope.row)">删除</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-checkbox-group>
    </div>
    <div
        v-else-if="state === 'agent-accept' || state === 'agent-refuse' || state === 'distributing' || state === 'finished' || state === 'user-refuse'">
        <el-table :data="data">
            <el-table-column label="交易单号" prop="transitionId"></el-table-column>
            <el-table-column label="商品名称" prop="propurename"></el-table-column>
            <el-table-column label="购买者Openid" prop="openid"></el-table-column>
            <el-table-column label="订单配送时间" prop="lastModified"></el-table-column>
            <el-table-column label="数量|单位" width="80">
                <template #default="scope">
                    <ElTag>
                        {{ scope.row.number }} |
                        {{ scope.row.unit }}
                    </ElTag>
                </template>
            </el-table-column>
            <el-table-column label="委派">
                <template #default="scope">
                    <template v-for="agent in agentInfo">
                        <el-tag v-if="agent.openid === scope.row.agentOpenid">
                            {{ agent.organization.company }}
                        </el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="价格">
                <template #default="scope">
                    <div v-for="price in scope.row.lastPrice">
                        <template v-if="price.unit === scope.row.unit">
                            <ElTag>
                                {{ price.price }}￥ /{{ price.unit }}
                            </ElTag>
                            <ElTag>
                                总计: {{ (price.price * scope.row.number).toFixed(2) }}￥
                            </ElTag>
                        </template>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="代理备注" v-if="state !== 'agent-refuse'">
                <template #default="scope">
                    <div>
                        <ElTag v-if="scope.row.agentDetail && scope.row.agentDetail.comment">
                            {{ scope.row.agentDetail.comment }}
                        </ElTag>
                        <ElTag v-else>
                            无
                        </ElTag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="代理报价" v-if="state !== 'agent-refuse'">
                <template #default="scope">
                    <div>
                        <ElTag v-if="scope.row.agentDetail">
                            {{ scope.row.agentDetail.price }}￥/ {{ scope.row.agentDetail.unit }}
                        </ElTag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="预计收益" v-if="state !== 'agent-refuse'">
                <template #default="scope">
                    <div v-if="scope.row.agentDetail && scope.row.agentDetail.unit === scope.row.unit">
                        <div v-for="price in scope.row.lastPrice">
                            <template v-if="price.unit === scope.row.unit">
                                <div v-if="price.price > scope.row.agentDetail.price">
                                    <ElTag type="success">
                                        {{ (Number(price.price - scope.row.agentDetail.price)).toFixed(2) }}￥ /{{ price.unit }}
                                    </ElTag>
                                    <ElTag type="success">
                                        总计: {{ ((Number(price.price - scope.row.agentDetail.price)) *
                                        scope.row.number).toFixed(2) }}￥
                                    </ElTag>
                                </div>
                                <div v-else>
                                    <ElTag type="warning">
                                        {{ (price.price - scope.row.agentDetail.price).toFixed(2) }}￥ /{{ price.unit }}
                                    </ElTag>
                                    <ElTag type="warning">
                                        总计: {{ ((price.price + (- scope.row.agentDetail.price)).toFixed(2) *
                                        scope.row.number).toFixed(2) }}￥
                                    </ElTag>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div v-else>
                        <ElTag type="info">
                            给出的单位与代理人不一致，或者代理人信息缺失
                        </ElTag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="拒绝理由" v-if="state === 'agent-refuse'">
                <template #default="scope">
                    <div>
                        <ElTag v-if="scope.row.agentDetail.comment">
                            {{ scope.row.agentDetail.comment }}
                        </ElTag>
                        <ElTag v-else>
                            无
                        </ElTag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="免配送">
                <template #default="scope">
                    <div>
                        <el-tag v-if="scope.row.isFree" type="danger">
                            免配送
                        </el-tag>
                        <el-tag v-else>
                            正常配送
                        </el-tag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label='编辑'>
                <template #default="scope">
                    <div class="flex flex-row">
                        <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

    </div>
    <el-pagination :total="1000" v-model:current-page="currentPageIndex"></el-pagination>
    <el-dialog v-model="dialogVisible" :before-close="handleClose">
        <template v-if="currentData.info_type === 'edit'">
            <!-- 1. 如果当前是代理人未受理的状态，代理人价格没下来，所以此时只委派就行 -->
            <template v-if="
                state === 'waiting' || state === 'agent-accept' || state === 'agent-refuse' ||
                state === 'distributing' || state === 'finished' || state === 'user-refuse'
            ">
                <el-form :model="waitingData">
                    <el-form-item v-model="waitingData.openid" label="微信Openid">
                        <el-input v-model="waitingData.openid" placeholder="微信Openid" disabled></el-input>
                    </el-form-item>
                    <el-form-item v-model="waitingData.transitionId" label="订单号">
                        <el-input v-model="waitingData.transitionId" placeholder="微信Openid" disabled></el-input>
                    </el-form-item>

                    <el-form-item label="是否是免配送">
                        <el-tag v-if="waitingData.isFree" type="danger">
                            免配送
                        </el-tag>
                        <el-tag v-else>
                            正常配送
                        </el-tag>
                    </el-form-item>
                    <el-form-item label="代理人选择">
                        <el-select v-model="waitingData.agentOpenid">
                            <el-option v-for="agent in agentInfo" :key="agent.openid"
                                :label="agent.organization.company" :value="agent.openid">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="waitingData.state">
                            <el-option v-for="stateVal in stateInfo" :key="stateVal.value" :label="stateVal.label"
                                :value="stateVal.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-model="waitingData.transitionId" label="单位">
                        <el-select v-model="waitingData.unit" @change="changePrice">
                            <el-option v-for="unit in currentPropurement.defaultUnits" :key="unit" :label="unit"
                                :value="unit"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="价格">
                        <el-input type="number" v-model="waitingData.price" placeholder="价格"></el-input>
                    </el-form-item>
                    <el-form-item label="数量">
                        <el-input type="number" v-model="waitingData.number" placeholder="数量"></el-input>
                    </el-form-item>
                    <el-form-item label="提交">
                        <div class="flex flex-row">
                            <el-button type="success" @click="submit">提交</el-button>
                            <el-button type="primary" @click="handleClose">取消</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </template>
        </template>
        <template v-else-if="currentData.info_type === 'del'">
            <div class="text-xl">是否真的要删除
                <el-tag>
                    {{ currentData.data.propurename }}
                </el-tag>
            </div>
            <div class="flex flex-row-reverse items-center">
                <el-button @click="deleteItems(currentData.data)">删除</el-button>
                <el-button @click="handleClose">取消</el-button>
            </div>
        </template>
    </el-dialog>

    <el-dialog v-model="showAlignDialog">
        <div class="flex flex-row justify-center items-center">
            <div>请选择代理人</div>
            <el-select v-model="waitingData.agentOpenid">
                <el-option v-for="agent in agentInfo" :label="agent.organization.company" :value="agent.openid">
                </el-option>
            </el-select>
        </div>
        <div class="flex flex-row">
            <el-button @click="showAlignDialog = false">取消</el-button>
            <el-button @click="listAgent">委派</el-button>
        </div>
    </el-dialog>
</template>

<script lang='ts' setup>
import useUser from '../../states/useUser';
import {
    ElTable, ElTableColumn, ElButton, ElDialog, ElTag, ElDescriptions,
    ElDescriptionsItem, ElSelect, ElOption, ElForm, ElFormItem,
    ElInput, ElPagination, ElRadioGroup, ElRadioButton,
    ElMessage
} from 'element-plus';
import { Ref, ref, watch } from 'vue'
import request from '../../request';

const userState = useUser();

const state = ref("waiting");

interface PurchaseRecord {
    _id: string,
    uuid: string, // 物品UUID, 可以查到代理给出的报价
    transitionId: string, // 交易订单号ID
    openid: string, // 用户的openid
    number: number, // 购买的数量
    unit: string, // 在这里被指定，后台选择单位后，转发到指定代理处
    state?: "uncommitted" | "waiting" | "agent-accept" | "agent-refuse" | "distributing" | "user-refuse" | "finished"
    agentOpenid?: string, // 指定代理人的openid
    userComment?: string, // 用户的评价
    agentComment?: string, // 代理人的评价
    lastPrice: {
        openid: string,
        unit: string,
        price: number
    }[],
    [props: string]: string | number | undefined | { openid: string, unit: string, price: number }[]
}

interface UserItemDetail {
    unit: string, // 单位
    number: number, // 数量
    comment: string | null, // 可以是富文本，也可以是单纯的字符串
}

// 代理的修改意见
interface AgentItemDetail {
    unit: string, // 单位
    number: number,
    agentPrice: number, // 代理给出的价格
    comment: string | null,
}

const data: Ref<PurchaseRecord[]> = ref([]);
const agentInfo: Ref<{
    openid: string,
    organization: {
        company: string
    }
}[]> = ref([]);

const getAgentInfo = () => {
    request.get('/admin/user', {
        params: {
            openid: userState.openid,
            user_type: 'agent'
        }
    }).then(res => {
        agentInfo.value = res.data.data;
    }).catch(err => {
        ElMessage.error(err);
    })
}

getAgentInfo();

const getItemsData = (page = 1, query = {}, success: () => void = () => { }) => {
    request.get(
        '/admin/transition',
        {
            params: {
                openid: userState.openid,
                page: page,
                pageSize: 20,
                ...query
            }
        }
    ).then((res) => {
        console.log(res);
        data.value = res.data.data;
        success();
    }).catch(err => {
        ElMessage.error(err.response.data.message);
    })
}

function getPrice(uuid = "", openid = "", unit = "") {
    return new Promise((resolve, reject) => {
        request.get(
            '/price',
            {
                params: {
                    openid: openid,
                    uuid: uuid,
                    page: 1,
                    pageSize: 100
                }
            }
        ).then(res => {
            resolve(res.data.data);
        }).catch(err => {
            reject(err);
        })
    })
}

const currentPage = ref(1);

const fetchDetail = async () => {
    // 1.请求各个物品的详细信息
    // 2.获取当前用户的价格信息
    // 3.尝试获取代理人信息，如果有agentOpenid的话

    for (let i = 0; i < data.value.length; i++) {
        const item = data.value[i];
        // @ts-ignore
        const page = await getPrice(item.uuid, item.openid, item.unit) as any;
        console.log(page);
        if (page.length > 0) {
            item.lastPrice = page[0].lastPrice;
        } else {
            item.lastPrice = [];
        }
    }
};

watch(currentPage, () => {
    fetchDetail();
})


getItemsData(1, {
    state: state.value
}, () => {
    fetchDetail();
});


watch(state, (newState) => {
    currentPage.value = 1;
    getItemsData(currentPage.value, {
        state: newState
    }, () => {
        fetchDetail();
    });
})


// dialog

const dialogVisible = ref(false);

function handleClose() {


    waitingData.value = {
        uuid: "",
        transitionId: "",
        openid: "",
        number: 0,
        unit: "",
        lastPrice: [],
        state: "",
        agentOpenid: "",
        price: 0,
        isFree: false
    }
    close();
}

function open() {
    if (!dialogVisible.value) {
        dialogVisible.value = true;
    }
}

function close() {
    if (dialogVisible.value) {
        dialogVisible.value = false;
    }
}

// @ts-ignore
const currentData: Ref<
    {
        info_type: "edit" | "del",
        data: any
    }> = ref({
        info_type: "edit",
        data: {}
    })

const waitingData = ref({
    unit: "",
    uuid: "",
    openid: "",
    transitionId: "",
    state: "",
    price: 0,
    agentOpenid: "",
    isFree: false,
    lastPrice: [{
        openid: "",
        unit: "",
        price: 0,
    }],
    number: 0,
})


// @ts-ignore
function handleDelete(row) {
    currentData.value.info_type = "del";
    currentData.value.data = row
    open();
}

// @ts-ignore
function handleEdit(row) {

    waitingData.value.unit = row.unit;
    waitingData.value.uuid = row.uuid;
    waitingData.value.openid = row.openid;
    waitingData.value.agentOpenid = row.agentOpenid || "",
        waitingData.value.transitionId = row.transitionId;
    waitingData.value.number = row.number;
    waitingData.value.lastPrice = row.lastPrice;
    waitingData.value.state = row.state;
    waitingData.value.isFree = row.isFree || false;

    currentData.value.info_type = "edit";
    changePrice()
    getCurrentPropurement(row.uuid);
    open();
}

// @ts-ignore
const currentPropurement: Ref<{
    defaultUnits: string[],
    [props: string]: any
}> = ref({});
// @ts-ignore
function getCurrentPropurement(uuid) {
    request.get(
        '/admin/propurement',
        {
            params: {
                openid: userState.openid,
                page: 1,
                pageSize: 100,
                uuid: uuid
            }
        }
    ).then(res => {
        if (res.data.data.length !== 1) {
            ElMessage.warning('获取物品信息错误！！长度大于2');
        } else {
            currentPropurement.value = res.data.data[0];
        }
    })
}


function changePrice() {
    console.log(waitingData.value.unit);
    for (let unit of waitingData.value.lastPrice) {
        if (unit.unit === waitingData.value.unit) {
            waitingData.value.price = unit.price;
        }
    }
}

type AnyObject = {
    [prop: string]: any
};

function submit() {

    if (waitingData.value.uuid === '' || waitingData.value.number === 0 ||
        waitingData.value.price === 0 || waitingData.value.unit === '') {
        ElMessage.warning('请填写必要的信息 [单位，数量，价格，物品]');
        return;
    } else {
        const transitionData: AnyObject = {
            openid: waitingData.value.openid,
            number: waitingData.value.number,
            unit: waitingData.value.unit,
            state: waitingData.value.state,
            price: waitingData.value.price
        }

        if (waitingData.value.agentOpenid !== '') {
            transitionData.agentOpenid = waitingData.value.agentOpenid;
        }

        request.post(
            '/admin/transition',
            {
                openid: userState.openid,
                transitionId: waitingData.value.transitionId,
                query: {
                    uuid: waitingData.value.uuid,
                },
                transition: transitionData
            }
        ).then(res => {
            ElMessage.success('提交成功');
            handleClose();
            getItemsData(currentPage.value, {
                state: state.value
            }, () => {
                fetchDetail();
            });
        }).catch(err => {
            ElMessage.error(err.response.data.message);
        })


        // 价格修改
        request.post(
            '/price',
            {
                openid: waitingData.value.openid,
                uuid: waitingData.value.uuid,
                unit: waitingData.value.unit,
                price: waitingData.value.price
            }
        ).then((res) => {
            console.log(res);
            ElMessage.success('价格添加/修改成功');
        }).catch(err => {
            ElMessage.error(err.response.data.message);
        })
    }
}

const currentPageIndex = ref(1);
watch(currentPageIndex, (nv) => {
    getItemsData(currentPageIndex.value, {
        state: state.value
    }, () => {
        fetchDetail();
    });
})


const stateInfo = ref([
    {
        value: "waiting",
        label: "待处理"
    },
    {
        value: "agent-accept",
        label: "代理已接受"
    },
    {
        value: "agent-refuse",
        label: "代理已拒绝"
    },
    {
        value: "distributing",
        label: "正在配发"
    },
    {
        value: "user-refuse",
        label: "用户拒绝"
    },
    {
        value: "finished",
        label: "已完成"
    }
])


function deleteItems(data: PurchaseRecord) {
    request.delete(
        '/admin/history',
        {
            params: {
                openid: userState.openid,
                uuid: data.uuid,
                transitionId: data.transitionId,
                userOpenid: data.openid
            }
        }
    ).then(res => {
        if (res.data.code === 200) {
            ElMessage.success(`删除${data.propurename}成功!`);
        } else {
            ElMessage.error("删除失败!");
        }
        handleClose();
        getItemsData(currentPage.value, {
            state: state.value
        }, () => {
            fetchDetail();
        });
    })
}

const checked: Ref<string[]> = ref([]);
const showAlignDialog = ref(false);
const alignItem = () => { }

function handleCheckAllChange(row: any) {
    // @ts-ignore
    checked.value.push(row);
}

function listAgent() {
    const transitionData = [];
    for (const item of checked.value) {
        for (const cur of data.value) {
            if (cur._id === item) {
                transitionData.push({
                    openid: cur.openid,
                    number: cur.number,
                    unit: cur.unit,
                    uuid: cur.uuid,
                    state: cur.state,
                    price: cur.price,
                    agentOpenid: waitingData.value.agentOpenid,
                    transitionId: cur.transitionId
                })
                break;
            }
        }
    }
    const allPromise = [];
    for (const item of transitionData) {
        console.log(item);
        const pro = request.post(
            '/admin/transition',
            {
                openid: userState.openid,
                transitionId: item.transitionId,
                query: {
                    uuid: item.uuid,
                },
                transition: item
            }
        ).then(res => {
            ElMessage.success('提交成功');
            handleClose();
            getItemsData(currentPage.value, {
                state: state.value
            }, () => {
                fetchDetail();
            });
        }).catch(err => {
            ElMessage.error(err.response.data.message);
        })

        allPromise.push(pro);
    }

    const allPromiseWaiting = Promise.all(allPromise);
    allPromiseWaiting.finally(() => {
        showAlignDialog.value = false;
        checked.value = [];
    })
}

</script>

<style scoped>

</style>