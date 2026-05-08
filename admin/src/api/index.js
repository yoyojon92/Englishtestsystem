// API 配置文件
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9091/api/v1'

export default {
  // 认证相关
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    info: `${API_BASE_URL}/auth/info`,
  },
  
  // 学员管理
  students: {
    list: `${API_BASE_URL}/students`,
    detail: (id) => `${API_BASE_URL}/students/${id}`,
    create: `${API_BASE_URL}/students`,
    update: (id) => `${API_BASE_URL}/students/${id}`,
    delete: (id) => `${API_BASE_URL}/students/${id}`,
  },
  
  // 课程管理
  courses: {
    list: `${API_BASE_URL}/courses`,
    detail: (id) => `${API_BASE_URL}/courses/${id}`,
    create: `${API_BASE_URL}/courses`,
    update: (id) => `${API_BASE_URL}/courses/${id}`,
  },
  
  // 教师管理
  teachers: {
    list: `${API_BASE_URL}/teachers`,
    detail: (id) => `${API_BASE_URL}/teachers/${id}`,
    create: `${API_BASE_URL}/teachers`,
    update: (id) => `${API_BASE_URL}/teachers/${id}`,
  },
  
  // 考试报名
  examRegistration: {
    list: `${API_BASE_URL}/exam-registrations`,
    detail: (id) => `${API_BASE_URL}/exam-registrations/${id}`,
    create: `${API_BASE_URL}/exam-registrations`,
    update: (id) => `${API_BASE_URL}/exam-registrations/${id}`,
  },
  
  // 财务报表
  finance: {
    overview: `${API_BASE_URL}/finance/overview`,
    orders: `${API_BASE_URL}/finance/orders`,
    stats: `${API_BASE_URL}/finance/stats`,
  },
  
  // 营销管理
  marketing: {
    coupons: `${API_BASE_URL}/marketing/coupons`,
    qrChannels: `${API_BASE_URL}/marketing/qr-channels`,
  },
  
  // 仪表盘
  dashboard: {
    stats: `${API_BASE_URL}/dashboard/stats`,
    recentOrders: `${API_BASE_URL}/dashboard/recent-orders`,
    alerts: `${API_BASE_URL}/dashboard/alerts`,
  },
}
