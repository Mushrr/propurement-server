<template>
    <div class="text-center mr-4">
        <div>
            <div class="border-l-4 border-blue mb-5">尝试输入一些成语吧!</div>
            <div id="mi-input" class="flex flex-row items-center place-content-center">
                <input type="text" ref="input_1" @keypress.enter="search" @input="validateInput(0, $event)"
                v-model="characters[0]" />
                <input type="text" ref="input_2" @keypress.enter="search" @input="validateInput(1, $event)"
                    v-model="characters[1]" />
                <input type="text" ref="input_3" @keypress.enter="search" @input="validateInput(2, $event)"
                    v-model="characters[2]" />
                <input type="text" ref="input_4" @keypress.enter="search" @input="validateInput(3, $event)"
                    v-model="characters[3]" />
            </div>
            <div v-if="hasSearched">
                {{idiomInfo}}
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { ElMessage } from "element-plus";
import { ref, watch } from "vue";
import request from "../../request";
import useUser from "../../states/useUser";

const userState = useUser();

interface StoryInstance {
    _id: string,
    story_type: string,
    story_text: string,
    story_id: string,
    story_code: string,
    images?: string[],
    video?: string[],
    audio?: string[],
}

interface Stroy {
    history: StoryInstance[]
}

interface Usage {
    usage_code: string,
    usage_id: string,
    idiom_text: string,
    last_change: string,
}

interface IdiomInfo {
    idiom_text: string,
    pronounce: string,
    times: number,
    idiom_code: string,
    story_code: string,
    usage_code: string,
    recommend_code: string,
    stories: Stroy[],
    usages: Usage[],
}

const hasSearched = ref(false);
const idiomInfo = ref<IdiomInfo | null>(null);

const characters = ref<string[]>([
    "",
    "",
    "",
    ""
]);

const input_1 = ref<HTMLElement | null>(null);
const input_2 = ref<HTMLElement | null>(null);
const input_3 = ref<HTMLElement | null>(null);
const input_4 = ref<HTMLElement | null>(null);

const inputMap = [
    input_1,
    input_2,
    input_3,
    input_4
]

function focus(el: HTMLElement) {
    el.focus();
}

function move(index: number, e: KeyboardEvent) {
    console.log(e);
    switch (e.key) {
        case "ArrowRight":
            if (index < 3) {
                focus(inputMap[index + 1].value!);
            }
            break;
        case "ArrowLeft":
            if (index > 0) {
                focus(inputMap[index - 1].value!);
            }
            break;
    }
}

watch(characters, (newVal, oldVal) => {
    console.log(newVal);
    console.log(oldVal);
});

function validateInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value: string = input.value;
    console.log(value);
    // 中文正则匹配
    const chineseReg = /^[\u4e00-\u9fa5]{0,}$/;
    if (value.length > 0 && value.match(chineseReg)) {
        input.value = value[0];
        if (value.length > 1) {
            value.split("").forEach((char: string, i: number) => {
                if (i > 0) {
                    characters.value[i + index] = char;
                }
            })
        }
        if (index < 3) {
            focus(inputMap[index + 1].value!);
        }
    }
}

function search() {
    const idiom = characters.value.join("");
    request({
        url: "/idiom/get",
        method: "get",
        params: {
            idiom,
            needAll: 1
        },
        headers: {
            authorization: userState.token_id
        }
    }).then((res) => {
        console.log(res);
        if (res.data.data === null) {
            ElMessage.warning(`未找到${idiom}!`);
        } else if (res.status === 200) {
            hasSearched.value = true;
            idiomInfo.value = res.data.data;
        }
    }).catch((err) => {
        console.log(err);
        ElMessage.error(`${idiom}查询失败，是否存在此成语？`)
    })
}

</script>

<style scoped>
#mi-input > * {
    width: 50px;
    height: 50px;
    background-color: #ccccccf2;
    padding: 0;
    margin-right: 20px;
    font-size: 30px;
    font-weight: 400;
    font-family: 'FangSong';
    text-align: center;
    box-shadow: 0 0 10px 0 #f3f3f3;
    border: 1px solid #f3f3f3;
    background: url(/mi.svg) center no-repeat;
}

#mi-input:last-child {
    margin-right: 0;
}
</style>