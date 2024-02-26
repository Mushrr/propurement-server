<template>
    <div absolute rounded-xl ref="dragElement" :style="{
        left: afterTransformX + 'px',
        top: afterTransformY + 'px',
        width: props.w + 'px',
        height: visiable ? props.h : 0 + 'px',
        zIndex: props.zIndex,
    }"
    >
        <div rounded-t-xl cursor-move text-center select-none bg-gray-200 h-8 shadow-xl :style="{
            borderRadius: visiable ? '20px 20px 0 0' : '20px'
        }" @mousedown="startMove($event)" @mousemove="onMove()" @mouseup="move = false">
            <slot name="title"></slot>
        </div>
        <div i-carbon-close class="absolute right-0 top-1 text-2xl" rounded-full hover:bg-red-500 hover:rotate-360
            transition-all duration-200 @click="visiable = !visiable"></div>
        <div ref="contentElement" transition-all duration-200 overflow-scroll shadow-xl rounded-b-xl :style="{
            width: (visiable ? props.w : 0) + 'px',
            height: (visiable ? props.h : 0) + 'px',
        }">
            <slot name="default"></slot>
        </div>
    </div>
</template>

<!-- 点击即可移动，样式绑定是可取的 -->

<script setup lang="ts">
import { ref, Ref, watch } from 'vue'
import { useMouse } from '@vueuse/core'

const { x, y } = useMouse()
const props = defineProps({
    w: {
        type: Number,
        default: 0,
    },
    h: {
        type: Number,
        default: 0,
    },
    zIndex: {
        type: Number,
        default: 0,
    },
    isOpen: {
        type: Boolean,
        default: false
    }
})

const afterTransformX = ref(100)
const afterTransformY = ref(100)
const offsetX = ref(0)
const offsetY = ref(0)
const dragElement: Ref<HTMLDivElement | null> = ref(null)
const contentElement: Ref<HTMLDivElement | null> = ref(null)
const move = ref(false)
const visiable = ref(false)
visiable.value = props.isOpen

function startMove(e: MouseEvent) {
    move.value = true
    offsetX.value = e.offsetX
    offsetY.value = e.offsetY
}

function onMove() {
    if (move.value) {
        afterTransformX.value = x.value - offsetX.value
        afterTransformY.value = y.value - offsetY.value
    }
}

watch([x, y], () => {
    if (move.value) {
        afterTransformX.value = x.value - offsetX.value
        afterTransformY.value = y.value - offsetY.value
    }
})

watch(visiable, () => {
    if (visiable.value) {
        contentElement.value?.classList.remove('hidden')
    } else {
        contentElement.value?.classList.add('hidden')
    }
})
</script>

<style>
.displayNone {
    display: none;
}

.hidden {
    opacity: 0;
}

.show {
    opacity: 1;
}
</style>