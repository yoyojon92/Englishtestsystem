<template>
  <div class="teachers-page">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="教师姓名">
          <el-input placeholder="请输入教师姓名" clearable />
        </el-form-item>
        <el-form-item label="擅长领域">
          <el-select placeholder="请选择领域" clearable>
            <el-option label="KET备考" value="ket" />
            <el-option label="PET备考" value="pet" />
            <el-option label="口语教学" value="speaking" />
            <el-option label="写作教学" value="writing" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新增教师
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <template #header>
        <span>教师列表</span>
      </template>
      
      <el-table :data="teachers" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="教师信息" min-width="180">
          <template #default="{ row }">
            <div class="teacher-info">
              <el-avatar :size="50" :src="row.avatar">{{ row.name.charAt(0) }}</el-avatar>
              <div>
                <p class="name">{{ row.name }}</p>
                <p class="title">{{ row.title }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="specialties" label="擅长领域" width="180">
          <template #default="{ row }">
            <el-tag v-for="s in row.specialties" :key="s" size="small" style="margin-right: 4px;">{{ s }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="students" label="学员数" width="100" align="center" />
        <el-table-column prop="classes" label="在读班级" width="100" align="center" />
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-text="在职" inactive-text="离职" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link>课表</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 教师详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="教师详情" size="600px">
      <div class="teacher-detail" v-if="currentTeacher">
        <div class="header">
          <el-avatar :size="80">{{ currentTeacher.name?.charAt(0) }}</el-avatar>
          <div class="info">
            <h3>{{ currentTeacher.name }}</h3>
            <p>{{ currentTeacher.title }}</p>
            <p>教龄: {{ currentTeacher.experience }}年</p>
          </div>
        </div>
        
        <el-divider />
        
        <div class="section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="手机号">{{ currentTeacher.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ currentTeacher.email }}</el-descriptions-item>
            <el-descriptions-item label="入职时间">{{ currentTeacher.hireDate }}</el-descriptions-item>
            <el-descriptions-item label="企业微信">{{ currentTeacher.wecomId || '未绑定' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="section">
          <h4>擅长领域</h4>
          <el-tag v-for="s in currentTeacher.specialties" :key="s" size="small" style="margin-right: 8px;">{{ s }}</el-tag>
        </div>
        
        <div class="section">
          <h4>个人简介</h4>
          <p>{{ currentTeacher.bio }}</p>
        </div>
        
        <div class="section">
          <h4>班级信息</h4>
          <el-table :data="currentTeacher.classList" size="small">
            <el-table-column prop="name" label="班级名称" />
            <el-table-column prop="students" label="学员数" width="80" align="center" />
            <el-table-column prop="schedule" label="上课时间" width="150" />
          </el-table>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const teachers = ref([
  { id: 1, name: '周老师', title: 'KET/PET金牌讲师', experience: 8, phone: '138****1001', email: 'zhou@example.com', hireDate: '2020-03-15', specialties: ['KET备考', 'PET备考', '口语教学'], students: 45, classes: 5, rating: 4.9, status: true, bio: '英语专业八级，8年剑桥英语教学经验，培养多名KET/PET优秀学员。', classList: [{ name: 'KET冲刺班A', students: 18, schedule: '周六 10:00' }, { name: 'PET强化班B', students: 15, schedule: '周日 14:00' }], wecomId: 'wecom_001' },
  { id: 2, name: '李老师', title: '口语教学专家', experience: 5, phone: '138****1002', email: 'li@example.com', hireDate: '2021-06-01', specialties: ['口语教学', '自然拼读'], students: 32, classes: 4, rating: 4.8, status: true, bio: '发音地道，擅长情景口语教学，课堂生动有趣，深受学员喜爱。', classList: [{ name: '口语实战A', students: 12, schedule: '周五 19:00' }], wecomId: 'wecom_002' },
  { id: 3, name: '王老师', title: '写作教学名师', experience: 6, phone: '138****1003', email: 'wang@example.com', hireDate: '2020-09-01', specialties: ['写作教学', '阅读理解'], students: 38, classes: 4, rating: 4.7, status: true, bio: '写作教学经验丰富，帮助多名学员突破写作瓶颈。', classList: [], wecomId: null },
])

const drawerVisible = ref(false)
const currentTeacher = ref(null)

const handleView = (teacher) => {
  currentTeacher.value = teacher
  drawerVisible.value = true
}
const handleEdit = (teacher) => {}
</script>

<style lang="scss" scoped>
.teachers-page {
  .search-card { margin-bottom: 16px; }
  .table-card {
    .teacher-info { display: flex; align-items: center; gap: 12px;
      .name { font-weight: 500; margin-bottom: 2px; }
      .title { font-size: 12px; color: #999; }
    }
  }
}
.teacher-detail {
  .header { display: flex; gap: 20px; align-items: center;
    .info {
      h3 { margin-bottom: 8px; }
      p { color: #666; margin-bottom: 4px; }
    }
  }
  .section { margin-bottom: 24px;
    h4 { margin-bottom: 12px; color: #333; }
    p { color: #666; line-height: 1.6; }
  }
}
</style>
