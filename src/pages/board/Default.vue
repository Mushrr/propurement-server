<template>
    <div>
        <!-- TODO -->
        <!-- User Hello -->
        {{ userState }}
    </div>
</template>

<script lang='ts' setup>
import useUser from '../../states/useUser';


const userState = useUser()
</script>

<style scoped>

</style>