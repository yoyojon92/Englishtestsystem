<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">学员总数</p>
            <p class="stat-value">{{ stats.students }}</p>
            <p class="stat-trend up">
              <el-icon><Top /></el-icon>
              12.5% 较上月
            </p>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <el-icon :size="32"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">在读课程</p>
            <p class="stat-value">{{ stats.courses }}</p>
            <p class="stat-trend up">
              <el-icon><Top /></el-icon>
              8.3% 较上月
            </p>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <el-icon :size="32"><Tickets /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">考试报名</p>
            <p class="stat-value">{{ stats.exams }}</p>
            <p class="stat-trend down">
              <el-icon><Bottom /></el-icon>
              3.2% 较上月
            </p>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <el-icon :size="32"><Coin /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">本月收入</p>
            <p class="stat-value">¥{{ formatNumber(stats.revenue) }}</p>
            <p class="stat-trend up">
              <el-icon><Top /></el-icon>
              15.8% 较上月
            </p>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>收入趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="revenueChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>学员等级分布</span>
            </div>
          </template>
          <div ref="levelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 待办事项和近期活动 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :span="12">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>待处理事项</span>
              <el-badge :value="todoList.length" type="primary" />
            </div>
          </template>
          <div class="todo-list">
            <div v-for="item in todoList" :key="item.id" class="todo-item">
              <div class="todo-content">
                <el-tag :type="item.type" size="small">{{ item.tag }}</el-tag>
                <span>{{ item.content }}</span>
              </div>
              <el-button text size="small" type="primary">处理</el-button>
            </div>
            <el-empty v-if="!todoList.length" description="暂无待处理事项" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>近期动态</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in activities"
              :key="item.id"
              :timestamp="item.time"
              :type="item.type"
              hollow
            >
              <p>{{ item.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷入口 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>快捷入口</span>
          </template>
          <div class="quick-btns">
            <el-button type="primary" plain @click="router.push('/students')">
              <el-icon><Plus /></el-icon>
              新增学员
            </el-button>
            <el-button type="success" plain @click="router.push('/courses')">
              <el-icon><Plus /></el-icon>
              新增课程
            </el-button>
            <el-button type="warning" plain @click="router.push('/exams')">
              <el-icon><Tickets /></el-icon>
              考试管理
            </el-button>
            <el-button type="info" plain @click="router.push('/finance')">
              <el-icon><Coin /></el-icon>
              财务统计
            </el-button>
          </div>
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
const revenueChartRef = ref()
const levelChartRef = ref()
const timeRange = ref('month')
let revenueChart = null
let levelChart = null

const stats = reactive({
  students: 1256,
  courses: 89,
  exams: 156,
  revenue: 389500,
})

const todoList = ref([
  { id: 1, tag: '报名', content: '张同学 KET 报名待审核', type: 'warning' },
  { id: 2, tag: '课程', content: 'PET冲刺班课程即将开课', type: 'info' },
  { id: 3, tag: '投诉', content: '李家长投诉课程安排问题', type: 'danger' },
  { id: 4, tag: '考试', content: '本月考试座位即将满员', type: 'warning' },
])

const activities = ref([
  { id: 1, time: '10分钟前', content: '王同学完成了 KET 模拟考试，获得 B1 级别', type: 'primary' },
  { id: 2, time: '30分钟前', content: '张妈妈为孩子购买了 PET 冲刺包', type: 'success' },
  { id: 3, time: '1小时前', content: '李同学完成课后 AI 评估，获得 92 分', type: 'primary' },
  { id: 4, time: '2小时前', content: '周老师提交了课后报告给家长', type: 'info' },
  { id: 5, time: '3小时前', content: '陈同学报名了 3月 KET 考试', type: 'warning' },
])

const formatNumber = (num) => {
  return num.toLocaleString('zh-CN')
}

const initRevenueChart = () => {
  if (!revenueChartRef.value) return
  
  revenueChart = echarts.init(revenueChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['测评收入', '课程收入', '考试服务'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
      boundaryGap: false,
    },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [
      { name: '测评收入', type: 'line', smooth: true, data: [32000, 35000, 38000, 42000, 48000, 52000, 58000], areaStyle: {} },
      { name: '课程收入', type: 'line', smooth: true, data: [120000, 135000, 148000, 162000, 175000, 195000, 210000], areaStyle: {} },
      { name: '考试服务', type: 'line', smooth: true, data: [15000, 18000, 22000, 25000, 28000, 32000, 35000], areaStyle: {} },
    ],
    color: ['#667eea', '#f093fb', '#4facfe'],
  }
  revenueChart.setOption(option)
}

const initLevelChart = () => {
  if (!levelChartRef.value) return
  
  levelChart = echarts.init(levelChartRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: '5%', top: 'center' },
    series: [
      {
        name: '学员等级',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: 350, name: 'Pre-A1 (入门)', itemStyle: { color: '#91d5ff' } },
          { value: 420, name: 'A1 (基础)', itemStyle: { color: '#73d13d' } },
          { value: 280, name: 'A2 (进阶级)', itemStyle: { color: '#fadb14' } },
          { value: 150, name: 'B1 (中级)', itemStyle: { color: '#fa8c16' } },
          { value: 56, name: 'B2 (中高级)', itemStyle: { color: '#f5222d' } },
        ],
      },
    ],
  }
  levelChart.setOption(option)
}

const handleResize = () => {
  revenueChart?.resize()
  levelChart?.resize()
}

onMounted(() => {
  initRevenueChart()
  initLevelChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart?.dispose()
  levelChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-cards {
    margin-bottom: 20px;
    
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
      
      .stat-info {
        .stat-label {
          color: #999;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        
        .stat-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          
          &.up { color: #52c41a; }
          &.down { color: #f5222d; }
        }
      }
    }
  }
  
  .chart-row {
    margin-bottom: 20px;
    
    .chart-card {
      border-radius: 12px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chart-container {
        height: 280px;
      }
    }
  }
  
  .bottom-row {
    margin-bottom: 20px;
    
    .todo-card, .activity-card {
      border-radius: 12px;
      
      .todo-list {
        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child { border-bottom: none; }
          
          .todo-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }
    }
  }
  
  .quick-actions {
    .quick-btns {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
