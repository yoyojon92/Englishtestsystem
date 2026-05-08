<template>
  <div class="settings-page">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header><span>学校信息</span></template>
          <el-form :model="schoolForm" label-width="100px">
            <el-form-item label="学校名称">
              <el-input v-model="schoolForm.name" placeholder="请输入学校名称" />
            </el-form-item>
            <el-form-item label="学校地址">
              <el-input v-model="schoolForm.address" placeholder="请输入学校地址" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="schoolForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="营业时间">
              <el-input v-model="schoolForm.hours" placeholder="例：周一~周日 9:00-21:00" />
            </el-form-item>
            <el-form-item label="学校简介">
              <el-input v-model="schoolForm.description" type="textarea" :rows="4" placeholder="请输入学校简介" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>价格设置</span></template>
          <el-form :model="priceForm" label-width="100px">
            <el-form-item label="测评价格">
              <el-input-number v-model="priceForm.assessmentPrice" :min="0" :step="10" />
              <span class="unit">元/次</span>
            </el-form-item>
            <el-form-item label="基础代报名">
              <el-input-number v-model="priceForm.basicServiceFee" :min="0" :step="10" />
              <span class="unit">元/次</span>
            </el-form-item>
            <el-form-item label="VIP代报名">
              <el-input-number v-model="priceForm.vipServiceFee" :min="0" :step="10" />
              <span class="unit">元/次</span>
            </el-form-item>
            <el-form-item label="团报优惠">
              <el-input-number v-model="priceForm.groupDiscount" :min="0" :max="100" :step="5" />
              <span class="unit">元/人（3人及以上）</span>
            </el-form-item>
            <el-form-item label="模拟考价格">
              <el-input-number v-model="priceForm.mockExamPrice" :min="0" :step="5" />
              <span class="unit">元/次</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <span>第三方API配置</span>
        </div>
      </template>
      <el-form :model="apiForm" label-width="140px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="讯飞APPID">
              <el-input v-model="apiForm.iflytekAppId" placeholder="请输入讯飞APPID" show-password />
            </el-form-item>
            <el-form-item label="讯飞API密钥">
              <el-input v-model="apiForm.iflytekApiKey" placeholder="请输入讯飞API密钥" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="LLM API地址">
              <el-input v-model="apiForm.llmApiUrl" placeholder="请输入LLM API地址" />
            </el-form-item>
            <el-form-item label="LLM API密钥">
              <el-input v-model="apiForm.llmApiKey" placeholder="请输入LLM API密钥" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary">保存配置</el-button>
          <el-button>测试连接</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      <el-form :model="systemForm" label-width="120px">
        <el-form-item label="启用测评功能">
          <el-switch v-model="systemForm.enableAssessment" />
        </el-form-item>
        <el-form-item label="启用考试报名">
          <el-switch v-model="systemForm.enableExamRegistration" />
        </el-form-item>
        <el-form-item label="启用模拟考试">
          <el-switch v-model="systemForm.enableMockExam" />
        </el-form-item>
        <el-form-item label="启用AI口语">
          <el-switch v-model="systemForm.enableAISpeaking" />
        </el-form-item>
        <el-form-item label="数据保留天数">
          <el-input-number v-model="systemForm.dataRetentionDays" :min="30" :max="365" :step="30" />
          <span class="unit">天</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const schoolForm = reactive({
  name: '剑桥英语能力测评中心',
  address: '北京市海淀区中关村大街1号',
  phone: '400-888-8888',
  hours: '周一~周日 9:00-21:00',
  description: '专业从事剑桥英语能力测评与培训的教育机构，致力于为3-15岁学生提供优质的英语教育服务。',
})

const priceForm = reactive({
  assessmentPrice: 59.9,
  basicServiceFee: 99,
  vipServiceFee: 199,
  groupDiscount: 79,
  mockExamPrice: 29.9,
})

const apiForm = reactive({
  iflytekAppId: '',
  iflytekApiKey: '',
  llmApiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  llmApiKey: '',
})

const systemForm = reactive({
  enableAssessment: true,
  enableExamRegistration: true,
  enableMockExam: true,
  enableAISpeaking: true,
  dataRetentionDays: 90,
})
</script>

<style lang="scss" scoped>
.settings-page {
  .unit { margin-left: 8px; color: #999; font-size: 14px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; }
}
</style>
