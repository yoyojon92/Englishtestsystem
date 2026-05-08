/**
 * 考试模块 API 调用
 * 服务端文件：server/src/routes/exam.ts
 */

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1';

// ==================== 考试目录 API ====================

/**
 * 获取所有考试列表
 * 接口：GET /api/v1/exams
 */
export async function getExamList() {
  const response = await fetch(`${API_BASE}/exams`);
  const data = await response.json();
  return data.data;
}

/**
 * 获取考试详情
 * 接口：GET /api/v1/exams/:examId
 * 参数：examId - string
 */
export async function getExamDetail(examId: string) {
  const response = await fetch(`${API_BASE}/exams/${examId}`);
  const data = await response.json();
  return data.data;
}

// ==================== 考试场次 API ====================

/**
 * 获取考试场次列表
 * 接口：GET /api/v1/exams/:examId/sessions
 * 参数：examId - string, city?: string, examType?: string, status?: string
 */
export async function getExamSessions(examId: string, params?: { city?: string; examType?: string; status?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.city) queryParams.append('city', params.city);
  if (params?.examType) queryParams.append('examType', params.examType);
  if (params?.status) queryParams.append('status', params.status);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE}/exams/${examId}/sessions?${queryString}`
    : `${API_BASE}/exams/${examId}/sessions`;
    
  const response = await fetch(url);
  const data = await response.json();
  return data.data;
}

/**
 * 获取所有可用城市
 * 接口：GET /api/v1/exams/sessions/cities
 */
export async function getExamCities() {
  const response = await fetch(`${API_BASE}/exams/sessions/cities`);
  const data = await response.json();
  return data.data;
}

/**
 * 获取场次详情
 * 接口：GET /api/v1/exams/sessions/:sessionId
 * 参数：sessionId - string
 */
export async function getSessionDetail(sessionId: string) {
  const response = await fetch(`${API_BASE}/exams/sessions/${sessionId}`);
  const data = await response.json();
  return data.data;
}

// ==================== 考试报名 API ====================

/**
 * 创建考试报名
 * 接口：POST /api/v1/exams/registrations
 * Body参数：userId: string, childId: string, sessionId: string, studentInfo: object, parentInfo: object, serviceType: 'basic' | 'vip'
 */
export async function createRegistration(params: {
  userId: string;
  childId: string;
  sessionId: string;
  studentInfo: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    idNumber: string;
    idType: 'id_card' | 'passport';
  };
  parentInfo: {
    name: string;
    phone: string;
    relationship: string;
  };
  serviceType: 'basic' | 'vip';
}) {
  const response = await fetch(`${API_BASE}/exams/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  return data.data;
}

/**
 * 获取用户的考试报名列表
 * 接口：GET /api/v1/exams/registrations/list
 * 参数：userId?: string, childId?: string
 */
export async function getRegistrationList(params?: { userId?: string; childId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.childId) queryParams.append('childId', params.childId);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE}/exams/registrations/list?${queryString}`
    : `${API_BASE}/exams/registrations/list`;
    
  const response = await fetch(url);
  const data = await response.json();
  return data.data;
}

/**
 * 获取报名详情
 * 接口：GET /api/v1/exams/registrations/:registrationId
 * 参数：registrationId - string
 */
export async function getRegistrationDetail(registrationId: string) {
  const response = await fetch(`${API_BASE}/exams/registrations/${registrationId}`);
  const data = await response.json();
  return data.data;
}

/**
 * 确认报名（模拟支付成功后）
 * 接口：POST /api/v1/exams/registrations/:registrationId/confirm
 * 参数：registrationId - string
 */
export async function confirmRegistration(registrationId: string) {
  const response = await fetch(`${API_BASE}/exams/registrations/${registrationId}/confirm`, {
    method: 'POST'
  });
  const data = await response.json();
  return data.data;
}

// ==================== 模拟考试 API ====================

/**
 * 获取模拟考试题目
 * 接口：GET /api/v1/exams/mock/questions
 * 参数：examType?: string, component?: string
 */
export async function getMockQuestions(params?: { examType?: string; component?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.examType) queryParams.append('examType', params.examType);
  if (params?.component) queryParams.append('component', params.component);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE}/exams/mock/questions?${queryString}`
    : `${API_BASE}/exams/mock/questions`;
    
  const response = await fetch(url);
  const data = await response.json();
  return data.data;
}

/**
 * 提交模拟考试答案
 * 接口：POST /api/v1/exams/mock/submit
 * Body参数：childId: string, examType: string, answers: Array<{ questionId: string; answer: string; timeSpent: number }>
 */
export async function submitMockExam(params: {
  childId: string;
  examType: string;
  answers: Array<{ questionId: string; answer: string; timeSpent: number }>;
}) {
  const response = await fetch(`${API_BASE}/exams/mock/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  return data.data;
}

/**
 * 获取模拟考试成绩列表
 * 接口：GET /api/v1/exams/mock/history
 * 参数：childId?: string, examType?: string
 */
export async function getMockExamHistory(params?: { childId?: string; examType?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.childId) queryParams.append('childId', params.childId);
  if (params?.examType) queryParams.append('examType', params.examType);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE}/exams/mock/history?${queryString}`
    : `${API_BASE}/exams/mock/history`;
    
  const response = await fetch(url);
  const data = await response.json();
  return data.data;
}

/**
 * 获取模拟考试详情
 * 接口：GET /api/v1/exams/mock/:examId
 * 参数：examId - string
 */
export async function getMockExamDetail(examId: string) {
  const response = await fetch(`${API_BASE}/exams/mock/${examId}`);
  const data = await response.json();
  return data.data;
}

// ==================== 备考计划 API ====================

/**
 * 创建备考计划
 * 接口：POST /api/v1/exams/plans
 * Body参数：childId: string, examType: string, targetDate: string, currentLevel: string
 */
export async function createExamPlan(params: {
  childId: string;
  examType: string;
  targetDate: string;
  currentLevel: string;
}) {
  const response = await fetch(`${API_BASE}/exams/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  return data.data;
}

/**
 * 获取备考计划列表
 * 接口：GET /api/v1/exams/plans/list
 * 参数：childId?: string
 */
export async function getExamPlans(childId?: string) {
  const queryString = childId ? `?childId=${childId}` : '';
  const response = await fetch(`${API_BASE}/exams/plans/list${queryString}`);
  const data = await response.json();
  return data.data;
}

/**
 * 更新备考计划进度
 * 接口：PUT /api/v1/exams/plans/:planId
 * 参数：planId - string, progressPct?: number, completedWeeks?: number
 */
export async function updateExamPlan(planId: string, params: { progressPct?: number; completedWeeks?: number }) {
  const response = await fetch(`${API_BASE}/exams/plans/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  return data.data;
}

// ==================== 冲刺包 API ====================

/**
 * 获取冲刺包列表
 * 接口：GET /api/v1/exams/crash-courses
 */
export async function getCrashCourseList() {
  const response = await fetch(`${API_BASE}/exams/crash-courses`);
  const data = await response.json();
  return data.data;
}

/**
 * 购买冲刺包
 * 接口：POST /api/v1/exams/crash-courses/purchase
 * Body参数：childId: string, packageId: string
 */
export async function purchaseCrashCourse(params: { childId: string; packageId: string }) {
  const response = await fetch(`${API_BASE}/exams/crash-courses/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  return data.data;
}

/**
 * 获取用户的冲刺包订单
 * 接口：GET /api/v1/exams/crash-courses/orders
 * 参数：childId?: string
 */
export async function getCrashCourseOrders(childId?: string) {
  const queryString = childId ? `?childId=${childId}` : '';
  const response = await fetch(`${API_BASE}/exams/crash-courses/orders${queryString}`);
  const data = await response.json();
  return data.data;
}

// ==================== 考前诊断 API ====================

/**
 * 快速能力诊断
 * 接口：POST /api/v1/exams/diagnosis
 * Body参数：childId: string, targetExamType: string
 */
export async function getExamDiagnosis(params: { childId: string; targetExamType: string }) {
  const response = await fetch(`${API_BASE}/exams/diagnosis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  return data.data;
}

// 导出类型
export interface ExamCatalog {
  examId: string;
  examType: string;
  examName: string;
  cefrLevel: string;
  description: string;
  targetAge: string;
  recommendedVocab: number;
  examStructure: any;
  status: string;
}

export interface ExamSession {
  sessionId: string;
  examId: string;
  city: string;
  centerName: string;
  centerAddress: string;
  examDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  ticketDownloadDate: string;
  resultDate: string;
  totalSeats: number;
  availableSeats: number;
  fee: number;
  examType: 'paper' | 'computer';
  status: string;
}

export interface MockExam {
  examId: string;
  childId: string;
  examType: string;
  examDate: string;
  readingScore: number;
  readingMax: number;
  writingScore: number;
  writingMax: number;
  listeningScore: number;
  listeningMax: number;
  speakingScore: number;
  speakingMax: number;
  totalScore: number;
  totalMax: number;
  predictedGrade: string;
  passConfidencePct: number;
  detailedAnalysis: any;
  isPassReady: boolean;
}

export interface CrashCourse {
  packageId: string;
  examType: string;
  examName: string;
  packageName: string;
  description: string;
  originalPrice: number;
  price: number;
  mockExamQuota: number;
  validDays: number;
  features: string[];
}
