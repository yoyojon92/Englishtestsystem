<template>
  <div class="students-page">
    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="学员姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="CEFR等级">
          <el-select v-model="searchForm.level" placeholder="请选择等级" clearable>
            <el-option label="Pre-A1" value="Pre-A1" />
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
            <el-option label="B1" value="B1" />
            <el-option label="B2" value="B2" />
          </el-select>
        </el-form-item>
        <el-form-item label="学习状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在读" value="active" />
            <el-option label="已毕业" value="graduated" />
            <el-option label="暂停" value="paused" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>学员列表 ({{ total }})</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增学员
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="学员信息" min-width="180">
          <template #default="{ row }">
            <div class="student-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <div class="info">
                <p class="name">{{ row.name }}</p>
                <p class="parent">家长: {{ row.parentName }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="level" label="CEFR等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vocabulary" label="词汇量" width="100" align="center" />
        <el-table-column prop="courses" label="在读课程" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.courses }}门</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="学习进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :color="getProgressColor(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在读' : row.status === 'graduated' ? '毕业' : '暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
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
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学员' : '新增学员'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学员姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入学员姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="CEFR等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择等级" style="width: 100%">
            <el-option label="Pre-A1 (入门)" value="Pre-A1" />
            <el-option label="A1 (基础)" value="A1" />
            <el-option label="A2 (进阶级)" value="A2" />
            <el-option label="B1 (中级)" value="B1" />
            <el-option label="B2 (中高级)" value="B2" />
          </el-select>
        </el-form-item>
        <el-divider>家长信息</el-divider>
        <el-form-item label="家长姓名" prop="parentName">
          <el-input v-model="form.parentName" placeholder="请输入家长姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  level: '',
  status: '',
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: '',
  name: '',
  gender: 'male',
  birthday: '',
  level: '',
  parentName: '',
  phone: '',
})

const rules = {
  name: [{ required: true, message: '请输入学员姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  level: [{ required: true, message: '请选择CEFR等级', trigger: 'change' }],
  parentName: [{ required: true, message: '请输入家长姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

const getLevelType = (level) => {
  const types = {
    'Pre-A1': '',
    'A1': 'success',
    'A2': 'warning',
    'B1': 'danger',
    'B2': 'info',
  }
  return types[level] || ''
}

const getProgressColor = (progress) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

const fetchData = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '张小明', avatar: '', parentName: '张先生', age: 8, level: 'A1', vocabulary: 850, courses: 2, progress: 65, status: 'active' },
      { id: 2, name: '李小雨', avatar: '', parentName: '李女士', age: 9, level: 'A2', vocabulary: 1200, courses: 3, progress: 78, status: 'active' },
      { id: 3, name: '王晓华', avatar: '', parentName: '王先生', age: 10, level: 'B1', vocabulary: 1800, courses: 2, progress: 45, status: 'active' },
      { id: 4, name: '刘小红', avatar: '', parentName: '刘女士', age: 7, level: 'Pre-A1', vocabulary: 300, courses: 1, progress: 90, status: 'active' },
      { id: 5, name: '陈晓东', avatar: '', parentName: '陈先生', age: 11, level: 'A2', vocabulary: 1100, courses: 2, progress: 55, status: 'paused' },
    ]
    total.value = 5
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.level = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => {
    if (key !== 'id') form[key] = ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/students/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除学员"${row.name}"吗？`, '提示', {
      type: 'warning',
    })
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // 取消
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
  dialogVisible.value = false
  fetchData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.students-page {
  .search-card {
    margin-bottom: 16px;
  }
  
  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .student-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .info {
        .name {
          font-weight: 500;
          margin-bottom: 2px;
        }
        .parent {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
