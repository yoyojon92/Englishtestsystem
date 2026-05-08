<template>
  <div class="notifications-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>消息推送管理</span>
          <el-button type="primary" @click="handleSendNotification">
            <el-icon><Plus /></el-icon>
            发送通知
          </el-button>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-select v-model="filterType" placeholder="消息类型" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="课后评估" value="assessment" />
          <el-option label="考试提醒" value="exam" />
          <el-option label="课程通知" value="course" />
          <el-option label="系统消息" value="system" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="发送状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="待发送" value="pending" />
          <el-option label="已发送" value="sent" />
          <el-option label="发送失败" value="failed" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </div>

      <!-- 消息列表 -->
      <el-table :data="notifications" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="targetCount" label="目标人数" width="100" align="center" />
        <el-table-column label="发送状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sentCount" label="已发送" width="80" align="center" />
        <el-table-column prop="readCount" label="已读" width="80" align="center" />
        <el-table-column label="发送时间" width="160">
          <template #default="{ row }">
            {{ row.sentAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleResend(row)" :disabled="row.status !== 'failed'">重发</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 发送通知对话框 -->
    <el-dialog
      v-model="sendDialogVisible"
      title="发送通知"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="sendForm" label-width="100px" ref="sendFormRef" :rules="sendRules">
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="sendForm.type" placeholder="请选择消息类型" style="width: 100%">
            <el-option label="课后评估报告" value="assessment" />
            <el-option label="考试提醒" value="exam" />
            <el-option label="课程通知" value="course" />
            <el-option label="系统消息" value="system" />
            <el-option label="营销活动" value="marketing" />
          </el-select>
        </el-form-item>

        <el-form-item label="通知标题" prop="title">
          <el-input v-model="sendForm.title" placeholder="请输入通知标题" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="sendForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="发送范围" prop="targetType">
          <el-radio-group v-model="sendForm.targetType">
            <el-radio label="all">全部学员家长</el-radio>
            <el-radio label="class">按班级</el-radio>
            <el-radio label="level">按等级</el-radio>
            <el-radio label="custom">自定义选择</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="选择班级" v-if="sendForm.targetType === 'class'" prop="classIds">
          <el-select v-model="sendForm.classIds" multiple placeholder="请选择班级" style="width: 100%">
            <el-option label="KET冲刺班-A班" value="class_1" />
            <el-option label="KET冲刺班-B班" value="class_2" />
            <el-option label="PET强化班-A班" value="class_3" />
            <el-option label="自然拼读班" value="class_4" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择等级" v-if="sendForm.targetType === 'level'" prop="levels">
          <el-checkbox-group v-model="sendForm.levels">
            <el-checkbox label="Pre-A1">Pre-A1 (入门)</el-checkbox>
            <el-checkbox label="A1">A1 (一级)</el-checkbox>
            <el-checkbox label="A2">A2 (二级)</el-checkbox>
            <el-checkbox label="B1">B1 (三级)</el-checkbox>
            <el-checkbox label="B2">B2 (四级)</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="推送渠道">
          <el-checkbox-group v-model="sendForm.channels">
            <el-checkbox label="in_app">站内消息</el-checkbox>
            <el-checkbox label="wechat">微信服务通知</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="email">邮件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="定时发送">
          <el-date-picker
            v-model="sendForm.scheduledAt"
            type="datetime"
            placeholder="选择发送时间（可选）"
            style="width: 100%"
            :disabled-date="(date: Date) => date.getTime() < Date.now()"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="sendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitSend" :loading="submitting">
          {{ sendForm.scheduledAt ? '定时发送' : '立即发送' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="通知详情" width="700px">
      <div v-if="currentNotification" class="notification-detail">
        <div class="detail-header">
          <h3>{{ currentNotification.title }}</h3>
          <el-tag :type="getTypeColor(currentNotification.type)">
            {{ getTypeName(currentNotification.type) }}
          </el-tag>
        </div>
        <div class="detail-meta">
          <span>发送时间: {{ currentNotification.sentAt || '定时发送' }}</span>
          <span>目标人数: {{ currentNotification.targetCount }}</span>
        </div>
        <div class="detail-content">
          <h4>消息内容</h4>
          <p>{{ currentNotification.content }}</p>
        </div>
        <div class="detail-stats">
          <div class="stat-item">
            <span class="stat-value">{{ currentNotification.sentCount }}</span>
            <span class="stat-label">已发送</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ currentNotification.readCount }}</span>
            <span class="stat-label">已读</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ currentNotification.readRate || 0 }}%</span>
            <span class="stat-label">阅读率</span>
          </div>
        </div>
        <div class="detail-recipients">
          <h4>接收人列表</h4>
          <el-table :data="currentNotification.recipients || []" size="small" max-height="200">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="className" label="班级" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag size="small" :type="row.read ? 'success' : 'info'">
                  {{ row.read ? '已读' : '未读' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 状态
const loading = ref(false)
const notifications = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filterType = ref('')
const filterStatus = ref('')
const dateRange = ref([])

// 发送对话框
const sendDialogVisible = ref(false)
const submitting = ref(false)
const sendFormRef = ref(null)
const sendForm = reactive({
  type: '',
  title: '',
  content: '',
  targetType: 'all',
  classIds: [],
  levels: [],
  channels: ['in_app'],
  scheduledAt: null
})

const sendRules = {
  type: [{ required: true, message: '请选择消息类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
}

// 查看对话框
const viewDialogVisible = ref(false)
const currentNotification = ref(null)

// 模拟数据
const mockNotifications = [
  {
    id: 1,
    type: 'assessment',
    typeName: '课后评估',
    title: '小明课后评估报告已生成',
    content: '本周课程完成情况良好，发音准确度提升明显，建议加强词汇拼写练习。',
    targetCount: 1,
    status: 'sent',
    statusText: '已发送',
    sentCount: 1,
    readCount: 1,
    readRate: 100,
    sentAt: '2024-01-15 18:30',
    recipients: [
      { name: '张小明家长', phone: '138****5678', className: 'KET冲刺班-A班', read: true }
    ]
  },
  {
    id: 2,
    type: 'exam',
    typeName: '考试提醒',
    title: 'KET考试倒计时14天提醒',
    content: '距离KET考试还有14天，请确认准考证已下载，做好考前准备。',
    targetCount: 25,
    status: 'sent',
    statusText: '已发送',
    sentCount: 25,
    readCount: 20,
    readRate: 80,
    sentAt: '2024-01-14 09:00',
    recipients: []
  },
  {
    id: 3,
    type: 'course',
    typeName: '课程通知',
    title: '新课程上线通知',
    content: 'PET冲刺班新课程已上线，现在报名享受早鸟价优惠。',
    targetCount: 100,
    status: 'pending',
    statusText: '待发送',
    sentCount: 0,
    readCount: 0,
    readRate: 0,
    sentAt: null,
    scheduledAt: '2024-01-20 10:00',
    recipients: []
  },
  {
    id: 4,
    type: 'system',
    typeName: '系统消息',
    title: '系统升级通知',
    content: '平台将于1月20日凌晨2:00-4:00进行系统升级，届时服务暂停。',
    targetCount: 500,
    status: 'sent',
    statusText: '已发送',
    sentCount: 498,
    readCount: 350,
    readRate: 70,
    sentAt: '2024-01-10 10:00',
    recipients: []
  }
]

// 方法
const getTypeName = (type) => {
  const map = {
    assessment: '课后评估',
    exam: '考试提醒',
    course: '课程通知',
    system: '系统消息',
    marketing: '营销活动'
  }
  return map[type] || type
}

const getTypeColor = (type) => {
  const map = {
    assessment: 'success',
    exam: 'warning',
    course: 'primary',
    system: 'info',
    marketing: 'danger'
  }
  return map[type] || 'info'
}

const getStatusColor = (status) => {
  const map = {
    pending: 'warning',
    sent: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    notifications.value = mockNotifications
    total.value = mockNotifications.length
    loading.value = false
  }, 500)
}

const handleSendNotification = () => {
  sendForm.type = ''
  sendForm.title = ''
  sendForm.content = ''
  sendForm.targetType = 'all'
  sendForm.classIds = []
  sendForm.levels = []
  sendForm.channels = ['in_app']
  sendForm.scheduledAt = null
  sendDialogVisible.value = true
}

const handleSubmitSend = async () => {
  if (!sendFormRef.value) return
  await sendFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success(sendForm.scheduledAt ? '定时发送设置成功' : '发送成功')
        sendDialogVisible.value = false
        submitting.value = false
        loadData()
      }, 1000)
    }
  })
}

const handleView = (row) => {
  currentNotification.value = row
  viewDialogVisible.value = true
}

const handleResend = async (row) => {
  await ElMessageBox.confirm('确定要重新发送这条通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  ElMessage.success('重新发送成功')
  loadData()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除这条通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  ElMessage.success('删除成功')
  loadData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.notifications-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.notification-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
}

.detail-meta {
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.detail-content p {
  margin: 0;
  line-height: 1.8;
  color: #333;
}

.detail-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.detail-recipients h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}
</style>
