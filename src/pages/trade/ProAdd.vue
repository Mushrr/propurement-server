<template>
    <el-form>
        <el-form-item label="名称">
            <el-input v-model="currentPro.name"></el-input>
        </el-form-item>
        <el-form-item label="品牌">
            <el-input v-model="currentPro.brand"></el-input>
        </el-form-item>
        <el-form-item label="类别">
            <el-input v-model="currentPro.category"></el-input>
        </el-form-item>
        <el-form-item label="单位">
            <el-tag v-for="tag in currentPro.defaultUnits" :key="tag" class="mx-1" closable :disable-transitions="false"
                @close="handleClose(tag)">
                {{ tag }}
            </el-tag>
            <el-input v-if="showAddTag" ref="InputRef" v-model="currentTagData" class="ml-1 w-20" size="small"
                @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
            <el-button v-else class="button-new-tag ml-1" size="small" @click="showAddTag = true">
                + New Tag
            </el-button>
        </el-form-item>
        <el-form-item label="备注">
            <el-input v-model="currentPro.defaultPage"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
    </el-form>
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

const currentPro: Ref<{
    name: string,
    brand: string,
    category: string,
    defaultUnits: string[],
    defaultPage: string
}> = ref({
    name: '',
    brand: '',
    category: '',
    defaultUnits: [],
    defaultPage: ''
})

const showAddTag = ref(false);
const currentTagData = ref("");

function handleInputConfirm() {
    const inputValue = currentTagData.value.trim();
    if (!Array.isArray(currentPro.value.defaultUnits)) {
        currentPro.value.defaultUnits = [];
    }
    if (inputValue) {
        currentPro.value.defaultUnits.push(inputValue);
    }
    showAddTag.value = false;
    currentTagData.value = "";
}

function handleClose(tag) {
    const index = currentPro.value.defaultUnits.indexOf(tag);
    if (index > -1) {
        currentPro.value.defaultUnits.splice(index, 1);
        console.log(currentPro.value.defaultUnits);
    }
}

function clean() {
    currentPro.value = {
        name: '',
        brand: '',
        category: '',
        defaultUnits: [],
        defaultPage: ''
    }
}


function submit() {
    if (currentPro.value.name == '') {
        ElMessage.error('名称不能为空');
        return;
    } else if (currentPro.value.category == '') {
        ElMessage.error('类别不能为空');
        return;
    } else if (currentPro.value.defaultUnits.length == 0) {
        ElMessage.error('单位不能为空');
        return;
    }

    request.post(
        '/admin/propurement',
        {
            eventType: 'add',
            openid: userState.openid,
            propurement: {
                name: currentPro.value.name,
                brand: currentPro.value.brand,
                category: currentPro.value.category,
                defaultUnits: currentPro.value.defaultUnits,
                defaultPage: currentPro.value.defaultPage
            }
        }
    ).then(res => {
        ElMessage.success("添加成功");
        clean();
    }).catch(err => {
        ElMessage.error(err.response.data.message);
    })
}
</script>

<style scoped>

</style>