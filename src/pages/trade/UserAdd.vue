<template>
    <div class="p-10">
        <el-form :model="userInfo" label-width="200px">
            <el-form-item label="微信Openid">
                <el-input v-model="userInfo.openid" placeholder="请输入微信Openid(未添加将系统生成)"></el-input>
            </el-form-item>
            <el-form-item label="用户类型">
                <el-select v-model="userInfo.user_type" placeholder="请选择用户类型">
                    <el-option label="管理员" value="admin"></el-option>
                    <el-option label="用户" value="user"></el-option>
                    <el-option label="代理商" value="agent"></el-option>
                    <el-option label="未知" value="unknown"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="公司">
                <el-input v-model="userInfo.organization.company" placeholder="请输入公司名称"></el-input>
            </el-form-item>
            <el-form-item label="地址">
                <el-input v-model="userInfo.organization.position" placeholder="请输入地址"></el-input>
            </el-form-item>
            <el-form-item label="当前用户">
                <template class="grid grid-cols-2 mt-10" v-for="el, i in userInfo.principals">
                    <el-form label-width="200">
                        <el-form-item label="用户名称">
                            <el-input v-model="userInfo.principals[i].name" placeholder="请输入名字"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号(用来登录)">
                            <el-input v-model="userInfo.principals[i].phone" placeholder="请输入电话"></el-input>
                        </el-form-item>
                        <el-form-item label="密码">
                            <el-input v-model="userInfo.principals[i].password" placeholder="请输入密码"></el-input>
                        </el-form-item>
                        <el-form-item label="删除用户">
                            <el-button type="danger" @click="deleteUser(i)">删除用户</el-button>
                        </el-form-item>
                    </el-form>
                </template>
                <el-button @click="addUser">添加一个新用户</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="changeUserData">提交</el-button>
            </el-form-item>
        </el-form>
    </div>
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


const userInfo = ref({
    openid: "",
    user_type: "",
    principals: [
        {
            name: "",
            phone: "",
            password: ""
        },
    ],
    organization: {
        company: "",
        department: "",
        position: ""
    }
})

// 删除用户

function deleteUser(ind: number) {
    userInfo.value.principals.splice(ind, 1);
}

function addUser() {
    userInfo.value.principals.push({
        name: "",
        phone: "",
        password: ""
    })
}

function changeUserData() {
    // 修改用户信息
    request.post(
        '/admin/user',
        {
            openid: userState.openid,
            userInfo: userInfo.value,
            create: true
        }
    ).then(res => {
        console.log(res);
        ElMessage.success('添加成功');
        clear()
        close();
    }).catch(err => {
        ElMessage.error('添加用户信息错误');
        console.log(err);
        close();
    })
}

function clear() {
    userInfo.value = {
        openid: "",
        user_type: "",
        principals: [
            {
                name: "",
                phone: "",
                password: ""
            },
        ],
        organization: {
            company: "",
            department: "",
            position: ""
        }
    };
}
</script>

<style scoped>

</style>