<template>
    <el-form class="p-4">
        <el-form-item label="名称">
            <el-input v-model="currentPro.name"></el-input>
        </el-form-item>
        <el-form-item label="品牌">
            <el-radio-group v-model="currentPro.brand">
                <el-radio-button v-for="brand in ratioInfo.brand" :key="brand.brand" :label="brand.brand">
                    {{ brand.brand }}
                </el-radio-button>
            </el-radio-group>
            <el-input v-model="currentPro.brand"></el-input>
        </el-form-item>
        <el-form-item label="类别">
            <el-checkbox-group v-model="currentPro.category">
                <el-checkbox-button v-for="u in ratioInfo.category" :key="u.category" :label="u.category">
                    {{ u.category }}
                </el-checkbox-button>
            </el-checkbox-group>
            <el-input v-model="category"></el-input>
        </el-form-item>
        <el-form-item label="单位">
            <el-checkbox-group v-model="currentPro.defaultUnits">
                <el-checkbox-button v-for="u in ratioInfo.unit" :key="u.unit" :label="u.unit">
                    {{ u.unit }}
                </el-checkbox-button>
            </el-checkbox-group>
            <el-input v-model="unit"></el-input>
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
    ElInput, ElPagination, ElCheckbox, ElCheckboxGroup, ElCheckboxButton,
    ElMessage, ElRadioButton, ElRadioGroup
} from 'element-plus';
import { Ref, ref, watch } from 'vue'
import request from '../../request';

const userState = useUser();

const currentPro: Ref<{
    name: string,
    brand: string,
    category: string[],
    defaultUnits: string[],
    defaultPage: string
}> = ref({
    name: '',
    brand: '',
    category: [],
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

// @ts-ignore
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
        category: [],
        defaultUnits: [],
        defaultPage: ''
    }
    unit.value = '';
    category.value = '';
}


function submit() {
    if (currentPro.value.name == '') {
        ElMessage.error('名称不能为空');
        return;
    } else if (category.value == '') {
        ElMessage.error('类别不能为空');
        return;
    } else if (unit.value == "") {
        ElMessage.error('单位不能为空');
        return;
    } else if (unit.value.indexOf('，')  !== -1) {
        ElMessage.error('请勿输入中文逗号');
        return;
    } else if (category.value.indexOf('，')  !== -1) {
        ElMessage.error('请勿输入中文逗号');
        return;
    }

    // @ts-ignore
    const filterFunc = (v) => {
        if (v === "") {
            return false
        } else {
            return true
        }
    };
    let defaultUnits = unit.value.split(',');
    defaultUnits = defaultUnits.filter(filterFunc)

    let currentCategory = category.value.split(',');
    currentCategory = currentCategory.filter(filterFunc); 

    request.post(
        '/admin/propurement',
        {
            eventType: 'add',
            openid: userState.openid,
            propurement: {
                name: currentPro.value.name,
                brand: currentPro.value.brand,
                category: currentCategory,
                defaultUnits: defaultUnits,
                defaultPage: currentPro.value.defaultPage
            }
        }
    ).then(res => {
        ElMessage.success("添加成功");
        clean();
        fetchAllRatio();
    }).catch(err => {
        ElMessage.error(err.response.data.message);
    })
}


const ratioInfo = ref({
    unit: [
        {
            unit: ""
        }
    ],
    brand: [
        {
            brand: ""
        }
    ],
    category: [
        {
            category: ""
        }
    ]
})

const fetchRatio = (ratioName: "unit" | "brand" | "category") => {
    request.get(
        '/ratio',
        {
            params: {
                openid: userState.openid,
                ratio: ratioName
            }
        }
    ).then((res) => {
        ratioInfo.value[ratioName] = res.data.data;
    }).catch((err) => {
        ElMessage.error(err.response.data.message);
    })
}

const fetchAllRatio = () => {
    fetchRatio("unit");
    fetchRatio("brand");
    fetchRatio("category");
}

fetchAllRatio();


// 单位单选

const unit = ref("");

watch(() => currentPro.value.defaultUnits, (nv, ov) => {
    console.log("这里");
    if (nv.length > ov.length) {
        if (unit.value.indexOf(nv[nv.length - 1]) === -1) {
            if (unit.value === "") {
                unit.value += nv[nv.length - 1] + ",";
            } else {
                unit.value += nv[nv.length - 1] + ",";
            }
        }
    } else if (nv.length < ov.length) {
        for (let i = 0; i < ov.length; i++) {
            if (nv.indexOf(ov[i]) == -1) {
                const index = unit.value.indexOf(ov[i]);
                if (index + ov[i].length < unit.value.length && unit.value[index + ov[i].length] !== ',') {
                    unit.value = unit.value.replace(ov[i], "");
                } else {
                    unit.value = unit.value.replace(ov[i] + ",", "");
                }
            }
        }
    }
})

// @ts-ignore
watch(() => unit.value, (nv, ov) => {
    // @ts-ignore
    const filterFunc = (v) => {
        if (v === "") {
            return false
        } else {
            return true
        }
    };
    const newUnits = nv.split(',').filter(filterFunc);
    for (const unit of currentPro.value.defaultUnits) {
        if (newUnits.indexOf(unit) == -1) {
            const index = currentPro.value.defaultUnits.indexOf(unit);
            if (index > -1) {
                currentPro.value.defaultUnits.splice(index, 1);
            }
        } else {
            currentPro.value.defaultUnits = newUnits;
        }
    }
})

// 类别 category

const category = ref("");

watch(() => currentPro.value.category, (nv, ov) => {
    if (nv.length > ov.length) {
        if (category.value.indexOf(nv[nv.length - 1]) == -1) {
            if (category.value === "") {
                category.value += nv[nv.length - 1] + ",";
            } else {
                category.value += nv[nv.length - 1] + ",";
            }
        }
    } else if (nv.length < ov.length) {
        for (let i = 0; i < ov.length; i++) {
            if (nv.indexOf(ov[i]) == -1) {
                const index = category.value.indexOf(ov[i]);
                if (index + ov[i].length < category.value.length && category.value[index + ov[i].length] !== ',') {
                    category.value = category.value.replace(ov[i], "");
                } else {
                    category.value = category.value.replace(ov[i] + ",", "");
                }
            }
        }
    }
})

watch(() => category.value, (nv, ov) => {
    // @ts-ignore
    const filterFunc = (v) => {
        if (v === "") {
            return false
        } else {
            return true
        }
    };
    const newUnits = nv.split(',').filter(filterFunc);
    for (const unit of currentPro.value.category) {
        if (newUnits.indexOf(unit) == -1) {
            const index = currentPro.value.category.indexOf(unit);
            if (index > -1) {
                currentPro.value.category.splice(index, 1);
            }
        } else {
            currentPro.value.category = newUnits;
        }
    }
})

</script>

<style scoped>

</style>