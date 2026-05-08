<template>
  <div class="courses-page">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="课程名称">
          <el-input placeholder="请输入课程名称" clearable />
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select placeholder="请选择类型" clearable>
            <el-option label="KET备考" value="ket" />
            <el-option label="PET备考" value="pet" />
            <el-option label="口语专项" value="speaking" />
            <el-option label="词汇专项" value="vocabulary" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select placeholder="请选择状态" clearable>
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
            <el-option label="未开始" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增课程
          </el-button>
        </div>
      </template>
      
      <el-table :data="courses" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="课程信息" min-width="200">
          <template #default="{ row }">
            <div class="course-info">
              <img :src="row.cover" class="cover" />
              <div>
                <p class="name">{{ row.name }}</p>
                <p class="type">{{ row.type }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="适用等级" width="100" align="center" />
        <el-table-column prop="students" label="在读学员" width="100" align="center" />
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="schedule" label="上课时间" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'info'" size="small">
              {{ row.status === 'active' ? '进行中' : row.status === 'pending' ? '未开始' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleSchedule(row)">排课</el-button>
            <el-button type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          :current-page="1"
          :page-size="10"
          :total="5"
          layout="total, prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const courses = ref([
  { id: 1, name: 'KET 冲刺班', type: 'KET备考', level: 'A1-A2', students: 18, price: 2980, schedule: '周六 10:00-12:00', status: 'active', cover: 'https://picsum.photos/100/60?random=1' },
  { id: 2, name: 'PET 强化班', type: 'PET备考', level: 'A2-B1', students: 15, price: 3580, schedule: '周日 14:00-16:00', status: 'active', cover: 'https://picsum.photos/100/60?random=2' },
  { id: 3, name: '自然拼读启蒙', type: '口语专项', level: 'Pre-A1', students: 22, price: 1980, schedule: '周三 16:00-17:00', status: 'active', cover: 'https://picsum.photos/100/60?random=3' },
  { id: 4, name: '口语实战训练', type: '口语专项', level: 'A1-A2', students: 12, price: 2280, schedule: '周五 19:00-20:30', status: 'pending', cover: 'https://picsum.photos/100/60?random=4' },
  { id: 5, name: 'KET 词汇精讲', type: '词汇专项', level: 'A1', students: 20, price: 1680, schedule: '周一 18:00-19:00', status: 'ended', cover: 'https://picsum.photos/100/60?random=5' },
])

const handleAdd = () => {}
const handleEdit = (row) => {}
const handleSchedule = (row) => {}
</script>

<style lang="scss" scoped>
.courses-page {
  .search-card { margin-bottom: 16px; }
  .table-card {
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .course-info {
      display: flex; gap: 12px; align-items: center;
      .cover { width: 60px; height: 36px; border-radius: 4px; object-fit: cover; }
      .name { font-weight: 500; margin-bottom: 2px; }
      .type { font-size: 12px; color: #999; }
    }
    .price { color: #f56c6c; font-weight: 500; }
    .pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
  }
}
</style>
