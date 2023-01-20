<template>
    <div>
        <button @click="fetchData">测试</button>
    </div>
    <div>
        {{ userData }}
    </div>
</template>

<script lang='ts' setup>
import request from '../request'
import { ref, Ref } from 'vue'

const userData = ref([])

function fetchData() {
    request.get(
        '/admin/user',
        {
            params: {
                openid: "MUSHROOM",
                userOpenid: ["MUSHROOM", "Cookie"]
            }
        }
    ).then(res => {
        userData.value = res.data.data;
        console.log(res.data.data);
    })
}


</script>

<style scoped>

</style>