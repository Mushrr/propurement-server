<template>
    <el-row :gutter="24">
        <el-col :span="8">
            <el-card>
                <!-- 这里是今日 -->
                <span flex flex-row items-center justify-between>
                    <span>
                        <span text-2xl>今日收益: </span>
                        <span text-2xl>{{ todayIncome.toFixed(2) }}￥</span>
                    </span>
                    <span v-if="todayIncome - yesterdayIncome > 0" text-green-700 flex flex-row items-center>
                        {{ (todayIncome - yesterdayIncome).toFixed(2) }}
                        <div i-carbon-arrow-up></div>
                    </span>
                    <span v-else text-red-700 flex flex-row items-center>
                        {{ (todayIncome - yesterdayIncome).toFixed(2) }}
                        <div i-carbon-arrow-down></div>
                    </span>
                </span>
                <el-progress :percentage="todayIncome / 1000 * 100" status="success" />
                <div text-xl flex flex-row items-center justify-between>
                    <span>收益目标: 1000￥</span>
                    <span v-if="todayIncome / 1000 * 100 > 100" text-green-700>
                        完成率：{{ (todayIncome / 1000 * 100).toFixed(2) }}%
                    </span>
                    <span v-else text-red-700>
                        完成率：{{ (todayIncome / 1000 * 100).toFixed(2) }}%
                    </span>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8">
            <el-card>
                <span flex flex-row items-center justify-between>
                    <span>
                        <span text-2xl>月度收益: </span>
                        <span text-2xl>{{ monthIncome.toFixed(2) }}￥</span>
                    </span>
                    <span v-if="monthIncome - lastMonthIncome > 0" text-green-700 flex flex-row items-center>
                        {{ (monthIncome - lastMonthIncome).toFixed(2) }}
                        <div i-carbon-arrow-up></div>
                    </span>
                    <span v-else text-red-700 flex flex-row items-center>
                        {{ (monthIncome - lastMonthIncome).toFixed(2) }}
                        <div i-carbon-arrow-down></div>
                    </span>
                </span>
                <el-progress :percentage="monthIncome / 10000 * 100" status="success" />
                <div text-xl flex flex-row items-center justify-between>
                    <span>收益目标: 10000￥</span>
                    <span v-if="monthIncome / 10000 * 100 > 100" text-green-700>
                        完成率：{{ (monthIncome / 10000 * 100).toFixed(2) }}%
                    </span>
                    <span v-else text-red-700>
                        完成率：{{ (monthIncome / 10000 * 100).toFixed(2) }}%
                    </span>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8">
            <el-card>
                <!-- 这里是年收益 -->
                <span flex flex-row items-center justify-between>
                    <span>
                        <span text-2xl>年度收益: </span>
                        <span text-2xl>{{ yearIncome.toFixed(2) }}￥</span>
                    </span>
                </span>
                <el-progress :percentage="yearIncome / 100000 * 100" status="success" />
                <div text-xl flex flex-row items-center justify-between>
                    <span>收益目标: 100000￥</span>
                    <span v-if="yearIncome / 100000 * 100 > 100" text-green-700>
                        完成率：{{ (yearIncome / 100000 * 100).toFixed(2) }}%
                    </span>
                    <span v-else text-red-700>
                        完成率：{{ (yearIncome / 100000 * 100).toFixed(2) }}%
                    </span>
                </div>
            </el-card>
        </el-col>
    </el-row>
    <el-row :gutter="24" class="mt-2">
        <el-col :span="8">
            <el-card>
                日收益折线
                <el-select v-model="currentMonth">
                    <el-option v-for="i in 12" :value="i" :label="i"></el-option>
                </el-select>
                <div>
                    <Line :data="dayData" :options="options"></Line>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8">
            <el-card>
                月收益折线
                <div>
                    <Line :data="monthData" :options="options"></Line>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8">
            <el-card>
                物品购买频次
                <el-select v-model="rank">
                    <el-option v-for="i in 3" :value="i * 10" :label="i * 10"></el-option>
                </el-select>
                <div>
                    <Line :data="itemPie" :options="options" />
                </div>
            </el-card>
        </el-col>
    </el-row>
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
import { Ref, ref, watch, computed, onBeforeMount } from 'vue'
import request from '../../request';
import Drag from '../../components/Drag.vue'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line, Pie } from 'vue-chartjs'
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)


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

type AnyObject = {
    [key: string]: any
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
    buyer: {
        openid: string,
        organization: {
            company: string,
            department: string,
            position: string,
        }
    },
    agentDetail: {
        unit: string,
        price: number,
        number: number,
        comment: string,
    },
    lastModified: string,
    [props: string]: string | number | undefined | AnyObject | AnyObject[] | { openid: string, unit: string, price: number }[]
}

let yearData: Ref<PurchaseRecord[]> = ref([]);
const getYearData = async () => request.get(
    '/admin/history',
    {
        params: {
            openid: userState.openid,
            page: 1,
            pageSize: 100000000,
            state: "finished",
            start: new Date(new Date().getFullYear(), 0, 1),
            end: new Date(new Date().getFullYear(), 11, 31)
        }
    }
).then(res => {
    yearData.value = res.data.data;
    ElMessage.success("获取成功");
})

onBeforeMount(() => {
    getYearData();
})

const todayIncome = computed(() => {
    let income = 0;
    const filtered = yearData.value.filter(item => {
        const date = new Date(item.lastModified);
        return date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate();
    })
    filtered.forEach(item => {
        if (item.agentDetail) {
            // @ts-ignore
            income += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return income;
})

const yesterdayIncome = computed(() => {
    let income = 0;
    const filtered = yearData.value.filter(item => {
        const date = new Date(item.lastModified);
        return date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate() - 1;
    })
    filtered.forEach(item => {
        if (item.agentDetail) {
            // @ts-ignore
            income += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return income;
})

const monthIncome = computed(() => {
    let income = 0;
    const filtered = yearData.value.filter(item => {
        const date = new Date(item.lastModified);
        return date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth();
    })
    filtered.forEach(item => {
        if (item.agentDetail) {
            // @ts-ignore
            income += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return income;
})

const lastMonthIncome = computed(() => {
    let income = 0;
    const filtered = yearData.value.filter(item => {
        const date = new Date(item.lastModified);
        return date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() - 1;
    })
    filtered.forEach(item => {
        if (item.agentDetail) {
            // @ts-ignore
            income += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return income;
})

const yearIncome = computed(() => {
    let income = 0;
    const filtered = yearData.value.filter(item => {
        const date = new Date(item.lastModified);
        return date.getFullYear() === new Date().getFullYear();
    })
    filtered.forEach(item => {
        if (item.agentDetail) {
            // @ts-ignore
            income += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return income;
})

// 当月收益，绘制成适合vue-chartsjs 的数据
const monthIncomeData = computed(() => {
    const data: any[] = [];
    for (let i = 0; i < new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(); i++) {
        data.push(0);
    }
    yearData.value.forEach(item => {
        const date = new Date(item.lastModified);
        if (date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth()) {
            // @ts-ignore
            data[date.getDate() - 1] += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return data;
})

const getMonthIncome = (month: number) => {
    let income = 0;
    const filtered = yearData.value.filter(item => {
        const date = new Date(item.lastModified);
        return date.getFullYear() === new Date().getFullYear() && date.getMonth() === month;
    })
    filtered.forEach(item => {
        if (item.agentDetail) {
            // @ts-ignore
            income += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return income;
}

const getDayIncome = (day: number, month: number) => {
    let income = 0;
    const filtered = yearData.value.filter(item => {
        const date = new Date(item.lastModified);
        return date.getFullYear() === new Date().getFullYear() && date.getMonth() === month - 1 && date.getDate() === day;
    })
    filtered.forEach(item => {
        if (item.agentDetail) {
            // @ts-ignore
            income += (item.price - item.agentDetail.price) * item.agentDetail.number;
        }
    })
    return income;
}

const options = {
    responsive: true,
    maintainAspectRatio: false
}

const monthData = computed(() => {
    let monthData = [];
    for (let i = 0; i < 12; i++) {
        monthData.push(getMonthIncome(i));
    }
    return {
        labels: ['一月', '二月', '三月', '四月', '五月', '六月', "七月", "八月", "九月", "十月", "十一月", "十二月"],
        datasets: [
            {
                label: '收益',
                data: monthData,
                backgroundColor: 'rgb(203, 97, 130)'
            }
        ]
    }
})

const currentMonth = ref(new Date().getMonth() + 1);
const dayData = ref<{
    labels: number[],
    datasets: any[]
}>({
    labels: [],
    datasets: []
})

watch([yearData, currentMonth], (nv) => {
    let [_, month] = nv;
    let tmp = []
    for (let i = 0; i < new Date(new Date().getFullYear(), currentMonth.value + 1, 0).getDate(); i++) {
        tmp.push(getDayIncome(i, month));
    }
    dayData.value = {
        labels: tmp.map((item, index) => index + 1),
        datasets: [
            {
                label: '收益',
                data: tmp,
                backgroundColor: 'rgb(86, 128, 160)'
            }
        ]
    }
})

const itemCount = {
    labels: [],
    datasets: [
        {
            label: '数量',
            data: [],
        }
    ]
}
const itemPie = ref<{
    labels: string[],
    datasets: any[]
}>({
    labels: [],
    datasets: []
})
const rank = ref(10);
watch([yearData, rank], (newVal) => {
    const [nv, rank] = newVal;
    const dict = {}
    nv.forEach(item => {
        if (item) {
            // @ts-ignore
            if (dict[item.propurename]) {
                // @ts-ignore
                dict[item.propurename] += item.number;
            } else {
                // @ts-ignore
                dict[item.propurename] = item.number;
            }
        }
    })
    const items = []
    for (const key in dict) {
        items.push({
            name: key,
            // @ts-ignore
            number: dict[key]
        })
    }
    items.sort((a, b) => b.number - a.number);

    const labels = []
    const data = []
    for (const key of items) {
        // @ts-ignore
        if (['labels', 'datasets'].indexOf(key['name']) === -1) {
            // @ts-ignore
            data.push(Number(key['number']));
            labels.push(key['name']);
        }
    }
    // @ts-ignore
    itemPie.value = {
        labels: labels.slice(0, rank),
        datasets: [
            {
                label: '购买次数',
                data: data.slice(0, rank)
            }
        ]
    }
})

</script>

<style scoped></style>