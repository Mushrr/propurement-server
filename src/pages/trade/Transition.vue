<template>
    <div flex flex-row items-center mb-2>
        <ElButton @click="refresh" class="inline-block w-10 rounded-full">
            <div i-carbon-renew></div>
        </ElButton>
        <ElButton @click="exportMoreOverlay = true">
            合并导出(请确保要合并的订单之间的单位单价一致)
        </ElButton>
    </div>

    <el-checkbox-group v-model="transitionsSelected">
        <el-row :gutter="20">
            <el-col v-for="(o, index) in TransitionInfo.sort(
                (l, r) => { return new Date(l.lastModified).getTime() - new Date(r.lastModified).getTime() }
            )" :key="o.transitionId" :span="colSpan" class="mt-3">
                <el-card v-if="o.items.length > 0" :body-style="{ padding: '0px', height: '200px', overflow: 'scroll' }">
                    <template #header>
                        <div>
                            <el-checkbox :label="o.transitionId">
                                {{ o.user.organization?.company + transformTime(new Date(o.lastModified)) }}
                            </el-checkbox>
                            <div flex flex-row items-center justify-between flex-wrap pt-2>
                                <div flex flex-row items-center>
                                    <div i-carbon-user text-xl></div>
                                    <div flex flex-row items-center flex-wrap>
                                        <ElTag>
                                            <div text-xl>
                                                {{ o.user.organization?.company }}
                                            </div>
                                        </ElTag>
                                        <div i-carbon-location></div>
                                        <ElTag>
                                            <div text-xl>
                                                {{ o.user.organization?.position }}
                                            </div>
                                        </ElTag>
                                    </div>
                                </div>
                                <div flex flex-row flex-wrap>
                                    <ElTag type="info" v-if="o.waiting_num !== 0">
                                        <div text="0.9rem">
                                            等待中: {{ o.waiting_num }}
                                        </div>
                                    </ElTag>
                                    <ElTag type="info" v-if="o.agent_accept_num !== 0">
                                        <div text="0.9rem">
                                            代理已接受: {{ o.agent_accept_num }}
                                        </div>
                                    </ElTag>
                                    <ElTag type="warning" v-if="o.agent_refuse_num !== 0">
                                        <div text="0.9rem">
                                            代理已拒绝: {{ o.agent_refuse_num }}
                                        </div>
                                    </ElTag>
                                    <ElTag type="" v-if="o.distributing_num !== 0">
                                        <div text="0.9rem">
                                            配送中: {{ o.distributing_num }}
                                        </div>
                                    </ElTag>
                                    <ElTag v-if="o.user_refuse_num !== 0">
                                        <div text="0.9rem">
                                            用户拒绝: {{ o.user_refuse_num }}
                                        </div>
                                    </ElTag>
                                    <ElTag type="success" v-if="o.finished_num !== 0">
                                        <div text="0.9rem">
                                            已完成: {{ o.finished_num }}
                                        </div>
                                    </ElTag>
                                </div>
                                <div flex flex-row>
                                    <ElTag>
                                        <div text="1.1rem red-500">
                                            总计: {{ o.total_price }} ￥
                                        </div>
                                    </ElTag>
                                    <ElTag>
                                        <div text="1.1.rem blue-500">
                                            总计数量: {{ o.total_num }}
                                        </div>
                                    </ElTag>
                                </div>
                            </div>
                            <div flex flex-col flex-wrap>
                                <div mt-4 text="0.95rem" flex>
                                    订单: {{ o.transitionId }}
                                </div>
                                <div mt-4>
                                    配送时间: {{ transformTime(new Date(o.lastModified)) }}
                                </div>
                                <div grid grid-cols-9 mt-4>
                                    <div grid-col-start-1 grid-col-end-3 text="0.95rem" mt-2>
                                        整体状态
                                    </div>
                                    <div grid-col-start-3 grid-col-end-10>
                                        <ElProgress :text-inside="true" :stroke-width="22"
                                            :percentage="Number((o.finished_num * 100 / o.total_num).toFixed(2))"
                                            status="success">
                                        </ElProgress>
                                    </div>
                                </div>
                                <div grid grid-cols-9 mt-4>
                                    <div grid-col-start-1 grid-col-end-3 text="0.95rem" mt-2>
                                        配送状态
                                    </div>
                                    <div grid-col-start-3 grid-col-end-10>
                                        <ElProgress :text-inside="true" :stroke-width="22" color="blue"
                                            :percentage="Number((o.distributing_num * 100 / o.total_num).toFixed(2))"
                                            status="success">
                                        </ElProgress>
                                    </div>
                                </div>
                                <div grid grid-cols-9 mt-4>
                                    <div grid-col-start-1 grid-col-end-3 text="0.95rem" mt-2>
                                        代理接受状态
                                    </div>
                                    <div grid-col-start-3 grid-col-end-10>
                                        <ElProgress :text-inside="true" :stroke-width="22" color="black"
                                            :percentage="Number((o.agent_accept_num * 100 / o.total_num).toFixed(2))"
                                            status="success">
                                        </ElProgress>
                                    </div>
                                </div>
                                <div mt-4 flex flex-row flex-wrap items-center>
                                    <div text="0.95rem">
                                        代理人
                                    </div>
                                    <span bg-green-300 p-2 rounded-xl text="0.95rem"
                                        v-for="agent in new Set(o.items.map(o => o.agentName))">
                                        {{ agent }}
                                    </span>
                                </div>
                                <div mt-4 flex flex-col>
                                    <div flex flex-row>
                                        <ElButton @click="assignWindow = true; assignBody.transitionId = o.transitionId">委派
                                        </ElButton>
                                        <ElButton @click="
                                            changeStateWindow = true;
                                        assignBody.transitionId = o.transitionId;
                                        currentTransitionData = TransitionInfo.find(el => el.transitionId === o.transitionId)!;
                                        ">
                                            修改状态</ElButton>
                                    </div>
                                    <div mt-4 flex flex-row>
                                        <ElButton @click="
                                            currentTransitionData = TransitionInfo.find(el => el.transitionId === o.transitionId)!;
                                        detailVisible = true
                                            ">查看详情</ElButton>
                                        <ElButton
                                            @click="currentTransitionData = TransitionInfo.find(el => el.transitionId === o.transitionId)!; addon()">
                                            追加</ElButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #default>
                        <el-tag v-for="el in o.items">
                            {{ el.name }}|{{ el.count }}{{ el.unit }}<span v-if="el.price">{{ el.price }}元/{{ el.unit
                            }}</span>
                        </el-tag>
                        <div absolute bottom-0>

                        </div>
                    </template>
                </el-card>
            </el-col>
        </el-row>
    </el-checkbox-group>
    <el-dialog v-model="assignWindow">
        <div class="flex flex-row justify-center items-center">
            <div>请选择代理人</div>
            <el-select v-model="assignBody.agentOpenid">
                <el-option v-for="agent in agentInfo" :label="agent.organization!.company" :value="agent.openid">
                </el-option>
            </el-select>
        </div>
        <div class="flex flex-row">
            <el-button @click="assignWindow = false">取消</el-button>
            <el-button @click="assignTransition(assignBody.transitionId, assignBody.agentOpenid)">委派</el-button>
        </div>
    </el-dialog>
    <el-dialog v-model="changeStateWindow">
        <div>
            <ElButton @click="selectAll">全选</ElButton>
        </div>
        <div flex flex-row>
            <ElSelect v-model="changeStateState">
                <ElOption v-for=" state  in  stateInfo " :label="state.label" :value="state.value">
                </ElOption>
            </ElSelect>
            <ElButton @click="changeState(changeStateState, selectedUUID); selectedUUID = []">
                状态修改
            </ElButton>
        </div>
        <ElCheckboxGroup v-model="selectedUUID">
            <ElTable :data="currentTransitionData.items">
                <ElTableColumn label="选择">
                    <template #default="scope">
                        <el-checkbox :label="scope.row.uuid"></el-checkbox>
                    </template>
                </ElTableColumn>
                <ElTableColumn prop="name" label="商品名"></ElTableColumn>
                <ElTableColumn prop="count" label="数量"></ElTableColumn>
                <ElTableColumn prop="unit" label="单位"></ElTableColumn>
                <ElTableColumn label="代理报价">
                    <template #default="{ row }">
                        <ElTag v-if="row.agentDetail.price">
                            {{ row.agentDetail.price }}元/{{ row.agentDetail.unit }}
                        </ElTag>
                        <ElTag v-else>未报价</ElTag>
                    </template>
                </ElTableColumn>
                <ElTableColumn prop="agentName" label="代理人"></ElTableColumn>
                <ElTableColumn label="单价">
                    <template #default="{ row }">
                        <ElInput type="number" v-model="row.price" @blur="handlePriceChange(row.uuid, row.price)"></ElInput>
                    </template>
                </ElTableColumn>
                <ElTableColumn label="状态">
                    <template #default="{ row }">
                        <ElTag>{{ stateInfo.find(e => e.value === row.state)?.label }}</ElTag>
                    </template>
                </ElTableColumn>
                <ElTableColumn label="修改状态">
                    <template #default="{ row }">
                        <ElButton @click="handleEdit(row)">修改</ElButton>
                    </template>
                </ElTableColumn>
                <ElTableColumn label="删除">
                    <template #default="{ row }">
                        <ElButton type="danger" @click="handleDelete(row); currentRowUUID = row.uuid">删除
                        </ElButton>
                    </template>
                </ElTableColumn>
            </ElTable>
        </ElCheckboxGroup>
    </el-dialog>
    <el-dialog v-model="dialogVisible" :before-close="handleClose">
        <template v-if="currentData.info_type === 'edit'">
            <el-form :model="waitingData">
                <el-form-item v-model="waitingData.openid" label="微信Openid">
                    <el-input v-model="waitingData.openid" placeholder="微信Openid" disabled></el-input>
                </el-form-item>
                <el-form-item v-model="waitingData.transitionId" label="订单号">
                    <el-input v-model="waitingData.transitionId" placeholder="微信Openid" disabled></el-input>
                </el-form-item>
                <el-form-item v-model="waitingData.propurename" label="商品名">
                    <el-input v-model="waitingData.propurename" placeholder="商品名" disabled></el-input>
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
                        <el-option v-for=" agent  in  agentInfo " :key="agent.openid" :label="agent.organization!.company"
                            :value="agent.openid">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="waitingData.state" :disabled="uploadMode === 'user'">
                        <el-option v-for=" stateVal  in  stateInfo " :key="stateVal.value" :label="stateVal.label"
                            :value="stateVal.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-model="waitingData.transitionId" label="单位">
                    <el-select v-model="waitingData.unit" @change="changePrice">
                        <el-option v-for=" unit  in  currentPropurement.defaultUnits " :key="unit" :label="unit"
                            :value="unit"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="代理报价(单价)">
                    <el-tag v-if="agentCurrentPrice > waitingData.price" type="warning">
                        {{ agentCurrentPrice }} / {{ agentCurrentUnit }}
                    </el-tag>
                    <el-tag v-else>
                        {{ agentCurrentPrice }} / {{ agentCurrentUnit }}
                    </el-tag>
                </el-form-item>
                <el-form-item label="单价">
                    <el-input type="number" v-model="waitingData.price" placeholder="单价"></el-input>
                </el-form-item>
                <el-form-item label="数量">
                    <el-input type="number" v-model="waitingData.number" placeholder="数量"></el-input>
                </el-form-item>
                <el-form-item label="提交">
                    <div class="flex flex-row">
                        <el-button type="success" @click="submit(uploadMode)">提交</el-button>
                        <el-button type="primary" @click="handleClose">取消</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </template>
        <template v-else-if="currentData.info_type === 'del'">
            <div class="text-xl">是否真的要删除
                <el-tag>
                    {{ currentData.data.propurename }}
                </el-tag>
            </div>
            <div class="flex flex-row-reverse items-center">
                <el-button @click="deleteItems(currentRowUUID)">删除</el-button>
                <el-button @click="dialogVisible = false">取消</el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog v-model="detailVisible">
        <div text-center text-2xl>
            <div>
                {{ currentTransitionData.user.organization?.company }}
            </div>
            <div flex flex-row items-center justify-center>
                <div i-carbon-location></div>
                {{ currentTransitionData.user.organization?.position }}
            </div>
            <div flex flex-row items-center justify-center>
                <div i-carbon-notebook>
                </div>
                {{ currentTransitionData.transitionId }}
            </div>
            <div flex flex-row items-center justify-center>
                <div i-carbon-time>

                </div>
                {{ transformTime(new Date(currentTransitionData.lastModified)) }}
            </div>
        </div>
        <el-table :data="currentTransitionData.items">
            <el-table-column prop="name" label="商品名"></el-table-column>
            <el-table-column prop="number" label="数量"></el-table-column>
            <el-table-column label="单位">
                <template #default="{ row }">
                    <el-tag>{{ row.price }}￥/{{ row.unit }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="agentName" label="代理人姓名"></el-table-column>
            <el-table-column label="代理人报价">
                <template #default="{ row }">
                    <template v-if="row.agentDetail">
                        <el-tag v-if="Number(row.agentDetail.price) >= Number(row.price)" type="warning">
                            {{ row.agentDetail.price }}￥/{{ row.agentDetail.unit }}
                        </el-tag>
                        <el-tag v-else>
                            {{ row.agentDetail.price }}￥/{{ row.agentDetail.unit }}
                        </el-tag>
                    </template>
                    <template v-else>
                        <ElTag type="danger">未发现代理人报价信息, 请刷新</ElTag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="收益">
                <template #default="{ row }">
                    <el-tag v-if="row.agentDetail.price">
                        {{ calcTotal([row]).toFixed(2) }}￥
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>
        <div text-red text-2xl>
            总计: {{ calcTotalWithoutAgent(currentTransitionData.items).toFixed(2) }}￥
            预计收益: {{ calcTotal(currentTransitionData.items).toFixed(2) }}￥
        </div>
        公司抬头
        <el-select v-model="querySchema.companyTitle">
            <el-option label="未选择" value=""></el-option>
            <el-option v-for=" item  in  config.companyTitle " :key="item" :value="item">{{ item }}</el-option>
        </el-select>
        开单单位格式
        <el-select v-model="excelFormat">
            <el-option label="未选择" value=""></el-option>
            <el-option v-for=" item  in  Object.keys(config.excelExtractMapping) " :key="item" :value="item">{{ item
            }}</el-option>
        </el-select>
        <div flex flex-row>
            <div w-20>采购人</div>
            <el-input v-model="principal" placeholder="请输入采购人"></el-input>
        </div>
        <ElButton size="large" type="primary"
            @click="tradeId = Math.ceil(currentTransitionData.items.length / 13);
            exportExcel(currentTransitionData.items, currentTransitionData.user.organization?.company!, currentTransitionData.lastModified)">
            导出为派送单
        </ElButton>
    </el-dialog>
    <el-dialog v-model="exportMoreOverlay">
        <el-form label-position="right" label-width="100px">
            <el-form-item label="公司抬头">
                <el-select v-model="querySchema.companyTitle">
                    <el-option label="未选择" value=""></el-option>
                    <el-option v-for=" item  in  config.companyTitle " :key="item" :value="item">{{ item }}</el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="开单格式">
                <el-select v-model="excelFormat">
                    <el-option label="未选择" value=""></el-option>
                    <el-option v-for=" item  in  Object.keys(config.excelExtractMapping) " :key="item" :value="item">{{ item
                    }}</el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="采购人">
                <el-input v-model="principal" placeholder="请输入采购人"></el-input>
            </el-form-item>
            <el-form-item label="订单">
                <template v-for="item in TransitionInfo">
                    <el-tag v-if="transitionsSelected.indexOf(item.transitionId) > -1">
                        {{ item.user.organization?.company }} - {{ transformTime(new Date(item.lastModified)) }}
                    </el-tag>
                </template>
            </el-form-item>
            <el-form-item label="合并导出">
                <el-button @click="joinExport">
                    <div i-carbon-export></div>
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-dialog v-model="errorMessageOverlay" :before-close="handelErrorClose">
        {{ updateNote }}
    </el-dialog>
    <el-dialog v-model="addonDialog">
        <el-input v-model="searchStr" placeholder="请搜索物品"></el-input>
        <el-checkbox v-model="onlyShowExist">只显示出现的</el-checkbox>
        <el-card v-for="item in searchItems.slice((pageInd - 1) * 10, pageInd * 10)">
            <el-row>
                <el-col :span="8">
                    <el-tag>
                        <div text-xl>{{ item.name }}</div>
                    </el-tag>
                </el-col>
                <el-col :span="8">
                    <el-tag>
                        <div text-xl>{{ item.brand }}</div>
                    </el-tag>
                </el-col>
                <el-col :span="8">
                    <el-button class="w-46" type="primary"
                        v-if="currentTransitionData.items.map(el => el.uuid).indexOf(item.uuid) === -1"
                        @click="dialogVisible = true; addItem(item);">添加</el-button>
                    <el-input-number size="large" v-else
                        v-model="currentTransitionData.items.find(el => el.uuid === item.uuid)!.count" :precision="2"
                        :step="1" @change="handelItemNumChange(
                            item.uuid,
                            currentTransitionData.items.find(el => el.uuid === item.uuid)!.count
                        )" @blur="handelItemNumChange(
    item.uuid,
    currentTransitionData.items.find(el => el.uuid === item.uuid)!.count
)
    "></el-input-number>
                </el-col>
            </el-row>
        </el-card>
        <div class="absolute bottom-0 w-90%">
            <ElPagination :total="maxPage * 10" :current-page="pageInd" :page-size="20"
                @current-change="(val) => pageInd = val"></ElPagination>
        </div>
    </el-dialog>
</template>
<script lang='ts' setup>
import useUser from '../../states/useUser';
import {
    ElTable, ElTableColumn, ElButton, ElDialog, ElTag, ElDescriptions,
    ElDescriptionsItem, ElSelect, ElOption, ElForm, ElFormItem,
    ElInput, ElPagination, ElRadioGroup, ElRadioButton,
    ElMessage, ElProgress,
    ElCard,
    ElRow, ElCol, ElOverlay, ElCheckboxGroup, extractTimeFormat
} from 'element-plus';
import { Ref, ref, watch, computed } from 'vue'
import request from '../../request';
import Drag from '../../components/Drag.vue'
import { useWindowSize } from '@vueuse/core'
import save from '../../excel/save';
import { XLSX } from '../../excel/excel';
import config from '../../config';
import TradeAdd from './TradeAdd.vue';

const pageInd = ref(1)
const maxPage = computed(() => {
    return Math.ceil(searchItems.value.length / 10) + 1
})

const refresh = async () => {
    TransitionInfo.value = [];
    ElMessage.info('正在获取信息中');
    await fetchCurrentData();
}

// 导出为excel

const querySchema = ref({
    company: '',
    companyTitle: '',
    type: '',
    typeTitle: '',
    date: '',
    dateTitle: '',
    page: 1,
    pageSize: 13,
    total: 0,
    totalPage: 0,
    data: []
})
const excelFormat = ref('')
const tradeId = ref(1);
const principal = ref('');
function exportExcel(data: any, name: string, datetime: string = '') {
    ElMessage.success('正在导出数据!请稍后!')
    let ind = 0;
    console.log(data.length);
    if (querySchema.value.companyTitle !== '') {
        let segment = 13; // 每一张单子有多长
        let maxInd = Math.ceil(data.length / segment);
        if (excelFormat.value === '夷陵区机关后勤服务中心食堂') {
            console.log("看起来你准备用这个!")
            // 如果是夷陵区机关后勤服务中心食堂
            segment = 25
            maxInd = Math.ceil(data.length / segment);
            tradeId.value = maxInd;
        }
        let xhyTrade: Function;
        let xhyStyle: Function;
        let found: boolean = false;
        for (const key of Object.keys(config.excelExtractMapping)) {
            if (querySchema.value.company.indexOf(key) > -1) {
                // @ts-ignore
                xhyTrade = config.excelExtractMapping[key]['trade'];
                // @ts-ignore
                xhyStyle = config.excelExtractMapping[key]['style'];
                console.log(key);
                found = true;

                break;
            }
        }
        // 如果选择了表单格式，那么以选择的表单格式为标准，否则为自动选择
        if (excelFormat.value !== '') {
            // @ts-ignore
            xhyStyle = config.excelExtractMapping[excelFormat.value as string]['style'];
            // @ts-ignore
            xhyTrade = config.excelExtractMapping[excelFormat.value as string]['trade'];
            found = true;
        }
        if (!found) {
            xhyTrade = config.excelExtractMapping['默认']['trade'];
            xhyStyle = config.excelExtractMapping['默认']['style'];
        }
        // console.log(maxInd)
        for (; ind < maxInd; ind++) {
            const locData = data.slice(ind * segment, (ind + 1) * segment);
            const arrayData = xhyTrade!(locData, tradeId.value, ind + 1, new Date(datetime), name, principal.value, querySchema.value.companyTitle);
            // console.log('表格数据', arrayData);
            const sheet = xhyStyle!(XLSX.utils.aoa_to_sheet(arrayData));
            const book = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(book, sheet, '订单');
            save(book, `${transformTime(new Date(datetime), 'yyyy-MM-dd')}-${name}-${tradeId.value}-${ind + 1}.xlsx`);
        }
    } else {
        ElMessage.error("请选择开票单位 以及 公司抬头");
    }
}




const detailVisible = ref(false)

const calcTotal = (items: any[]) => {
    let total = 0
    for (const item of items) {
        if (item.agentDetail.price && item.price) {
            total += (Number(item.price) - Number(item.agentDetail.price)) * Number(item.number)
        }
    }
    return total
}

const calcTotalWithoutAgent = (items: any[]) => {
    let total = 0
    for (const item of items) {
        if (item.price) {
            total += Number(item.price) * Number(item.number)
        }
    }
    return total
}

const selectAll = () => {
    if (currentTransitionData.value.items.length === selectedUUID.value.length) {
        selectedUUID.value = []
    } else {
        selectedUUID.value = []
        for (const item of currentTransitionData.value.items) {
            selectedUUID.value.push(item.uuid)
        }
    }
}

const currentRowUUID: Ref<string> = ref('')

const stateInfo = [
    {
        label: '等待',
        value: 'waiting'
    },
    {
        label: '代理接受',
        value: 'agent-accept'
    },
    {
        label: '代理拒绝',
        value: 'agent-refuse'
    },
    {
        label: '配送中',
        value: 'distributing'
    },
    {
        label: '配送完成',
        value: 'finished'
    },
    {
        label: '用户拒绝',
        value: 'user-refuse'
    }
]

function transformTime(date: Date, formatter = 'yyyy-MM-dd hh:mm:ss') {
    const o: any = {
        "M+": date.getMonth() + 1, //month
        "d+": date.getDate(), //day
        "h+": date.getHours(), //hour
        "m+": date.getMinutes(), //minute
        "s+": date.getSeconds(), //second
    };
    if (/(y+)/.test(formatter)) {
        formatter = formatter.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    if (/(S+)/.test(formatter)) {
        formatter = formatter.replace(
            RegExp.$1,
            ("000" + date.getMilliseconds()).substr(
                ("000" + date.getMilliseconds()).length - RegExp.$1.length
            )
        );
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(formatter)) {
            formatter = formatter.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
        }
    }
    return formatter;
}

const { width: widthSize } = useWindowSize()
const colSpan = ref(8)

const currentDate = ref(new Date())

const userState = useUser();

const fetchTransitionInfo = async () => {
    const res = await request.get('/transition')
    // console.log(res)
}


// 用户信息部分

type UserType = "admin" | "agent" | "user" | null;

interface UserInfo {
    openid: string;
    user_type?: UserType;
    organization?: {
        company: string;
        department: string;
        position: string;
        phone_number: string;
        principal: string;
    };
}
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
    // console.log(res);
})

getUserInfo('agent').then(res => {
    agentInfo.value = res.data.data;
    // console.log(res);
})
const getPorpurement = (uuid?: string | string[]) => {
    let params: Record<string, string | number | string[]> = {
        openid: userState.openid,
        page: 1,
        pageSize: 3000,
    }

    if (uuid) {
        params = {
            ...params,
            uuid
        }
    }

    return request.get(
        '/propurement',
        {
            params: params
        }
    )
}

const propurementInfo = ref<any[]>([]);
getPorpurement().then(res => {
    propurementInfo.value = res.data.data;
    // console.log(res);
})

const bindItemList = async (itemList: SimpleTransition[]) => {
    const allUserOpenid = itemList.map(item => item.openid);
    const allAgentOpenid = itemList.map(item => item.agentOpenid);
    const allUUID = itemList.map(item => item.uuid);
    const allUsers = userInfo.value || [];
    const allAgents = agentInfo.value || [];
    const allPropurements = propurementInfo.value || [];

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
                // console.log('这里', propurement);
                break;
            }
        }

        if (!userFind) {
            item.buyer = {
                openid: "未知",
                organization: {
                    company: "未知",
                    department: "未知",
                    position: "未知",
                    phone_number: "未知",
                    principal: "未知"
                },
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

// 关于订单数据
type TransitionState = 'waiting' | 'agent-accept' | 'agent-refuse' | 'distributing' | 'finished' | 'user-refuse'
async function getTransitionData(state: TransitionState, query: any = {}) {
    const res: { data: { data: SimpleTransition[] } } = await request.get('/admin/transition', {
        params: {
            openid: userState.openid,
            page: 1,
            pageSize: 1000,
            state,
            ...query
        }
    })
    return res.data.data
}

interface TransitionItem {
    user: UserInfo,
    agent: UserInfo,
    items: {
        name: string; // 名称
        count: number; // 数量
        price: number; // 单价
        unit: string,
        uuid: string,
        state: TransitionState,
        agentName: string,
        agentOpenid: string,
        propurename: string,
        transitionId: string,
        number: number,
        isFree: boolean,
        openid: string,
        agentDetail: {
            unit: string,
            number: number,
            price: number,
            comment: string,
        },
        lastPrice: any,
        userComment: string,
    }[],
    state: TransitionState,
    waiting_num: number,
    agent_accept_num: number,
    agent_refuse_num: number,
    distributing_num: number,
    user_refuse_num: number,
    finished_num: number,
    total_num: number,
    total_price: number,
    transitionId: string,
    lastModified: string,
    lastPrice: any[]
}
interface SimpleTransition {
    name?: string,
    uuid: string,
    openid: string,
    transitionId: string,
    propurementname: string,
    number: number,
    unit: string,
    userComment: string,
    state: TransitionState,
    isFree: boolean,
    lastModified: string,
    agentOpenid: string,
    agentDetail?: {
        unit: string,
        number: number,
        price: number,
        comment: string,
    },
    price: string, // ANCHOR 这里的价格有可能是字符串!
    buyer?: UserInfo,
    agent?: UserInfo,
    propurement?: any,
    lastPrice: any[]
}
const TransitionInfo = ref<TransitionItem[]>([])
async function fetchCurrentData() {
    const currentData: SimpleTransition[] = []
    const transitions: string[] = []
    const states: TransitionState[] = [
        'waiting',
        'agent-accept',
        'agent-refuse',
        'distributing',
    ]

    for (let state of states) {
        let transitionData = await getTransitionData(state)
        // console.log(transitionData)
        transitions.push(...transitionData.map(o => o.transitionId))
    }

    const transitionSets = new Set(transitions)


    if (transitionSets.size === 0) {
        ElMessage.warning('当前没有交易订单')
    } else {
        ElMessage.success(`发现当前共有${transitionSets.size}个订单`)
    }

    for (let transition of transitionSets) {
        const tmp: TransitionItem = {
            user: {} as UserInfo,
            agent: {} as UserInfo,
            items: [],
            state: 'waiting',
            waiting_num: 0,
            agent_accept_num: 0,
            agent_refuse_num: 0,
            distributing_num: 0,
            user_refuse_num: 0,
            finished_num: 0,
            transitionId: '',
            total_num: 0,
            total_price: 0,
            lastModified: '',
            lastPrice: []
        }
        states.push('finished')
        for (let state of states) {
            await getTransitionData(state, { transitionId: transition, }).then(async res => {
                await bindItemList(res)
                // console.log("after bind", res);
                for (let item of res) {
                    tmp.items.push({
                        name: item.propurement.name!,
                        count: item.number,
                        unit: item.unit,
                        price: Number(item.price),
                        uuid: item.uuid,
                        state: item.state,
                        agentName: item.agent?.organization?.company || '未知',
                        openid: item.openid,
                        agentOpenid: item.agentOpenid,
                        propurename: item.propurement.name!,
                        transitionId: item.transitionId,
                        number: item.number,
                        isFree: item.isFree,
                        agentDetail: item.agentDetail || {
                            unit: '',
                            number: 0,
                            price: 0,
                            comment: '',
                        },
                        lastPrice: {},
                        userComment: item.userComment,
                    })
                    tmp.state = item.state
                    tmp.user = userInfo.value.find(o => o.openid === item.openid) || {} as UserInfo
                    tmp.agent = agentInfo.value.find(o => o.openid === item.agentOpenid) || {} as UserInfo
                    tmp.waiting_num += item.state === 'waiting' ? 1 : 0
                    tmp.agent_accept_num += item.state === 'agent-accept' ? 1 : 0
                    tmp.agent_refuse_num += item.state === 'agent-refuse' ? 1 : 0
                    tmp.distributing_num += item.state === 'distributing' ? 1 : 0
                    tmp.finished_num += item.state === 'finished' ? 1 : 0
                    tmp.user_refuse_num += item.state === 'user-refuse' ? 1 : 0
                    tmp.transitionId = item.transitionId
                    tmp.lastModified = item.lastModified
                    tmp.total_price += (item.price === '' || !item.price) ? 0 : Number(item.price) * item.number
                }

                // 添加记录
                // add last Price
                for (let el of tmp.items) {
                    await getPrice(el.uuid, el.openid, el.unit).then((price: any) => {
                        el.lastPrice = price;
                    })
                }
            })
        }
        tmp["total_num"] = tmp.distributing_num + tmp.agent_accept_num +
            tmp.agent_refuse_num + tmp.waiting_num + tmp.finished_num + tmp.user_refuse_num
        TransitionInfo.value.push(tmp)
    }

}

ElMessage.info('请耐心等待，正在加载数据...')
fetchCurrentData()

// 点击之后的第二层页面

const assignWindow = ref(false)
const assignBody = ref({
    transitionId: '',
    agentOpenid: ''
})
const assignTransition = async (transitionId: string, agentOpenid: string) => {
    const currentTransitionData = TransitionInfo.value.find(o => o.transitionId === transitionId)
    if (currentTransitionData?.waiting_num !== currentTransitionData?.total_num) {
        ElMessage.error('有其他订单正在处理中，不允许一次性委派!')
        return
    }

    const transitionData = await getTransitionData('waiting', { transitionId })

    const afterChangeState: any[] = []

    for (let item of transitionData) {
        item.agentOpenid = agentOpenid
        afterChangeState.push({
            openid: item.openid,
            number: item.number,
            unit: item.unit,
            uuid: item.uuid,
            state: item.state,
            price: item.price,
            agentOpenid: agentOpenid,
            transitionId: item.transitionId
        })
    }


    let allPromise = []
    for (let transition of afterChangeState) {
        allPromise.push(
            request({
                url: '/admin/transition',
                method: 'post',
                data: {
                    openid: userState.openid,
                    transitionId: transitionId,
                    query: {
                        uuid: transition.uuid,
                    },
                    transition: transition
                }
            })
        )
    }

    return await Promise.all(allPromise).then(res => {
        ElMessage.success('委派成功!')
        assignWindow.value = false
        TransitionInfo.value = []
        fetchCurrentData()
    }).catch(err => {
        ElMessage.error('委派失败!')
    })
}

// 修改状态

const changeStateWindow = ref(false)
const selectedUUID = ref<string[]>([])
const changeStateState = ref<TransitionState>('waiting')
const currentTransitionData = ref<TransitionItem>({
    user: {} as UserInfo,
    agent: {} as UserInfo,
    items: [],
    state: 'waiting',
    waiting_num: 0,
    agent_accept_num: 0,
    agent_refuse_num: 0,
    distributing_num: 0,
    user_refuse_num: 0,
    finished_num: 0,
    transitionId: '',
    total_num: 0,
    total_price: 0,
    lastModified: '',
    lastPrice: []
})
const changeState = async (state: TransitionState, uuids: string[]) => {
    const allPromise = [];

    const states: TransitionState[] = [
        'waiting',
        'agent-accept',
        'agent-refuse',
        'distributing',
        'user-refuse',
        'finished'
    ]


    const afterChangeState: any[] = []

    for (let state of states) {
        for (let item of await getTransitionData(state, { transitionId: currentTransitionData.value.transitionId })) {
            afterChangeState.push({
                openid: item.openid,
                number: item.number,
                unit: item.unit ? item.unit : '斤',
                uuid: item.uuid,
                state: item.state ? item.state : 'waiting',
                price: item.price ? item.price : 0,
                agentOpenid: item.agentOpenid,
                transitionId: item.transitionId
            })
        }
    }



    for (let uuid of uuids) {
        let item = afterChangeState.find(o => o.uuid === uuid)
        let beforeState: TransitionState = item.state
        item.state = state
        allPromise.push(
            request({
                url: '/admin/transition',
                method: 'post',
                data: {
                    openid: userState.openid,
                    transitionId: currentTransitionData.value.transitionId,
                    query: {
                        uuid: uuid,
                    },
                    transition: item
                }
            }).then(_ => {
                currentTransitionData.value.items.find(o => o.uuid === uuid)!.state = state

                for (let transition of TransitionInfo.value) {
                    if (transition.transitionId === currentTransitionData.value.transitionId) {
                        // @ts-ignore
                        transition[`${state.split('-').join('_')}_num`] += 1
                        // @ts-ignore
                        transition[`${beforeState.split('-').join('_')}_num`] -= 1
                    }
                }
                ElMessage.success("状态修改成功")
            }).catch(err => {
                ElMessage.error(`状态修改失败 ${err.message}`)
            })
        )
    }
}


const dialogVisible = ref(false)

function handleClose() {
    waitingData.value = {
        uuid: "",
        transitionId: "",
        openid: "",
        propurename: "",
        number: 0,
        unit: "",
        lastPrice: {
            price: 0,
            unit: "",
            openid: ""
        },
        state: "",
        agentOpenid: "",
        price: 0,
        isFree: false,
        lastModified: new Date().toString()
    }
    close();
}

const closeDelete = () => {
}

function open() {
    if (!dialogVisible.value) {
        dialogVisible.value = true;
    }
}

function close() {
    dialogVisible.value = false;
    uploadMode.value = "admin";
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
    propurename: "",
    state: "",
    price: 0,
    agentOpenid: "",
    isFree: false,
    lastPrice: {
        openid: "",
        unit: "",
        price: 0,
    },
    number: 0,
    lastModified: new Date().toString()
})

watch(() => waitingData.value.unit, async (nv) => {
    waitingData.value.lastPrice = (await getPrice(waitingData.value.uuid, waitingData.value.openid, waitingData.value.unit))!
    waitingData.value.price = waitingData.value.lastPrice.price
})

// @ts-ignore
function handleDelete(row) {
    currentData.value.info_type = "del";
    currentData.value.data = row
    open();
}

const agentCurrentPrice = ref(0);
const agentCurrentUnit = ref('');
// @ts-ignore
function handleEdit(row) {
    waitingData.value.unit = row.unit;
    waitingData.value.uuid = row.uuid;
    waitingData.value.openid = row.openid;
    waitingData.value.agentOpenid = row.agentOpenid || "";
    waitingData.value.propurename = row.propurename;
    waitingData.value.transitionId = row.transitionId;
    waitingData.value.number = row.number;
    waitingData.value.lastPrice = row.lastPrice;
    waitingData.value.state = row.state;
    waitingData.value.isFree = row.isFree || false;
    waitingData.value.price = row.price ? row.price : 0;
    waitingData.value.lastModified = row.lastModified ? row.lastModified : new Date().toString();
    currentData.value.info_type = "edit";
    agentCurrentPrice.value = row.agentDetail ? Number(row.agentDetail.price) : 0;
    agentCurrentUnit.value = row.agentDetail ? row.agentDetail.unit : '个';
    // console.log('row', row);
    changePrice()
    getCurrentPropurement(row.uuid);
    open();
}

interface Price {
    openid: string,
    unit: string,
    price: number,
    isDirty: boolean
}

const pricePool = ref<Map<string, Price>>(new Map());

async function fetchAndUpdatePricePool(uuid: string, openid: string, unit: string) {
    const res = await request.get(
        '/price',
        {
            params: {
                openid: openid,
                uuid: uuid,
                page: 1,
                pageSize: 100
            }
        }
    )
    console.log('这里', res)
    try {
        for (let record of res.data.data[0].lastPrice) {
            if (record.unit === unit) {
                pricePool.value.set(uuid + openid + unit, {
                    openid: record.openid,
                    unit: record.unit,
                    price: record.price,
                    isDirty: false
                })
                return pricePool.value.get(uuid + openid + unit);
            }
        }
    } catch (error) {
        console.warn(res.data, uuid, openid, unit);
    }
}

function dirtyPrice(uuid: string, openid: string, unit: string, price: number) {
    const item = pricePool.value.get(uuid + openid + unit);
    if (item && item.price !== price) {
        item.isDirty = true;
        fetchAndUpdatePricePool(uuid, openid, unit);
    }
}
async function getPrice(uuid = "", openid = "", unit = "") {
    const ind = uuid + openid + unit;
    if (pricePool.value.has(ind) && !pricePool.value.get(ind)!.isDirty) {
        if (pricePool.value.get(ind)!.isDirty) {
            let res = await fetchAndUpdatePricePool(uuid, openid, unit)
            if (!res) {
                return {
                    openid: "",
                    unit: "",
                    price: 0,
                    isDirty: false
                }
            }
            return res;
        } else {
            return pricePool.value.get(ind);
        }
    } else {
        let res = await fetchAndUpdatePricePool(uuid, openid, unit)
        if (!res) {
            return {
                openid: "",
                unit: "",
                price: 0,
                isDirty: false
            }
        }
        return res;
    }

    // return new Promise((resolve, reject) => {
    //     request.get(
    //         '/price',
    //         {
    //             params: {
    //                 openid: openid,
    //                 uuid: uuid,
    //                 page: 1,
    //                 pageSize: 100
    //             }
    //         }
    //     ).then(res => {
    //         // @ts-ignore
    //         const data = res.data.data[0].lastPrice.filter(el => el.unit === unit);
    //         resolve(data);

    //     }).catch(err => {
    //         reject(err);
    //     })
    // })
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
    // console.log("changePrice", waitingData.value.lastPrice);
    if (waitingData.value.price === 0) {
        if (waitingData.value.lastPrice) {
            for (let unit of [waitingData.value.lastPrice]) {
                if (unit.unit === waitingData.value.unit) {
                    waitingData.value.price = unit.price;
                    // console.log("比对价格", unit);
                }
            }
        }
    }
}

type AnyObject = {
    [prop: string]: any
};

function submit(mode: "admin" | "user" = "admin") {

    if (waitingData.value.uuid === '' || waitingData.value.number === 0 ||
        waitingData.value.price === 0 || waitingData.value.unit === '') {
        ElMessage.warning('请填写必要的信息 [单位，数量，单价，物品]');
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

        const adminData = {
            openid: userState.openid,
            transitionId: waitingData.value.transitionId,
            query: {
                uuid: waitingData.value.uuid,
            },
            transition: transitionData
        }

        const userData = {
            transitionId: waitingData.value.transitionId,
            openid: waitingData.value.openid,
            uuid: waitingData.value.uuid,
            state: waitingData.value.state,
            agentOpenid: waitingData.value.agentOpenid,
            propurename: waitingData.value.propurename,
            lastModified: waitingData.value.lastModified,
            detail: {
                number: waitingData.value.number,
                unit: waitingData.value.unit,
                comment: "",
                isFree: waitingData.value.isFree
            }
        }

        request.post(
            mode === "admin" ? '/admin/transition' : "/propurement",
            mode === "admin" ? adminData : userData
        ).then(async res => {
            ElMessage.success('提交成功');
            // 修改前端显示
            const beforeTransitionId = waitingData.value.transitionId;
            if (mode === "user") {
                // user data
                await refresh();
                for (let transition of TransitionInfo.value) {
                    if (transition.transitionId === beforeTransitionId) {
                        currentTransitionData.value = transition;
                    }
                }
            }

            for (let ind = 0; ind < currentTransitionData.value.items.length; ind++) {
                let item = currentTransitionData.value.items[ind];
                if (item.uuid === waitingData.value.uuid) {
                    let beforeState = item.state
                    item.unit = waitingData.value.unit;
                    item.number = waitingData.value.number;
                    item.price = waitingData.value.price;
                    item.state = waitingData.value.state as TransitionState;
                    item.agentOpenid = waitingData.value.agentOpenid;
                    item.isFree = waitingData.value.isFree;
                    item.lastPrice = waitingData.value.lastPrice;

                    // @ts-ignore
                    currentTransitionData.value[`${beforeState.split('-').join('_')}_num`] -= 1;
                    // @ts-ignore
                    currentTransitionData.value[`${item.state.split('-').join('_')}_num`] += 1;

                    currentTransitionData.value.items[ind].price = waitingData.value.price;

                    dirtyPrice(item.uuid, item.openid, item.unit, item.price);
                }
            }

            handleClose();
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
            // console.log(res);
            ElMessage.success('价格添加/修改成功');
        }).catch(err => {
            ElMessage.error(err.response.data.message);
        })
    }
}

function deleteItems(uuid: string) {
    request.delete(
        '/admin/history',
        {
            params: {
                openid: userState.openid,
                uuid: uuid,
                transitionId: currentData.value.data.transitionId,
                userOpenid: currentData.value.data.openid
            }
        }
    ).then(res => {
        if (res.data.code === 200) {
            ElMessage.success(`删除成功!`);
        } else {
            ElMessage.error("删除失败!");
        }
        handleClose();

        let ind = currentTransitionData.value.items.findIndex((item: any) => {
            return item.uuid === uuid;
        })
        currentTransitionData.value.items.splice(ind, 1);

    })
}




// 增加复选框，可以支持一键导出选定的单子
const transitionsSelected = ref<string[]>([]);
const exportMoreOverlay = ref(false);
const updateNote = ref<string>('')
const handelErrorClose = () => {
    updateNote.value = ''
    errorMessageOverlay.value = false;
}
const errorMessageOverlay = ref(false);
const check = (left: any, right: any) => {
    let error = false;
    let updateMessage = ''
    console.log(left, right)
    if (left.price.toString() !== right.price.toString()) {
        let message = `订单${left.transitionId}中的物品${left.propurename}的价格与订单${right.transitionId}中的不一致，${left.price} | ${right.price}\n`
        ElMessage.warning(message);
        error = true;
        updateMessage += message
    }
    if (left.unit !== right.unit) {
        let message = `订单${left.transitionId}中的物品${left.propurename}的单位与订单${right.transitionId}中的不一致，${left.unit} | ${right.unit}\n`
        ElMessage.warning(message);
        error = true;
        updateMessage += message
    }
    return [error, updateMessage];
}

const joinExport = () => {
    const transitions = transitionsSelected.value;
    const transitionsData = TransitionInfo.value.filter(item => transitions.includes(item.transitionId));
    const itemsData = transitionsData.map(el => el.items).reduce((pre, cur) => pre.concat(cur), []);
    if (transitions.length === 0) {
        ElMessage.warning('请先选择需要导出的单子');
        return;
    }
    const companies: Set<string> = new Set()
    for (let transition of transitionsData) {
        companies.add(transition.user.organization?.company ? transition.user.organization?.company : '未知公司')
    }

    // 聚类以下
    const cascadiaTransition = []
    let error: string | boolean = false;
    for (let item of itemsData) {
        let isExist = false;
        for (let cascadia of cascadiaTransition) {
            if (cascadia.uuid === item.uuid) {
                cascadia.number += item.number;
                let note: string | boolean = '';
                [error, note] = check(cascadia, item);
                updateNote.value += note + '\n';
                isExist = true;
                break;
            }
        }
        if (!isExist) {
            cascadiaTransition.push({
                uuid: item.uuid,
                propurename: item.name,
                number: item.number,
                unit: item.unit,
                price: item.price,
                state: item.state,
                agentOpenid: item.agentOpenid,
                isFree: item.isFree,
                lastPrice: item.lastPrice,
                transitionId: item.transitionId,
                userComment: item.userComment ? item.userComment : '',
            })
        }
    }

    if (!error) {
        exportExcel(cascadiaTransition, Array.from(companies).join('-'), transitionsData[0].lastModified);
    } else {
        errorMessageOverlay.value = true;
    }
}


// 额外添加的dialog
const addonDialog = ref(false);
const searchStr = ref('');
const allItems = ref<any[]>([]);
const onlyShowExist = ref(false)
const searchItems = computed(() => {
    const tmp = allItems.value.filter(item => item.name.includes(searchStr.value));
    // 是否存在于currentTransitionData中
    if (onlyShowExist.value) {
        return tmp.filter(item => {
            return currentTransitionData.value.items.findIndex(el => el.uuid === item.uuid) !== -1
        })
    } else {
        return tmp
    }
})
const fetchAllPropurements = async () => {

}
const addon = () => {
    addonDialog.value = true;
    if (allItems.value.length === 0) {
        ElMessage.success("正在获取所有物品信息")
        request.get('/propurement', {
            params: {
                openid: userState.openid,
                page: 1,
                pageSize: 10000,
            }
        }).then(res => {
            allItems.value = res.data.data;
            ElMessage.success(res.data.message)
        })
    }
}

const handelItemNumChange = (uuid: any, num: number | null) => {
    const item = currentTransitionData.value.items.find(el => el.uuid === uuid)!;
    const ind = currentTransitionData.value.items.findIndex(el => el.uuid === uuid)!;
    if (num === null || Math.abs(num - 0) < 1e-6) {
        ElMessage.success(`删除${uuid}`);
        request.delete('/propurement', {
            params: {
                openid: item.openid,
                uuid: uuid,
                transitionId: item.transitionId,
            }
        }).then(res => {
            ElMessage.success(res.data.message);
            currentTransitionData.value.items.splice(ind, 1);
        }).catch(err => {
            ElMessage.error(err.response.data.message);
        })
    } else {
        const detail = {
            unit: item.unit,
            comment: item.userComment,
            number: num,
            price: item.price,
        };
        request.post('/propurement', {
            propurename: item.propurename,
            openid: item.openid,
            agentOpenid: item.agentOpenid,
            uuid: uuid,
            transitionId: item.transitionId,
            state: item.state,
            detail: detail,
        }).then(_ => {

        }).catch(err => {
            ElMessage.error(err.response.data.message);
        })
        currentTransitionData.value.items[ind].count = num;
    }
}
const uploadMode = ref<"admin" | "user">("admin")
const addItem = (itemInfo: any) => {
    const item = currentTransitionData.value.items.find(el => el.uuid === itemInfo.uuid)!;
    const ind = currentTransitionData.value.items.findIndex(el => el.uuid === itemInfo.uuid)!;
    console.log(item);
    const schemaData = {
        transitionId: currentTransitionData.value.transitionId,
        uuid: itemInfo.uuid,
        openid: currentTransitionData.value.user.openid,
        propurename: itemInfo.name,
        state: 'waiting',
        unit: '',
        number: 0,
        lastPrice: [],
        isFree: false,
        agentOpenid: "",
        lastModified: currentTransitionData.value.lastModified
    }
    currentPropurement.value.defaultUnits = itemInfo.defaultUnits;
    uploadMode.value = "user";
    handleEdit(schemaData);
}

const handlePriceChange = (uuid: string, price: number) => {
    const item = currentTransitionData.value.items.find(el => el.uuid === uuid)!;
    const ind = currentTransitionData.value.items.findIndex(el => el.uuid === uuid)!;
    const detail = {
        unit: item.unit,
        comment: item.userComment,
        number: item.number,
        price: price,
    };
    request.post('/propurement', {
        propurename: item.propurename,
        openid: item.openid,
        agentOpenid: item.agentOpenid,
        uuid: uuid,
        transitionId: item.transitionId,
        state: item.state,
        detail: detail,
    }).then(_ => {
        ElMessage.success(`修改${item.propurename}价格为${price}`);
    }).catch(err => {
        ElMessage.error(err.response.data.message);
    })
    currentTransitionData.value.items[ind].price = price;
}

</script>

<style scoped>
.el-col {
    margin-top: 10;
}
</style>