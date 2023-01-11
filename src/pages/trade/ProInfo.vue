<template>
    <el-table :data="propurementData">
        <el-table-column v-for="pro in propurementColumns" :prop="pro.prop" :label="pro.label">
            <template #default="scope" v-if="pro.label === '名称'">
                <ElTag>
                    {{ scope.row.name }}
                </ElTag>
            </template>
            <template #default="scope" v-else-if="pro.label === '品牌'">
                <ElTag>
                    {{ scope.row.brand }}
                </ElTag>
            </template>
            <template #default="scope" v-else-if="pro.label === '类别'">
                <ElTag v-for="category in scope.row.category">
                    {{ category }}
                </ElTag>
            </template>
            <template #default="scope" v-else-if="pro.label === '单位'">
                <ElTag type="success" v-for="unit in scope.row.defaultUnits" :key="unit">
                    {{ unit }}
                </ElTag>
            </template>
            <template #default="scope" v-else-if="pro.label === '单位'">
                <ElTag>
                    {{ scope.row.category }}
                </ElTag>
            </template>
            <template #default="scope" v-else-if="pro.label === '修改'">
                <div class="flex flex-row">
                    <el-button type="normal" @click="info(scope.row)">查看</el-button>
                    <el-button type="primary" @click="change(scope.row)">修改</el-button>
                    <el-button type="danger" @click="del(scope.row)">删除</el-button>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination :total="1000" v-model:current-page="currentProPage">

    </el-pagination>


    <el-dialog v-model="showProDialog" :before-close="close">
        <template v-if="currentPro.info_type === 'info'">
            <ElDescriptions>
                <ElDescriptionsItem label="名称">
                    <ElTag>
                        {{ currentPro.data.name }}
                    </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="品牌">
                    <ElTag>
                        {{ currentPro.data.brand }}
                    </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="类别">
                    <ElTag v-for="category in currentPro.data.category">
                        {{ category }}
                    </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="单位">
                    <ElTag type="success" v-for="unit in currentPro.data.defaultUnits" :key="unit">
                        {{ unit }}
                    </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="备注">
                    <ElTag>
                        {{ currentPro.data.defaultPage }}
                    </ElTag>
                </ElDescriptionsItem>
            </ElDescriptions>
            <el-button @click="showHistory = !showHistory">展开物品历史价格</el-button>
            <template v-if="showHistory">
                <el-table :data="currentPro.data.userPrice.user">
                    <el-table-column prop="openid" label="微信Openid"></el-table-column>
                    <el-table-column prop="unit" label="单位"></el-table-column>
                    <el-table-column prop="price" label="价格"></el-table-column>
                </el-table>
            </template>
        </template>
        <template v-else-if="currentPro.info_type === 'change'">
            <el-form :model="currentPro.data" ref="proForm" label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="currentPro.data.name"></el-input>
                </el-form-item>
                <el-form-item label="品牌">
                    <el-input v-model="currentPro.data.brand"></el-input>
                </el-form-item>
                <el-form-item label="类别">
                    <el-input v-model="currentPro.data.category"></el-input>
                </el-form-item>
                <el-form-item label="单位">
                    <el-tag v-for="tag in currentPro.data.defaultUnits" :key="tag" class="mx-1" closable
                        :disable-transitions="false" @close="handleClose(tag)">
                        {{ tag }}
                    </el-tag>
                    <el-input v-if="showAddTag" ref="InputRef" v-model="currentTagData" class="ml-1 w-20" size="small"
                        @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
                    <el-button v-else class="button-new-tag ml-1" size="small" @click="showAddTag = true">
                        + New Tag
                    </el-button>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="currentPro.data.defaultPage"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="submitChange">提交</el-button>
                </el-form-item>
            </el-form>
        </template>
        <template v-else-if="currentPro.info_type === 'del'">
            你确定要删除
            <el-tag>
                {{ currentPro.data.name }}
            </el-tag>
            嘛?

            <div class="flex flex-row">
                <el-button @click="close">取消</el-button>
                <el-button @click="submitDel">确认</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang='ts' setup>
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

const propurementData = ref([]);
const propurementColumns = ref([
    {
        label: "编号",
        prop: "uuid",
    },
    {
        label: "名称",
    },
    {
        label: "品牌",
    },
    {
        label: "类别",
    },
    {
        label: "单位",
    },
    {
        label: "修改"
    }
]);
// 获取物品信息
const getProInfo = async (page = 1, otherQueryInfo = {}) => {
    request.get(
        '/admin/propurement',
        {
            params: {
                page: page,
                pageSize: 10,
                openid: userState.openid,
                ...otherQueryInfo //  其他查询信息
            }
        },
    ).then(res => {
        propurementData.value = res.data.data;
        console.log(res);
    }).catch(err => {
        console.log(err.response.data.message);
        ElMessage.error(err.response.data.message);
    })
}

getProInfo();

const currentProPage = ref(1);

watch(currentProPage, (newPage) => {
    getProInfo(newPage);
})

function close() {
    if (showProDialog.value) {
        showHistory.value = false;
        showProDialog.value = false;
    }
}

function open() {

    if (!currentPro.value.data.userPrice) {
        currentPro.value.data.userPrice = {
            user: []
        }
    }

    if (!showProDialog.value) {
        showProDialog.value = true;
    }
}

const showProDialog = ref(false);
// @ts-ignore
const currentPro: Ref<{
    info_type: "info" | "change" | "del",
    data: any
}> = ref({
    info_type: "info",
    data: {}
})

function info(data) {

    currentPro.value.info_type = "info";
    currentPro.value.data = data;
    open();
}

function change(data) {

    currentPro.value.info_type = "change";
    currentPro.value.data = data;
    open();
}

function del(data) {

    currentPro.value.info_type = "del";
    currentPro.value.data = data;
    open();
}


const showHistory = ref(false);

function submitChange() {


    request.post(
        '/admin/propurement',
        {
            openid: userState.openid,
            eventType: 'change',
            propurement: {
                uuid: currentPro.value.data.uuid,
                name: currentPro.value.data.name,
                brand: currentPro.value.data.brand,
                category: currentPro.value.data.category,
                defaultUnits: currentPro.value.data.defaultUnits,
                defaultPage: currentPro.value.data.defaultPage,
            }
        }
    ).then(res => {
        ElMessage.success("修改成功");
        close();
        getProInfo();
    }).catch(err => {
        ElMessage.error(err.response.data.message);
        console.log(err);
    })
}

const showAddTag = ref(false);

const currentTagData = ref("");

function handleInputConfirm() {
    const inputValue = currentTagData.value.trim();
    if (!Array.isArray(currentPro.value.data.defaultUnits)) {
        currentPro.value.data.defaultUnits = [];
    }
    if (inputValue) {
        currentPro.value.data.defaultUnits.push(inputValue);
    }
    showAddTag.value = false;
    currentTagData.value = "";
}

function handleClose(tag) {
    const index = currentPro.value.data.defaultUnits.indexOf(tag);
    if (index > -1) {
        currentPro.value.data.defaultUnits.splice(index, 1);
        console.log(currentPro.value.data.defaultUnits);
    }
}

function submitDel() {
    request.delete(
        '/admin/propurement',
        {
            params: {
                openid: userState.openid,
                uuid: currentPro.value.data.uuid
            }
        }
    ).then(res => {
        ElMessage.success("删除成功");
        close();
        getProInfo();
    }).catch(err => {
        ElMessage.error(err.response.data.message);
        console.log(err);
    })
}
</script>

<style scoped>

</style>