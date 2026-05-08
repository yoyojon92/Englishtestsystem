<template>
  <div class="teacher-dashboard">
    <!-- 头部信息 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <el-avatar :size="60" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <div>
                <h2 class="m-0">{{ teacherInfo.name }}</h2>
                <p class="text-gray-500 m-0">企业微信已绑定 · {{ teacherInfo.wecomUserId }}</p>
              </div>
            </div>
            <el-tag type="success" size="large">在线</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷统计 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div>
              <p class="stat-value">{{ stats.studentCount }}</p>
              <p class="stat-label">我的学生</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon :size="24"><Calendar /></el-icon>
            </div>
            <div>
              <p class="stat-value">{{ stats.todayClasses }}</p>
              <p class="stat-label">今日课程</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon :size="24"><ChatDotRound /></el-icon>
            </div>
            <div>
              <p class="stat-value">{{ stats.pendingReports }}</p>
              <p class="stat-label">待发报告</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon :size="24"><Warning /></el-icon>
            </div>
            <div>
              <p class="stat-value">{{ stats.warningStudents }}</p>
              <p class="stat-label">预警学生</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日课表 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">今日课表</span>
              <el-button type="primary" size="small" @click="showSchedule = true">查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in todaySchedule"
              :key="index"
              :timestamp="item.time"
              placement="top"
              :color="item.status === 'ongoing' ? '#67c23a' : item.status === 'completed' ? '#909399' : '#409eff'"
            >
              <el-card shadow="hover">
                <div class="flex justify-between items-center">
                  <div>
                    <h4 class="m-0">{{ item.courseName }}</h4>
                    <p class="text-gray-500 text-sm m-0">{{ item.className }} · {{ item.studentCount }}人</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-tag v-if="item.status === 'ongoing'" type="success">进行中</el-tag>
                    <el-tag v-else-if="item.status === 'completed'" type="info">已完成</el-tag>
                    <el-button type="primary" size="small" @click="goToClass(item)">
                      {{ item.status === 'ongoing' ? '进入课堂' : '查看详情' }}
                    </el-button>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 待办事项 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">待办事项</span>
          </template>
          <el-scrollbar height="300px">
            <div v-for="(todo, index) in todoList" :key="index" class="todo-item">
              <div class="flex items-center gap-3">
                <el-checkbox v-model="todo.done" @change="updateTodo(todo)" />
                <div class="flex-1">
                  <p class="m-0" :class="{ 'line-through text-gray-400': todo.done }">{{ todo.title }}</p>
                  <p class="text-sm text-gray-500 m-0">{{ todo.deadline }}</p>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </el-card>

        <!-- 快捷操作 -->
        <el-card shadow="hover" class="mt-4">
          <template #header>
            <span class="font-bold">快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" class="w-full mb-2" @click="$router.push('/teacher/reports')">
              <el-icon><Document /></el-icon> 填写课后报告
            </el-button>
            <el-button type="success" class="w-full mb-2" @click="$router.push('/teacher/messages')">
              <el-icon><ChatDotRound /></el-icon> 与家长沟通
            </el-button>
            <el-button type="warning" class="w-full mb-2" @click="$router.push('/teacher/students')">
              <el-icon><User /></el-icon> 查看我的学生
            </el-button>
            <el-button type="info" class="w-full" @click="$router.push('/teacher/performance')">
              <el-icon><DataLine /></el-icon> 教学数据看板
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警学生 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">需要关注的学员</span>
              <el-tag type="danger" size="small">{{ warningStudents.length }} 人</el-tag>
            </div>
          </template>
          <el-table :data="warningStudents" stripe>
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="className" label="班级" width="150" />
            <el-table-column prop="currentLevel" label="当前级别" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.currentLevel }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="issue" label="问题" min-width="200" />
            <el-table-column prop="teacherSuggestion" label="建议" min-width="200" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="contactParent(row)">联系家长</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Calendar, ChatDotRound, Warning, Document, DataLine } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 教师信息
const teacherInfo = reactive({
  id: 't001',
  name: '李老师',
  wecomUserId: 'wecom_123456',
  avatar: ''
})

// 统计数据
const stats = reactive({
  studentCount: 28,
  todayClasses: 3,
  pendingReports: 5,
  warningStudents: 3
})

// 今日课表
const todaySchedule = ref([
  {
    id: 1,
    time: '09:00 - 10:00',
    courseName: 'KET 冲刺班',
    className: 'KET-A班',
    studentCount: 12,
    status: 'completed'
  },
  {
    id: 2,
    time: '14:00 - 15:00',
    courseName: 'PET 强化班',
    className: 'PET-B班',
    studentCount: 10,
    status: 'ongoing'
  },
  {
    id: 3,
    time: '16:00 - 17:00',
    courseName: '自然拼读启蒙',
    className: '拼读-C班',
    studentCount: 8,
    status: 'upcoming'
  }
])

// 待办事项
const todoList = ref([
  { id: 1, title: '填写 KET-A班 课后报告', deadline: '今天 17:00前', done: false },
  { id: 2, title: '回复张妈妈关于课程安排的问题', deadline: '今天 18:00前', done: false },
  { id: 3, title: '准备下周 PET 模拟考材料', deadline: '本周五', done: false },
  { id: 4, title: '电话回访王同学家长', deadline: '本周六', done: true }
])

// 预警学生
const warningStudents = ref([
  {
    id: 1,
    name: '张小明',
    className: 'KET-A班',
    currentLevel: 'A1',
    issue: '连续2次模拟考成绩下降',
    teacherSuggestion: '建议加强听力训练'
  },
  {
    id: 2,
    name: '李小红',
    className: 'PET-B班',
    currentLevel: 'A2',
    issue: '口语表达不流利',
    teacherSuggestion: '增加口语练习机会'
  },
  {
    id: 3,
    name: '王小强',
    className: 'KET-A班',
    currentLevel: 'Pre-A1',
    issue: '出勤率低于80%',
    teacherSuggestion: '联系家长了解情况'
  }
])

const showSchedule = ref(false)

const goToClass = (item) => {
  ElMessage.info(`进入 ${item.courseName} 课堂`)
}

const updateTodo = (todo) => {
  ElMessage.success(todo.done ? '已完成' : '已取消')
}

const contactParent = (student) => {
  ElMessage.info(`正在联系 ${student.name} 的家长...`)
  router.push('/teacher/messages')
}

onMounted(() => {
  // 加载教师数据
})
</script>

<style scoped>
.teacher-dashboard {
  padding: 20px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.todo-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.todo-item:last-child {
  border-bottom: none;
}

.quick-actions {
  display: flex;
  flex-direction: column;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
