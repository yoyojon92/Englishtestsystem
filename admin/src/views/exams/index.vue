<template>
  <div class="exams-page">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="学员姓名">
          <el-input placeholder="请输入学员姓名" clearable />
        </el-form-item>
        <el-form-item label="考试类型">
          <el-select placeholder="请选择考试" clearable>
            <el-option label="KET" value="ket" />
            <el-option label="PET" value="pet" />
            <el-option label="FCE" value="fce" />
          </el-select>
        </el-form-item>
        <el-form-item label="报名状态">
          <el-select placeholder="请选择状态" clearable>
            <el-option label="待提交" value="pending" />
            <el-option label="已提交" value="submitted" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="报名成功" value="success" />
            <el-option label="报名失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
          <el-button type="success">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409eff;">📝</div>
          <div class="stat-info">
            <p class="value">{{ stats.total }}</p>
            <p class="label">总报名数</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67c23a;">✅</div>
          <div class="stat-info">
            <p class="value">{{ stats.success }}</p>
            <p class="label">报名成功</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #e6a23c;">⏳</div>
          <div class="stat-info">
            <p class="value">{{ stats.pending }}</p>
            <p class="label">待处理</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #f56c6c;">❌</div>
          <div class="stat-info">
            <p class="value">{{ stats.failed }}</p>
            <p class="label">报名失败</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>报名记录</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增报名
          </el-button>
        </div>
      </template>
      
      <el-table :data="registrations" stripe>
        <el-table-column prop="id" label="报名ID" width="100" />
        <el-table-column label="学员信息" min-width="140">
          <template #default="{ row }">
            <p class="student-name">{{ row.studentName }}</p>
            <p class="parent">{{ row.parentName }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="examType" label="考试类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.examType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="session" label="考试场次" min-width="180">
          <template #default="{ row }">
            <p>{{ row.session.date }}</p>
            <p class="muted">{{ row.session.center }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="serviceType" label="服务类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.serviceType === 'vip' ? 'warning' : 'info'" size="small">
              {{ row.serviceType === 'vip' ? 'VIP代报名' : '基础代报名' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="服务费" width="100" align="center">
          <template #default="{ row }">
            <span class="fee">¥{{ row.fee }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">详情</el-button>
            <el-button type="primary" link @click="handleUpdate(row)" v-if="row.status !== 'success'">更新状态</el-button>
            <el-button type="primary" link v-if="row.status === 'success'">准考证</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          :current-page="1"
          :page-size="10"
          :total="20"
          layout="total, prev, pager, next"
        />
      </div>
    </el-card>
    
    <!-- 状态更新弹窗 -->
    <el-dialog v-model="statusDialogVisible" title="更新报名状态" width="500px">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="报名ID">
          <span>{{ statusForm.id }}</span>
        </el-form-item>
        <el-form-item label="新状态" prop="status">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option label="待提交" value="pending" />
            <el-option label="已提交" value="submitted" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="报名成功" value="success" />
            <el-option label="报名失败" value="failed" />
            <el-option label="已出准考证" value="ticket_ready" />
            <el-option label="考试完成" value="exam_completed" />
            <el-option label="成绩已出" value="result_ready" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="statusForm.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const stats = reactive({ total: 45, success: 32, pending: 8, failed: 5 })

const registrations = ref([
  { id: 'REG20240315001', studentName: '张小明', parentName: '张先生', examType: 'KET', session: { date: '2024-04-20', center: '北京外国语大学' }, serviceType: 'vip', fee: 199, status: 'success' },
  { id: 'REG20240315002', studentName: '李小雨', parentName: '李女士', examType: 'PET', session: { date: '2024-04-21', center: '上海外国语大学' }, serviceType: 'basic', fee: 99, status: 'reviewing' },
  { id: 'REG20240315003', studentName: '王晓华', parentName: '王先生', examType: 'KET', session: { date: '2024-04-20', center: '北京外国语大学' }, serviceType: 'vip', fee: 199, status: 'submitted' },
  { id: 'REG20240315004', studentName: '刘小红', parentName: '刘女士', examType: 'PET', session: { date: '2024-05-18', center: '广州外语外贸大学' }, serviceType: 'basic', fee: 99, status: 'pending' },
  { id: 'REG20240315005', studentName: '陈晓东', parentName: '陈先生', examType: 'FCE', session: { date: '2024-06-15', center: '北京外国语大学' }, serviceType: 'vip', fee: 299, status: 'failed' },
])

const getStatusType = (status) => {
  const types = { pending: 'info', submitted: 'warning', reviewing: 'warning', success: 'success', failed: 'danger', ticket_ready: 'success', exam_completed: 'info', result_ready: 'success' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { pending: '待提交', submitted: '已提交', reviewing: '审核中', success: '报名成功', failed: '报名失败', ticket_ready: '已出准考证', exam_completed: '考试完成', result_ready: '成绩已出' }
  return texts[status] || status
}

const statusDialogVisible = ref(false)
const statusForm = reactive({ id: '', status: '', remark: '' })

const handleAdd = () => {}
const handleView = (row) => {}
const handleUpdate = (row) => {
  statusForm.id = row.id
  statusForm.status = ''
  statusForm.remark = ''
  statusDialogVisible.value = true
}
const handleSubmitStatus = () => {
  statusDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.exams-page {
  .search-card { margin-bottom: 16px; }
  .stats-row { margin-bottom: 16px;
    .stat-card { display: flex; align-items: center; gap: 16px;
      .stat-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
      .stat-info {
        .value { font-size: 24px; font-weight: 600; color: #333; }
        .label { font-size: 14px; color: #999; }
      }
    }
  }
  .table-card {
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .student-name { font-weight: 500; }
    .parent { font-size: 12px; color: #999; }
    .muted { font-size: 12px; color: #999; }
    .fee { color: #f56c6c; font-weight: 500; }
    .pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
  }
}
</style>
