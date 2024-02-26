<template>
    <el-table :data="userList">
        <el-table-column prop="openid" label="用户Openid"></el-table-column>
        <el-table-column label="公司名称">
            <template #default="scope">
                {{ scope.row.organization.company }}
            </template>
        </el-table-column>
        <el-table-column label="部门">
            <template #default="scope">
                {{ scope.row.organization.department }}
            </template>
        </el-table-column>
        <el-table-column label="地址">
            <template #default="scope">
                {{ scope.row.organization.position }}
            </template>
        </el-table-column>
        <el-table-column label="编辑">
            <template #default="scope">
                <el-button @click="openTradeDialog(scope.row)">创建</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination :total="1000" v-model:current-page="pageIndex"></el-pagination>
    <el-dialog v-model="orderShow" :fullscreen="true">
        <div class="text-center">
            <div class="text-2xl">采购</div>
            <div>
                {{ currentUserInfo.organization?.company }} | {{ currentUserInfo.organization?.department }}
            </div>
            <div class="flex flex-row justify-center items-center text-gray">
                <div class="i-carbon-location"></div>
                <div>{{ currentUserInfo.organization?.position }}</div>
            </div>
            <div class="flex flex-row justify-center">
                <div v-for="principal in currentUserInfo.principals">
                    <el-tag>
                        {{ principal.name }} | {{ principal.phone }}
                    </el-tag>
                </div>
            </div>
        </div>
        <div class="flex flex-row max-h-6xl">
            <div class="flex-1">
                <div v-for="category, ind in categories" :key="category._id"
                    class="text-[1.1rem] pl-4 rounded-rt-4 rounded-rb-4 mb-2 h-3rem line-height-3rem hover:cursor-pointer"
                    @click="currentSelectedCategory = ind"
                    :class="currentSelectedCategory === ind ? 'bg-[#ffffff] border-l-2 border-black' : 'bg-[#f5f5f5]'">
                    {{ category.category }}
                </div>
            </div>
            <div class="flex-[2] overflow-y-scroll h-64rem pl-20 pr-20 mb-100">
                <div class="mb-4 shadow-xl rounded-2xl p-4" v-for="propurement in currentPropurementData">
                    <div class="flex flex-row items-center justify-between">
                        <div class="text-[1.2rem]">{{ propurement.name }}</div>
                        <div v-if="propurement.brand" class="text-[1rem] text-white rounded bg-blue p-2">{{
                            propurement.brand
                        }}</div>
                    </div>
                    <div>
                        类别<el-tag v-for="cat in propurement.category">
                            {{ cat }}
                        </el-tag>
                    </div>
                    <div class="flex flex-row justify-between items-center">
                        <div class="text-gray">
                            {{ propurement.defaultPage }}
                        </div>
                        <div>
                            <el-button class="w-20" @click="openBuyDialog(propurement)">购买</el-button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-[1]">
                <el-table :data="bucketData">
                    <el-table-column prop="propurename" label="名称"></el-table-column>
                    <el-table-column prop="unit" label="单位"></el-table-column>
                    <el-table-column prop="number" label="数量"></el-table-column>
                    <el-table-column label="是否是免配送">
                        <template #default="scope">
                            <el-tag v-if="scope.row.isFree" type="success">是</el-tag>
                            <el-tag v-else type="danger">否</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="历史报价(单价)">
                        <template #default="scope">
                            <div v-for="price in scope.row.lastPrice">
                                <el-tag v-if="price.unit === scope.row.unit">
                                    {{ price.price }} ￥/ {{ scope.row.unit }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="删除">
                        <template #default="scope">
                            <el-button type="danger" @click="deleteItem(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-if="isError">
                    总计: {{ totalPrice }}, 有{{ nums }}个产品没有单价
                </div>
                <div v-else class="text-2xl text-red">
                    总计: {{ totalPrice }}
                </div>
                <div flex flex-row items-center justify-between>
                    <ElDatePicker v-model="transitionTime" placeholder="选择时间" 
                    type="datetime" value-format="YYYY-MM-DD HH:mm:ss"></ElDatePicker>
                    <el-button @click="submitBucket" class="w-50%">提交</el-button>
                </div>
                {{ transitionTime }}
            </div>
        </div>
    </el-dialog>
    <el-dialog v-model="buyDialogShow">
        <el-form>
            <el-form-item size="large" label="产品名称">
                {{ currentPropurement.name }}
            </el-form-item>
            <el-form-item size="large" label="品牌">
                {{ currentPropurement.brand }}
            </el-form-item>
            <el-form-item size="large" label="是否是免配送订单">
                <el-radio-group v-model="transitionDisplay.detail.isFree">
                    <el-radio-button label="true">是</el-radio-button>
                    <el-radio-button label="false">否</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item size="large" label="单位">
                <el-radio-group v-model="transitionDisplay.detail.unit">
                    <el-radio-button v-for="unit in currentPropurement.defaultUnits" :label="unit" :key="unit"
                        :value="unit">
                    </el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item size="large" label="数量">
                <el-input-number v-model="transitionDisplay.detail.number"></el-input-number>
            </el-form-item>
            <el-form-item size="large" label="历史报价">
                <el-tag v-for="price in currentPropurement.lastPrice">
                    {{ price.price }} ￥/ {{ price.unit }}
                </el-tag>
            </el-form-item>
            <el-form-item size="large" label="评论">
                <el-input v-model="transitionDisplay.detail.comment"></el-input>
            </el-form-item>
            <el-form-item label="价格">
                <el-input type="number" v-model="transitionDisplay.detail.price"></el-input>
            </el-form-item>
            <el-form-item label="总计">
                <div class="text-2xl text-red">{{ transitionDisplay.detail.number * transitionDisplay.detail.price }} ￥</div>
            </el-form-item>
            <el-form-item>
                <div class="flex flex-row w-100%">
                    <el-button type="primary" @click="submitBuy">提交</el-button>
                    <el-button type="primary" @click="buyDialogClose">取消</el-button>
                </div>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script lang='ts' setup>
import useUser from '../../states/useUser';
import {
    ElTable, ElTableColumn, ElButton, ElDialog, ElTag, ElDescriptions,
    ElDescriptionsItem, ElSelect, ElOption, ElForm, ElFormItem,
    ElInput, ElPagination, ElRadioGroup, ElRadioButton, ElInputNumber,
    ElMessage,
ElDatePicker
} from 'element-plus';
import { Ref, ref, watch } from 'vue'
import request from '../../request';

const userState = useUser();

type UserType = "admin" | "user" | "agent" | "unknown"

interface UserInfo {
    openid: string;
    user_type?: UserType;
    organization?: {
        company: string;
        department: string;
        position: string;
        principal: string;
    };
    principals: {
        name: string,
        phone: string,
        password: string
    }[]
}

const userList: Ref<UserInfo[]> = ref([]);
const pageIndex = ref(1);

const getUser = (query = {
    user_type: "user"
}) => {
    request.get(
        '/admin/user',
        {
            params: {
                openid: userState.openid,
                page: pageIndex.value,
                pageSize: 10,
                ...query
            }
        }
    ).then(res => {
        console.log(res.data);
        userList.value = res.data.data;
    })
}

getUser()

watch(() => pageIndex.value, (nv) => {
    getUser()
})

const orderShow = ref(false);
const currentUserInfo: Ref<UserInfo> = ref({} as UserInfo);

const orderShowFunc = () => {
    if (!orderShow.value) {
        orderShow.value = true
    }
}

const orderCloseFunc = () => {
    if (orderShow.value) {
        orderShow.value = false
    }
}

const openTradeDialog = (userInfo: UserInfo) => {
    currentUserInfo.value = userInfo
    getUserBucket();
    orderShowFunc();
}


const categories: Ref<{
    _id: string,
    category: string,
}[]> = ref([]);

interface Propurement {
    category: string[],
    defaultUnits: string[],
    lastChange: { $timestamp: string },
    name: string,
    uuid: string,
    _id: string,
    brand: string,
    defaultPage: string,
    userPrice: {
        user: { openid: string, unit: string, price: number }[]
    },
    agentPrice: {
        agent: { agent: string, unit: string, price: number }[]
    },
    lastPrice: { price: number, unit: string }[]
}

const currentPropurementData: Ref<Propurement[]> = ref([{
    category: [],
    defaultUnits: [],
    lastChange: { $timestamp: "12123" },
    name: '',
    uuid: '',
    _id: '',
    brand: '',
    defaultPage: '',
    userPrice: {
        user: [{ openid: '', unit: '', price: 0 }]
    },
    agentPrice: {
        agent: [{ agent: '', unit: '', price: 0 }]
    },
    lastPrice: [{ price: 0, unit: '' }]
}]);

const getPropurementData = ({ category }: { category: string }) => {
    request.get(
        '/propurement',
        {
            params: {
                openid: userState.openid,
                category: currentCategory.value,
                page: 1,
                pageSize: 1000
            }
        },
    ).then(res => {
        console.log(res.data.data);
        currentPropurementData.value = res.data.data;
    })
}

const getCategories = () => {
    request.get('/ratio', {
        params: {
            openid: userState.openid,
            ratio: 'category'
        }
    }).then(res => {
        categories.value = res.data.data;
        currentCategory.value = categories.value[0].category;
        getPropurementData({
            category: currentCategory.value
        });
    })
}

getCategories();

const currentSelectedCategory = ref(0);
const currentCategory = ref("");


watch(() => currentSelectedCategory.value, (nv) => {
    currentCategory.value = categories.value[nv].category;
    getPropurementData({
        category: currentCategory.value
    });
})


const buyDialogShow = ref(false);
// @ts-ignore
const currentPropurement: Ref<any> = ref({});

const buyDialogOpen = () => {
    if (!buyDialogShow.value) {
        buyDialogShow.value = true;
    }
}

const buyDialogClose = () => {
    if (buyDialogShow.value) {
        buyDialogShow.value = false;
    }
    transitionClear();
}

const openBuyDialog = async (propurementInfo: Propurement) => {
    currentPropurement.value = propurementInfo
    const historyData = (await getHistoryData(currentPropurement.value.uuid)).data.data;
    // @ts-ignore    
    currentPropurement.value.lastPrice = historyData.length === 1 ? historyData[0].lastPrice : 0;
    buyDialogOpen();
}

const transitionDisplay = ref({
    uuid: "",
    openid: "",
    detail: {
        number: 1,
        unit: "",
        comment: "",
        isFree: false,
        price: 0
    }
})

const transitionClear = () => {
    transitionDisplay.value = {
        uuid: "",
        openid: "",
        detail: {
            number: 1,
            unit: "",
            comment: "",
            isFree: false,
            price: 0
        }
    }
}

const submitBuy = () => {
    if (transitionDisplay.value.detail.number <= 0) {
        ElMessage.error("数量不能小于0");
        return;
    } else if (transitionDisplay.value.detail.unit === "") {
        ElMessage.error("请选择单位");
        return;
    } else {
        const submitData = {
            uuid: currentPropurement.value.uuid,
            openid: currentUserInfo.value.openid,
            detail: {
                number: transitionDisplay.value.detail.number,
                unit: transitionDisplay.value.detail.unit,
                comment: transitionDisplay.value.detail.comment,
                isFree: transitionDisplay.value.detail.isFree
            },
        };
        request.post(
            '/propurement',
            {
                propurename: currentPropurement.value.name,
                ...submitData
            }
        ).then(res => {
            ElMessage.success(`成功添加了${currentPropurement.value.name}`)
            getUserBucket();
            buyDialogClose();
            console.log(res);
        })
        request.post(
            '/price',
            {
                openid: currentUserInfo.value.openid,
                uuid: currentPropurement.value.uuid,
                price: transitionDisplay.value.detail.price,
                unit: transitionDisplay.value.detail.unit,
            }
        )
    }
}

watch(() => transitionDisplay.value.detail.unit, (nv) => {
    for (let i = 0; i < currentPropurement.value.lastPrice.length; i++) {
        if (currentPropurement.value.lastPrice[i].unit === nv) {
            transitionDisplay.value.detail.price = currentPropurement.value.lastPrice[i].price;
            return;
        }
    }
})


const bucketData: Ref<Propurement[]> = ref([]);

const getHistoryData = async (uuid: string) => {
    return request.get(
        '/price',
        {
            params: {
                page: 1,
                pageSize: 1,
                uuid: uuid,
                openid: currentUserInfo.value.openid
            }
        }
    )
}

const getUserBucket = () => {
    request.get(
        '/bucket',
        {
            params: {
                openid: currentUserInfo.value.openid
            }
        }
    ).then(async res => {
        console.log(res.data);
        bucketData.value = res.data.data;
        for (let i = 0; i < bucketData.value.length; i++) {
            const historyData = await (await getHistoryData(bucketData.value[i].uuid)).data.data;
            console.log(historyData);
            bucketData.value[i].lastPrice = historyData.length === 1 ? historyData[0].lastPrice : [];
        }
        summaryPrice();
    })
}

const totalPrice = ref(0);
const isError = ref(false);
const nums = ref(0);
const summaryPrice = () => {
    totalPrice.value = 0;
    isError.value = false;
    nums.value = 0;
    console.log(bucketData.value);
    for (let i = 0; i < bucketData.value.length; i++) {
        let find = false;
        for (let price of bucketData.value[i].lastPrice) {
            // @ts-ignore
            if (price.unit === bucketData.value[i].unit) {
                // @ts-ignore
                totalPrice.value += price.price * bucketData.value[i].number;
                find = true;
            }
        }
        if (!find) {
            isError.value = true;
            nums.value += 1;
        }
    }
}

// @ts-ignore
const deleteItem = (data) => {
    console.log(data);
    request.delete(
        '/propurement',
        {
            params: {
                uuid: data.uuid,
                openid: data.openid,
            }
        }
    ).then(res => {
        getUserBucket();
        ElMessage.success(`成功删除了${data.propurename}`)
    })
}

const transitionTime = ref();
const submitBucket = () => {
    // submitBucket
    request.post(
        '/bucket',
        {
            openid: currentUserInfo.value.openid,
            lastModified: new Date(transitionTime.value).getTime(),
        }
    ).then(res => {
        ElMessage.success("提交订单成功");
        getUserBucket();
    }).catch(err => {
        ElMessage.error("提交订单失败");
    })
}
</script>

<style scoped>

</style>