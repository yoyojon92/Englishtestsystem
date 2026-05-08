<template>
  <div class="student-detail">
    <el-button @click="router.back()" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>
    
    <el-row :gutter="20">
      <!-- 左侧学员信息 -->
      <el-col :span="8">
        <el-card class="info-card">
          <div class="student-header">
            <el-avatar :size="80" style="background: #6C63FF">
              {{ student.name?.charAt(0) }}
            </el-avatar>
            <h2>{{ student.name }}</h2>
            <el-tag :type="getLevelType(student.level)" size="large">
              {{ student.level }}
            </el-tag>
          </div>
          
          <el-divider />
          
          <div class="info-list">
            <div class="info-item">
              <span class="label">年龄</span>
              <span class="value">{{ student.age }}岁</span>
            </div>
            <div class="info-item">
              <span class="label">性别</span>
              <span class="value">{{ student.gender === 'male' ? '男' : '女' }}</span>
            </div>
            <div class="info-item">
              <span class="label">词汇量</span>
              <span class="value">{{ student.vocabulary }}</span>
            </div>
            <div class="info-item">
              <span class="label">学习进度</span>
              <span class="value">{{ student.progress }}%</span>
            </div>
            <div class="info-item">
              <span class="label">在读课程</span>
              <span class="value">{{ student.courses }}门</span>
            </div>
            <div class="info-item">
              <span class="label">入学时间</span>
              <span class="value">{{ student.enrolledAt }}</span>
            </div>
          </div>
          
          <el-divider />
          
          <div class="parent-info">
            <h4>家长信息</h4>
            <p><el-icon><User /></el-icon> {{ student.parentName }}</p>
            <p><el-icon><Phone /></el-icon> {{ student.parentPhone }}</p>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧详情 -->
      <el-col :span="16">
        <!-- 能力雷达图 -->
        <el-card class="detail-card">
          <template #header>
            <span>能力画像</span>
          </template>
          <div ref="radarChartRef" class="radar-chart"></div>
        </el-card>
        
        <!-- 学习趋势 -->
        <el-card class="detail-card" style="margin-top: 16px;">
          <template #header>
            <span>学习趋势</span>
          </template>
          <div ref="trendChartRef" class="trend-chart"></div>
        </el-card>
        
        <!-- 学习记录 -->
        <el-card class="detail-card" style="margin-top: 16px;">
          <template #header>
            <div class="card-header">
              <span>学习记录</span>
              <el-button type="primary" size="small">导出报告</el-button>
            </div>
          </template>
          <el-table :data="learningRecords">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="course" label="课程" />
            <el-table-column prop="duration" label="时长" width="100" />
            <el-table-column prop="score" label="得分" width="80" align="center" />
            <el-table-column prop="teacher" label="教师" width="100" />
          </el-table>
        </el-card>
        
        <!-- 考试记录 -->
        <el-card class="detail-card" style="margin-top: 16px;">
          <template #header>
            <div class="card-header">
              <span>考试记录</span>
              <el-button type="primary" size="small">模拟考试</el-button>
            </div>
          </template>
          <el-table :data="examRecords">
            <el-table-column prop="date" label="考试日期" width="120" />
            <el-table-column prop="exam" label="考试类型" />
            <el-table-column prop="score" label="得分" width="100" align="center" />
            <el-table-column prop="grade" label="等级" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.grade)" size="small">{{ row.grade }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.pass ? 'success' : 'danger'" size="small">
                  {{ row.pass ? '通过' : '未通过' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()
const radarChartRef = ref()
const trendChartRef = ref()
let radarChart = null
let trendChart = null

const student = reactive({
  id: 1,
  name: '张小明',
  age: 8,
  gender: 'male',
  level: 'A1',
  vocabulary: 850,
  progress: 65,
  courses: 2,
  enrolledAt: '2024-01-15',
  parentName: '张先生',
  parentPhone: '138****8888',
})

const learningRecords = ref([
  { date: '2024-03-15', course: 'KET 词汇精讲', duration: '45分钟', score: 88, teacher: '周老师' },
  { date: '2024-03-14', course: '口语实战练习', duration: '30分钟', score: 92, teacher: '李老师' },
  { date: '2024-03-13', course: '阅读理解专项', duration: '60分钟', score: 78, teacher: '王老师' },
])

const examRecords = ref([
  { date: '2024-03-10', exam: 'KET 模拟考试', score: 132, grade: 'A2', pass: true },
  { date: '2024-02-28', exam: 'KET 模拟考试', score: 118, grade: 'A1', pass: true },
  { date: '2024-02-15', exam: '词汇量测试', score: 85, grade: 'A1', pass: true },
])

const getLevelType = (level) => {
  const types = { 'Pre-A1': '', 'A1': 'success', 'A2': 'warning', 'B1': 'danger', 'B2': 'info' }
  return types[level] || ''
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  radarChart = echarts.init(radarChartRef.value)
  const option = {
    radar: {
      indicator: [
        { name: '听力', max: 100 },
        { name: '口语', max: 100 },
        { name: '阅读', max: 100 },
        { name: '写作', max: 100 },
        { name: '词汇', max: 100 },
      ],
      radius: '65%',
    },
    series: [{
      type: 'radar',
      data: [{
        value: [78, 85, 72, 65, 82],
        name: '能力评估',
        areaStyle: { color: 'rgba(108, 99, 255, 0.3)' },
        lineStyle: { color: '#6C63FF' },
        itemStyle: { color: '#6C63FF' },
      }],
    }],
  }
  radarChart.setOption(option)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['听力', '口语', '阅读', '写作'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'] },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [
      { name: '听力', type: 'line', data: [72, 74, 75, 77, 78, 78] },
      { name: '口语', type: 'line', data: [80, 82, 83, 84, 85, 85] },
      { name: '阅读', type: 'line', data: [65, 68, 70, 71, 72, 72] },
      { name: '写作', type: 'line', data: [58, 60, 62, 63, 65, 65] },
    ],
    color: ['#667eea', '#f093fb', '#4facfe', '#43e97b'],
  }
  trendChart.setOption(option)
}

const handleResize = () => {
  radarChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  initRadarChart()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  radarChart?.dispose()
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.student-detail {
  .back-btn {
    margin-bottom: 16px;
  }
  
  .info-card {
    .student-header {
      text-align: center;
      padding: 20px 0;
      
      h2 {
        margin: 12px 0;
        font-size: 20px;
      }
    }
    
    .info-list {
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child { border-bottom: none; }
        
        .label { color: #999; }
        .value { font-weight: 500; }
      }
    }
    
    .parent-info {
      h4 {
        margin-bottom: 12px;
        color: #666;
      }
      p {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #333;
      }
    }
  }
  
  .detail-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .radar-chart, .trend-chart {
      height: 280px;
    }
  }
}
</style>
