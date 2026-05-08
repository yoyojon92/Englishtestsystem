import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' },
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/students/index.vue'),
        meta: { title: '学员管理', icon: 'User' },
      },
      {
        path: 'students/:id',
        name: 'StudentDetail',
        component: () => import('@/views/students/detail.vue'),
        meta: { title: '学员详情', hidden: true },
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('@/views/courses/index.vue'),
        meta: { title: '课程管理', icon: 'Reading' },
      },
      {
        path: 'teachers',
        name: 'Teachers',
        component: () => import('@/views/teachers/index.vue'),
        meta: { title: '教师管理', icon: 'UserFilled' },
      },
      {
        path: 'exams',
        name: 'ExamRegistrations',
        component: () => import('@/views/exams/index.vue'),
        meta: { title: '考试报名管理', icon: 'Tickets' },
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/views/finance/index.vue'),
        meta: { title: '财务管理', icon: 'Money' },
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/notifications/index.vue'),
        meta: { title: '消息推送', icon: 'Message' },
      },
      {
        path: 'marketing',
        name: 'Marketing',
        component: () => import('@/views/marketing/index.vue'),
        meta: { title: '营销管理', icon: 'TrendCharts' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' },
      },
      // 教师端路由
      {
        path: 'teacher',
        name: 'Teacher',
        redirect: '/teacher/dashboard',
      },
      {
        path: 'teacher/dashboard',
        name: 'TeacherDashboard',
        component: () => import('@/views/teacher/Dashboard.vue'),
        meta: { title: '教师工作台', icon: 'Briefcase' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - 英语能力测评平台` 
    : '英语能力测评平台 - 管理后台'
  
  // 简单权限检查（实际项目中应验证 token）
  const token = localStorage.getItem('admin_token')
  if (!token && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
