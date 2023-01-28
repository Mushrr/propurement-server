<template>
    <div class="text-center font-bold text-2xl">
        历史数据与订单数据获取方法介绍
    </div>
    <div class="text-xl pl-10 pr-10">
        <div>1. 各个表单项的含义</div>
        <table class="border-2">
            <tr>
                <th class="border-r-2">名称</th>
                <th>含义</th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">状态</th>
                <th class="border-t-2">
                    过滤出订单的状态，不选择的时候表示已完成的订单，选择之后可以过滤出各个阶段的订单
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">用户</th>
                <th class="border-t-2">
                    选择特定用户进行过滤，如果未选择表示选择所有用户
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">代理商</th>
                <th class="border-t-2">选择特定的代理商进行过滤，使用方法类似于前面的用户</th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">是否免配送</th>
                <th class="border-t-2">过滤出是否是免配送的订单</th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">开始时间</th>
                <th class="border-t-2">
                    选择从哪一天开始，如果未选择，表示从现在开始
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">结束时间</th>
                <th class="border-t-2">
                    从哪一天结束，如果未选择，表示从开始时间往后，没有结束
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">页</th>
                <th class="border-t-2">
                    选择页码，用于页的筛选，也可以通过表格下方按钮直接跳转
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">页大小</th>
                <th class="border-t-2">
                    限制一页的大小，导出的时候，一页的大小也是如此
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">表格类型</th>
                <th class="border-t-2">
                    当前表格是什么类型的，包含有财务系统表格，派单表格，以及用于给指定机构的日，月，年汇总表格
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">发票单位</th>
                <th class="border-t-2">
                    选择此表单将送往哪家公司，此选项将直接在表单上反映出来
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">单号</th>
                <th class="border-t-2">
                    表示当前待打印的订单是该公司提交的订单中的第几份
                </th>
            </tr>
            <tr>
                <th class="border-r-2 border-t-2">采购人</th>
                <th class="border-t-2">
                    采购人的姓名，将直接反映在表单上
                </th>
            </tr>
        </table>
        <div>
            <div>
                2. 如何导出日数据，月数据，年数据。            
            </div>
            <div class="ml-10">
                <ol>
                    <li>先确定你是否需要筛选出指定的用户，如果不需要的话，用户那一栏直接留空即可</li>
                    <li>在是否免配送中选择否</li>
                    <li>选择开始日期，结束日期</li>
                    <li>选择页的大小</li>
                    <li>表格类型中选择月数据</li>
                    <li>点击导出即可</li>
                </ol>
            </div>
        </div>
        <div>
            <div>
                3. 如何导出财务系统表
            </div>
            <div class="ml-10">
                <ol>
                    <li>在是否免配送中选择否</li>
                    <li>选择开始和结束时间</li>
                    <li>选择页大小</li>
                    <li>在表格类型中选择财务系统表</li>
                    <li>点击导出</li>
                </ol>
            </div>
        </div>
        <div>
            <div>
                4. 如何导出派单表
            </div>
            <div class="ml-10">
                <ol>
                    <li>选择用户过滤出指定用户</li>
                    <li>在是否免配送中选择否</li>
                    <li>选择开始结束时间和结束时间</li>
                    <li>在订单号处找到指定的订单</li>
                    <li>页大小修改为13</li>
                    <li>表格类型选择为表单</li>
                    <li>选择发票单位</li>
                    <li>修改单号</li>
                    <li>输入采购人</li>
                    <li>点击导出</li>
                </ol>
            </div>
        </div>
    </div>
</template>