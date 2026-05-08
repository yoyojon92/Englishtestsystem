<template>
  <div class="finance-page">
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card income">
          <div class="stat-header">
            <span class="label">今日收入</span>
            <span class="trend up">+12.5%</span>
          </div>
          <p class="value">¥12,580</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-header">
            <span class="label">本周收入</span>
            <span class="trend up">+8.3%</span>
          </div>
          <p class="value">¥86,420</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-header">
            <span class="label">本月收入</span>
            <span class="trend up">+15.2%</span>
          </div>
          <p class="value">¥328,600</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-header">
            <span class="label">待结算</span>
          </div>
          <p class="value">¥45,800</p>
        </el-card>
      </el-col>
    </el-row>
    
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
      <div ref="chartRef" class="chart"></div>
    </el-card>
    
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card>
          <template #header><span>收入构成</span></template>
          <div ref="pieChartRef" class="pie-chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新订单</span>
              <el-button type="primary" link size="small">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" size="small">
            <el-table-column prop="id" label="订单号" width="140" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.type === 'course' ? 'success' : 'warning'">
                  {{ row.type === 'course' ? '课程' : '考试' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="80" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="success">已支付</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const timeRange = ref('month')
const chartRef = ref()
const pieChartRef = ref()
let chart = null
let pieChart = null

const recentOrders = ref([
  { id: 'ORD20240315001', type: 'course', amount: 2980, status: 'paid' },
  { id: 'ORD20240315002', type: 'exam', amount: 199, status: 'paid' },
  { id: 'ORD20240315003', type: 'course', amount: 3580, status: 'paid' },
  { id: 'ORD20240315004', type: 'exam', amount: 99, status: 'paid' },
  { id: 'ORD20240315005', type: 'course', amount: 1980, status: 'paid' },
])

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [{
      type: 'line',
      smooth: true,
      data: [12000, 8000, 15000, 11000, 9000, 18000, 22000],
      areaStyle: { color: 'rgba(108, 99, 255, 0.2)' },
      lineStyle: { color: '#6C63FF' },
      itemStyle: { color: '#6C63FF' },
    }],
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: [
        { value: 158000, name: '课程收入', itemStyle: { color: '#6C63FF' } },
        { value: 85000, name: '考试服务', itemStyle: { color: '#FF6584' } },
        { value: 45000, name: '冲刺包', itemStyle: { color: '#43E97B' } },
        { value: 40600, name: '测评服务', itemStyle: { color: '#FFB347' } },
      ],
    }],
  })
}

const handleResize = () => {
  chart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="scss" scoped>
.finance-page {
  .stats-row { margin-bottom: 16px;
    .stat-card {
      .stat-header { display: flex; justify-content: space-between; margin-bottom: 12px;
        .label { color: #666; font-size: 14px; }
        .trend { font-size: 12px; &.up { color: #67c23a; } &.down { color: #f56c6c; } }
      }
      .value { font-size: 24px; font-weight: 600; color: #333; }
    }
  }
  .chart-card {
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .chart { height: 300px; }
  }
  .pie-chart { height: 280px; }
  .amount { color: #67c23a; font-weight: 500; }
}
</style>
