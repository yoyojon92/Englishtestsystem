<template>
  <div class="marketing-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="优惠券管理" name="coupons">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>优惠券列表</span>
              <el-button type="primary" @click="handleAddCoupon">
                <el-icon><Plus /></el-icon>
                创建优惠券
              </el-button>
            </div>
          </template>
          
          <el-table :data="coupons" stripe>
            <el-table-column prop="code" label="优惠券码" width="140" />
            <el-table-column prop="name" label="优惠券名称" min-width="160" />
            <el-table-column prop="type" label="类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.type === 'discount' ? 'primary' : 'success'">
                  {{ row.type === 'discount' ? '折扣' : '满减' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="优惠内容" width="120" align="center">
              <template #default="{ row }">
                <span class="discount">{{ row.type === 'discount' ? `${row.value}折` : `¥${row.value}` }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="minAmount" label="使用门槛" width="120" align="center">
              <template #default="{ row }">
                {{ row.minAmount > 0 ? `满¥${row.minAmount}` : '无门槛' }}
              </template>
            </el-table-column>
            <el-table-column prop="usageLimit" label="发放数量" width="100" align="center" />
            <el-table-column prop="usedCount" label="已使用" width="100" align="center" />
            <el-table-column prop="validPeriod" label="有效期" min-width="180" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.status" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEditCoupon(row)">编辑</el-button>
                <el-button type="primary" link @click="handleDeleteCoupon(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="二维码渠道" name="qr">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>二维码渠道</span>
              <el-button type="primary" @click="handleAddQR">
                <el-icon><Plus /></el-icon>
                生成二维码
              </el-button>
            </div>
          </template>
          
          <el-table :data="qrChannels" stripe>
            <el-table-column prop="id" label="渠道ID" width="100" />
            <el-table-column prop="name" label="渠道名称" min-width="140" />
            <el-table-column prop="type" label="场景" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ getTypeText(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="teacher" label="关联教师" width="100" align="center">
              <template #default="{ row }">
                {{ row.teacher || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="scanCount" label="扫码次数" width="100" align="center" />
            <el-table-column prop="conversionCount" label="转化数" width="100" align="center" />
            <el-table-column prop="conversionRate" label="转化率" width="100" align="center">
              <template #default="{ row }">
                <span class="rate">{{ ((row.conversionCount / row.scanCount) * 100).toFixed(1) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="120" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link>查看</el-button>
                <el-button type="primary" link>下载</el-button>
                <el-button type="primary" link>复制链接</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 优惠券表单弹窗 -->
    <el-dialog v-model="couponDialogVisible" :title="couponForm.id ? '编辑优惠券' : '创建优惠券'" width="500px">
      <el-form :model="couponForm" label-width="100px">
        <el-form-item label="优惠券名称" required>
          <el-input v-model="couponForm.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="优惠券码">
          <el-input v-model="couponForm.code" placeholder="留空自动生成" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-radio-group v-model="couponForm.type">
            <el-radio label="discount">折扣券</el-radio>
            <el-radio label="fixed">满减券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠额度" required>
          <el-input-number v-model="couponForm.value" :min="1" :max="couponForm.type === 'discount' ? 9 : 1000" />
          <span style="margin-left: 8px;">{{ couponForm.type === 'discount' ? '折' : '元' }}</span>
        </el-form-item>
        <el-form-item label="使用门槛">
          <el-input-number v-model="couponForm.minAmount" :min="0" :step="50" />
          <span style="margin-left: 8px;">元（0为无门槛）</span>
        </el-form-item>
        <el-form-item label="发放数量">
          <el-input-number v-model="couponForm.usageLimit" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker v-model="couponForm.validPeriod" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="couponDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCoupon">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref('coupons')

const coupons = ref([
  { id: 1, code: 'NEWUSER9', name: '新用户首测优惠', type: 'fixed', value: 50, minAmount: 0, usageLimit: 1000, usedCount: 328, validPeriod: '2024-03-01 至 2024-12-31', status: true },
  { id: 2, code: 'SPRING20', name: '春季课程8折券', type: 'discount', value: 8, minAmount: 1000, usageLimit: 500, usedCount: 156, validPeriod: '2024-03-01 至 2024-05-31', status: true },
  { id: 3, code: 'EXAM99', name: '考试报名立减99', type: 'fixed', value: 99, minAmount: 99, usageLimit: 200, usedCount: 45, validPeriod: '2024-04-01 至 2024-06-30', status: true },
])

const qrChannels = ref([
  { id: 'QR001', name: '前台海报', type: 'poster', teacher: '周老师', scanCount: 156, conversionCount: 45, createdAt: '2024-03-01' },
  { id: 'QR002', name: '传单地推', type: 'flyer', teacher: '李老师', scanCount: 89, conversionCount: 23, createdAt: '2024-03-05' },
  { id: 'QR003', name: '名片二维码', type: 'namecard', teacher: '王老师', scanCount: 45, conversionCount: 18, createdAt: '2024-03-10' },
])

const getTypeText = (type) => {
  const texts = { poster: '海报', flyer: '传单', namecard: '名片', banner: '横幅', event: '活动' }
  return texts[type] || type
}

const couponDialogVisible = ref(false)
const couponForm = reactive({
  id: null,
  name: '',
  code: '',
  type: 'fixed',
  value: 50,
  minAmount: 0,
  usageLimit: 100,
  validPeriod: '',
})

const handleAddCoupon = () => {
  couponForm.id = null
  couponForm.name = ''
  couponForm.code = ''
  couponForm.type = 'fixed'
  couponForm.value = 50
  couponForm.minAmount = 0
  couponForm.usageLimit = 100
  couponDialogVisible.value = true
}

const handleEditCoupon = (row) => {
  Object.assign(couponForm, row)
  couponDialogVisible.value = true
}

const handleDeleteCoupon = (row) => {}
const handleSaveCoupon = () => {
  couponDialogVisible.value = false
}
const handleAddQR = () => {}
</script>

<style lang="scss" scoped>
.marketing-page {
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .discount { color: #f56c6c; font-weight: 500; }
  .rate { color: #67c23a; font-weight: 500; }
}
</style>
