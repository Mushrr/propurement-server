<template>
    <div>

    </div>
</template>

<script lang='ts' setup>
// TODO - add character animation
const props = defineProps<{
    character: string;
    x: number;
    y: number;
}>()

const emits = defineEmits<{
    'update:character': (character: string) => true,
    'update:x': (x: number) => true,
    'update:y': (y: number) => true,
    'upFlow': (index: number) => true
}>()


</script>

<style scoped>

</style>