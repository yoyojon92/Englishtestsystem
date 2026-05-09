import express, { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';

// 考试信息模型
interface ExamCatalog {
  examId: string;
  examType: 'YLE_PRE_A1' | 'YLE_A1' | 'YLE_A2' | 'A2_KEY' | 'B1_PRE' | 'B2_FIRST';
  examName: string;
  cefrLevel: string;
  description: string;
  targetAge: string;
  recommendedVocab: number;
  examStructure: ExamStructure;
  status: 'active' | 'inactive';
}

interface ExamStructure {
  components: ExamComponent[];
  totalDuration: number;
  totalScore: number;
}

interface ExamComponent {
  name: string;
  duration: number;
  score: number;
  format: string;
  parts?: ExamPart[];
}

interface ExamPart {
  partNumber: number;
  description: string;
  questionCount: number;
}

// 考试场次模型
interface ExamSession {
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
  status: 'upcoming' | 'open' | 'closed' | 'completed';
}

// 考试报名记录模型
interface ExamRegistration {
  registrationId: string;
  userId: string;
  childId: string;
  sessionId: string;
  studentInfo: StudentInfo;
  parentInfo: ParentInfo;
  serviceType: 'basic' | 'vip';
  serviceFee: number;
  status: 'pending' | 'submitted' | 'reviewing' | 'success' | 'failed' | 'ticket_ready' | 'completed' | 'result_ready';
  submittedAt?: string;
  resultScore?: number;
  resultGrade?: string;
  failReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentInfo {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  idNumber: string;
  idType: 'id_card' | 'passport';
}

interface ParentInfo {
  name: string;
  phone: string;
  relationship: string;
}

// 模拟考试记录模型
interface MockExam {
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
  timeSpent: Record<string, number>;
  detailedAnalysis: DetailedAnalysis;
  isPassReady: boolean;
  createdAt: string;
}

interface DetailedAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  questionAnalysis: QuestionAnalysis[];
}

interface QuestionAnalysis {
  questionId: string;
  component: string;
  part: number;
  isCorrect: boolean;
  timeSpent: number;
}

// 备考计划模型
interface ExamPrepPlan {
  planId: string;
  childId: string;
  examType: string;
  targetDate: string;
  currentLevel: string;
  planItems: PrepPlanItem[];
  createdAt: string;
  progressPct: number;
}

interface PrepPlanItem {
  week: number;
  tasks: string[];
  mockExamSchedule?: string;
}

// 冲刺包订单模型
interface CrashCourseOrder {
  orderId: string;
  childId: string;
  examType: string;
  packageType: 'ket_basic' | 'ket_premium' | 'pet_basic' | 'pet_premium';
  amount: number;
  paidAt: string;
  mockExamQuota: number;
  remainingQuota: number;
  validUntil: string;
  status: 'active' | 'expired' | 'completed';
}

// 模拟考试题目模型
interface MockExamQuestion {
  questionId: string;
  examType: string;
  component: 'reading' | 'writing' | 'listening' | 'speaking';
  part: number;
  questionNumber: number;
  questionText: string;
  questionAudio?: string;
  questionImage?: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionOption {
  label: string;
  text: string;
  image?: string;
}

const router = Router();

// 内存数据存储
const examCatalogs: Map<string, ExamCatalog> = new Map();
const examSessions: Map<string, ExamSession> = new Map();
const examRegistrations: Map<string, ExamRegistration> = new Map();
const mockExams: Map<string, MockExam> = new Map();
const examPrepPlans: Map<string, ExamPrepPlan> = new Map();
const crashCourseOrders: Map<string, CrashCourseOrder> = new Map();
const mockExamQuestions: Map<string, MockExamQuestion> = new Map();

// 初始化考试数据
function initializeExamData() {
  // YLE Pre-A1 Starters
  const starters: ExamCatalog = {
    examId: 'YLE_PRE_A1',
    examType: 'YLE_PRE_A1',
    examName: 'YLE Pre-A1 Starters',
    cefrLevel: 'Pre-A1',
    description: '剑桥少儿英语入门级，适合6-8岁儿童。考察基础英语听说读写能力。',
    targetAge: '6-8岁',
    recommendedVocab: 500,
    examStructure: {
      components: [
        {
          name: 'Listening',
          duration: 20,
          score: 25,
          format: '听音频选择图片/匹配信息',
          parts: [
            { partNumber: 1, description: '听短对话选图片', questionCount: 5 },
            { partNumber: 2, description: '听长对话选正确答案', questionCount: 5 },
            { partNumber: 3, description: '听短文选信息', questionCount: 5 },
            { partNumber: 4, description: '听长对话选匹配项', questionCount: 5 },
            { partNumber: 5, description: '听短文填信息', questionCount: 5 }
          ]
        },
        {
          name: 'Reading & Writing',
          duration: 20,
          score: 25,
          format: '读写结合，包括连线、选择题、填空题',
          parts: [
            { partNumber: 1, description: '看图写单词', questionCount: 5 },
            { partNumber: 2, description: '图文匹配', questionCount: 5 },
            { partNumber: 3, description: '单项选择题', questionCount: 5 },
            { partNumber: 4, description: '完形填空', questionCount: 5 },
            { partNumber: 5, description: '阅读理解', questionCount: 5 }
          ]
        },
        {
          name: 'Speaking',
          duration: 5,
          score: 15,
          format: '与考官一对一交流',
          parts: [
            { partNumber: 1, description: '个人信息问答', questionCount: 4 },
            { partNumber: 2, description: '看图说单词', questionCount: 5 },
            { partNumber: 3, description: '图片描述', questionCount: 1 },
            { partNumber: 4, description: '颜色/数字问答', questionCount: 3 }
          ]
        }
      ],
      totalDuration: 45,
      totalScore: 65
    },
    status: 'active'
  };
  examCatalogs.set('YLE_PRE_A1', starters);

  // YLE A1 Movers
  const movers: ExamCatalog = {
    examId: 'YLE_A1',
    examType: 'YLE_A1',
    examName: 'YLE A1 Movers',
    cefrLevel: 'A1',
    description: '剑桥少儿英语进阶级，适合8-10岁儿童。考察日常英语交流能力。',
    targetAge: '8-10岁',
    recommendedVocab: 900,
    examStructure: {
      components: [
        {
          name: 'Listening',
          duration: 25,
          score: 25,
          format: '听音频完成理解任务'
        },
        {
          name: 'Reading & Writing',
          duration: 30,
          score: 35,
          format: '读写综合题型'
        },
        {
          name: 'Speaking',
          duration: 7,
          score: 15,
          format: '与考官一对一交流'
        }
      ],
      totalDuration: 62,
      totalScore: 75
    },
    status: 'active'
  };
  examCatalogs.set('YLE_A1', movers);

  // YLE A2 Flyers
  const flyers: ExamCatalog = {
    examId: 'YLE_A2',
    examType: 'YLE_A2',
    examName: 'YLE A2 Flyers',
    cefrLevel: 'A2',
    description: '剑桥少儿英语高级，适合9-12岁儿童。接近初中英语水平。',
    targetAge: '9-12岁',
    recommendedVocab: 1200,
    examStructure: {
      components: [
        { name: 'Listening', duration: 25, score: 25, format: '听力理解' },
        { name: 'Reading & Writing', duration: 40, score: 40, format: '读写综合' },
        { name: 'Speaking', duration: 10, score: 15, format: '口语交流' }
      ],
      totalDuration: 75,
      totalScore: 80
    },
    status: 'active'
  };
  examCatalogs.set('YLE_A2', flyers);

  // A2 Key (KET)
  const ket: ExamCatalog = {
    examId: 'A2_KEY',
    examType: 'A2_KEY',
    examName: 'A2 Key (KET)',
    cefrLevel: 'A2',
    description: '剑桥英语初级认证，证明你能在简单情境中使用英语进行交流。',
    targetAge: '10-14岁',
    recommendedVocab: 1500,
    examStructure: {
      components: [
        {
          name: 'Reading & Writing',
          duration: 60,
          score: 50,
          format: '阅读理解 + 写作',
          parts: [
            { partNumber: 1, description: '多选题（阅读）', questionCount: 5 },
            { partNumber: 2, description: '完形填空', questionCount: 5 },
            { partNumber: 3, description: '阅读理解', questionCount: 5 },
            { partNumber: 4, description: '完形填空（选词）', questionCount: 6 },
            { partNumber: 5, description: '阅读理解（长文）', questionCount: 5 },
            { partNumber: 6, description: '短文写作（25-35词）', questionCount: 1 },
            { partNumber: 7, description: '邮件写作（25-35词）', questionCount: 1 }
          ]
        },
        {
          name: 'Listening',
          duration: 30,
          score: 25,
          format: '听力理解',
          parts: [
            { partNumber: 1, description: '短对话理解', questionCount: 5 },
            { partNumber: 2, description: '长对话理解', questionCount: 5 },
            { partNumber: 3, description: '独白理解', questionCount: 5 },
            { partNumber: 4, description: '短对话填空', questionCount: 5 }
          ]
        },
        {
          name: 'Speaking',
          duration: 10,
          score: 30,
          format: '与考官一对一交流',
          parts: [
            { partNumber: 1, description: '个人信息问答', questionCount: 4 },
            { partNumber: 2, description: '看图说话', questionCount: 1 },
            { partNumber: 3, description: '协作任务', questionCount: 1 }
          ]
        }
      ],
      totalDuration: 100,
      totalScore: 105
    },
    status: 'active'
  };
  examCatalogs.set('A2_KEY', ket);

  // B1 Preliminary (PET)
  const pet: ExamCatalog = {
    examId: 'B1_PRE',
    examType: 'B1_PRE',
    examName: 'B1 Preliminary (PET)',
    cefrLevel: 'B1',
    description: '剑桥英语中级认证，证明你能用英语处理日常生活和社交场景。',
    targetAge: '12-15岁',
    recommendedVocab: 3500,
    examStructure: {
      components: [
        {
          name: 'Reading',
          duration: 45,
          score: 32,
          format: '阅读理解',
          parts: [
            { partNumber: 1, description: '多题材阅读', questionCount: 5 },
            { partNumber: 2, description: '短文匹配', questionCount: 5 },
            { partNumber: 3, description: '阅读理解', questionCount: 5 },
            { partNumber: 4, description: '完形填空', questionCount: 6 },
            { partNumber: 5, description: '阅读理解（长文）', questionCount: 6 }
          ]
        },
        {
          name: 'Writing',
          duration: 45,
          score: 20,
          format: '写作表达',
          parts: [
            { partNumber: 1, description: '邮件/通知写作（35-45词）', questionCount: 1 },
            { partNumber: 2, description: '短文写作（100词）', questionCount: 1 }
          ]
        },
        {
          name: 'Listening',
          duration: 30,
          score: 25,
          format: '听力理解'
        },
        {
          name: 'Speaking',
          duration: 12,
          score: 30,
          format: '与考官一对一及搭档交流',
          parts: [
            { partNumber: 1, description: '个人信息问答', questionCount: 4 },
            { partNumber: 2, description: '图片对比描述', questionCount: 1 },
            { partNumber: 3, description: '协作任务', questionCount: 1 },
            { partNumber: 4, description: '话题讨论', questionCount: 4 }
          ]
        }
      ],
      totalDuration: 132,
      totalScore: 107
    },
    status: 'active'
  };
  examCatalogs.set('B1_PRE', pet);

  // B2 First (FCE)
  const fce: ExamCatalog = {
    examId: 'B2_FIRST',
    examType: 'B2_FIRST',
    examName: 'B2 First (FCE)',
    cefrLevel: 'B2',
    description: '剑桥英语中高级认证，证明你能在工作或学习中使用较高水平的英语。',
    targetAge: '14-17岁',
    recommendedVocab: 6000,
    examStructure: {
      components: [
        { name: 'Reading & Use of English', duration: 75, score: 52, format: '阅读与语言运用' },
        { name: 'Writing', duration: 80, score: 40, format: '写作（两篇）' },
        { name: 'Listening', duration: 40, score: 30, format: '听力理解' },
        { name: 'Speaking', duration: 14, score: 40, format: '口语测试' }
      ],
      totalDuration: 209,
      totalScore: 162
    },
    status: 'active'
  };
  examCatalogs.set('B2_FIRST', fce);

  // 初始化考试场次
  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉'];
  const centers = {
    '北京': ['British Council 北京考试中心', '剑桥外语考试中心'],
    '上海': ['上海外国语大学考点', 'British Council 上海考试中心'],
    '广州': ['华南师范大学考点', '广州英国文化协会'],
    '深圳': ['深圳大学考点', '深圳外国语学校考点'],
    '杭州': ['浙江大学考点', '杭州英国文化协会'],
    '成都': ['四川大学考点', '成都外国语学校考点'],
    '南京': ['南京大学考点', '南京外国语学校考点'],
    '武汉': ['武汉大学考点', '华中师范大学考点']
  };

  const examTypes: Array<{ id: string; paperFee: number; computerFee: number }> = [
    { id: 'YLE_PRE_A1', paperFee: 480, computerFee: 580 },
    { id: 'YLE_A1', paperFee: 480, computerFee: 580 },
    { id: 'YLE_A2', paperFee: 480, computerFee: 580 },
    { id: 'A2_KEY', paperFee: 980, computerFee: 1180 },
    { id: 'B1_PRE', paperFee: 1180, computerFee: 1380 },
    { id: 'B2_FIRST', paperFee: 1480, computerFee: 1680 }
  ];

  // 为每个考试类型创建场次
  examTypes.forEach(examType => {
    cities.forEach(city => {
      const cityCenters = centers[city as keyof typeof centers] || [];
      cityCenters.forEach((center, idx) => {
        // 纸笔考试场次
        const paperSessionId = `SESSION_${examType.id}_${city}_P_${Date.now()}_${idx}`;
        const now = new Date();
        const examDate = new Date(now.getTime() + (30 + Math.random() * 180) * 24 * 60 * 60 * 1000);
        
        const paperSession: ExamSession = {
          sessionId: paperSessionId,
          examId: examType.id,
          city,
          centerName: center,
          centerAddress: `${city}市XX区XX路${100 + idx * 10}号`,
          examDate: examDate.toISOString().split('T')[0],
          registrationOpenDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          registrationCloseDate: new Date(examDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ticketDownloadDate: new Date(examDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          resultDate: new Date(examDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalSeats: 50,
          availableSeats: Math.floor(Math.random() * 30) + 10,
          fee: examType.paperFee,
          examType: 'paper',
          status: examDate > now ? 'upcoming' : 'completed'
        };
        examSessions.set(paperSessionId, paperSession);

        // 机考场次
        const computerSessionId = `SESSION_${examType.id}_${city}_C_${Date.now()}_${idx}`;
        const computerExamDate = new Date(now.getTime() + (45 + Math.random() * 120) * 24 * 60 * 60 * 1000);
        
        const computerSession: ExamSession = {
          sessionId: computerSessionId,
          examId: examType.id,
          city,
          centerName: center,
          centerAddress: `${city}市XX区XX路${200 + idx * 10}号（机考中心）`,
          examDate: computerExamDate.toISOString().split('T')[0],
          registrationOpenDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          registrationCloseDate: new Date(computerExamDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ticketDownloadDate: new Date(computerExamDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          resultDate: new Date(computerExamDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalSeats: 30,
          availableSeats: Math.floor(Math.random() * 20) + 5,
          fee: examType.computerFee,
          examType: 'computer',
          status: computerExamDate > now ? 'upcoming' : 'completed'
        };
        examSessions.set(computerSessionId, computerSession);
      });
    });
  });
}

initializeExamData();

// ==================== 考试目录 API ====================

/**
 * 获取所有考试列表
 * GET /api/v1/exams
 */
router.get('/', (req: Request, res: Response) => {
  const catalogs = Array.from(examCatalogs.values()).filter(c => c.status === 'active');
  res.json({
    success: true,
    data: catalogs
  });
});

// ==================== 考试场次 API ====================

/**
 * 获取考试场次列表
 * GET /api/v1/exams/:examId/sessions
 * Query: city, examType, status
 */
router.get('/:examId/sessions', (req: Request, res: Response) => {
  const examId = req.params.examId as string;
  const { city, examType, status } = req.query;
  
  let sessions = Array.from(examSessions.values()).filter(s => s.examId === examId);
  
  if (city) {
    sessions = sessions.filter(s => s.city === city);
  }
  if (examType) {
    sessions = sessions.filter(s => s.examType === examType);
  }
  if (status) {
    sessions = sessions.filter(s => s.status === status);
  }

  // 按考试日期排序
  sessions.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  res.json({
    success: true,
    data: sessions
  });
});

/**
 * 获取所有可用城市
 * GET /api/v1/exams/sessions/cities
 */
router.get('/sessions/cities', (req: Request, res: Response) => {
  const cities = [...new Set(Array.from(examSessions.values()).map(s => s.city))];
  res.json({
    success: true,
    data: cities
  });
});

/**
 * 获取场次详情
 * GET /api/v1/exams/sessions/:sessionId
 */
router.get('/sessions/:sessionId', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const session = examSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: '考试场次不存在'
    });
  }

  // 获取考试信息
  const exam = examCatalogs.get(session.examId);

  res.json({
    success: true,
    data: {
      ...session,
      exam
    }
  });
});

// ==================== 考试报名 API ====================

/**
 * 创建考试报名
 * POST /api/v1/exams/registrations
 */
router.post('/registrations', (req: Request, res: Response) => {
  const {
    userId,
    childId,
    sessionId,
    studentInfo,
    parentInfo,
    serviceType
  }: {
    userId: string;
    childId: string;
    sessionId: string;
    studentInfo: StudentInfo;
    parentInfo: ParentInfo;
    serviceType: 'basic' | 'vip';
  } = req.body;

  // 验证场次存在
  const session = examSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: '考试场次不存在'
    });
  }

  if (session.availableSeats <= 0) {
    return res.status(400).json({
      success: false,
      message: '该场次已满员'
    });
  }

  // 计算服务费
  const serviceFee = serviceType === 'vip' ? 199 : 99;

  const registration: ExamRegistration = {
    registrationId: `REG_${Date.now()}`,
    userId,
    childId,
    sessionId,
    studentInfo,
    parentInfo,
    serviceType,
    serviceFee,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  examRegistrations.set(registration.registrationId, registration);

  // 更新场次剩余座位
  session.availableSeats -= 1;
  examSessions.set(sessionId, session);

  res.json({
    success: true,
    data: {
      registration,
      totalAmount: session.fee + serviceFee
    }
  });
});

/**
 * 获取用户的考试报名列表
 * GET /api/v1/exams/registrations
 * Query: userId, childId
 */
router.get('/registrations/list', (req: Request, res: Response) => {
  const { userId, childId } = req.query;
  
  let registrations = Array.from(examRegistrations.values());
  
  if (userId) {
    registrations = registrations.filter(r => r.userId === userId);
  }
  if (childId) {
    registrations = registrations.filter(r => r.childId === childId);
  }

  // 添加场次和考试信息
  const registrationsWithDetails = registrations.map(reg => {
    const session = examSessions.get(reg.sessionId);
    const exam = session ? examCatalogs.get(session.examId) : null;
    return {
      ...reg,
      session,
      exam
    };
  });

  res.json({
    success: true,
    data: registrationsWithDetails
  });
});

/**
 * 获取报名详情
 * GET /api/v1/exams/registrations/:registrationId
 */
router.get('/registrations/:registrationId', (req: Request, res: Response) => {
  const registrationId = req.params.registrationId as string;
  const registration = examRegistrations.get(registrationId);
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: '报名记录不存在'
    });
  }

  const session = examSessions.get(registration.sessionId);
  const exam = session ? examCatalogs.get(session.examId) : null;

  res.json({
    success: true,
    data: {
      ...registration,
      session,
      exam
    }
  });
});

/**
 * 确认报名（模拟支付成功后）
 * POST /api/v1/exams/registrations/:registrationId/confirm
 */
router.post('/registrations/:registrationId/confirm', (req: Request, res: Response) => {
  const registrationId = req.params.registrationId as string;
  const registration = examRegistrations.get(registrationId);
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: '报名记录不存在'
    });
  }

  registration.status = 'submitted';
  registration.submittedAt = new Date().toISOString();
  registration.updatedAt = new Date().toISOString();
  
  examRegistrations.set(registrationId, registration);

  // 模拟延迟后状态更新
  setTimeout(() => {
    const reg = examRegistrations.get(registrationId);
    if (reg) {
      reg.status = 'reviewing';
      reg.updatedAt = new Date().toISOString();
      examRegistrations.set(registrationId, reg);
    }
  }, 3000);

  setTimeout(() => {
    const reg = examRegistrations.get(registrationId);
    if (reg) {
      reg.status = 'success';
      reg.updatedAt = new Date().toISOString();
      examRegistrations.set(registrationId, reg);
    }
  }, 6000);

  res.json({
    success: true,
    data: registration
  });
});

// ==================== 模拟考试 API ====================

/**
 * 获取模拟考试题目
 * GET /api/v1/exams/mock/questions
 * Query: examType, component
 */
router.get('/mock/questions', (req: Request, res: Response) => {
  const { examType, component } = req.query;
  
  // 生成模拟题目（实际应从题库获取）
  const questions = generateMockQuestions(examType as string || 'A2_KEY', component as string);
  
  res.json({
    success: true,
    data: questions
  });
});

function generateMockQuestions(examType: string, component?: string): MockExamQuestion[] {
  const questions: MockExamQuestion[] = [];
  
  // 读取部分
  if (!component || component === 'reading') {
    for (let i = 1; i <= 5; i++) {
      questions.push({
        questionId: `${examType}_R_P${i}_Q1`,
        examType,
        component: 'reading',
        part: i,
        questionNumber: 1,
        questionText: `Read the text and answer the question. This is sample reading question ${i} for ${examType}.`,
        options: [
          { label: 'A', text: 'Option A for question ' + i },
          { label: 'B', text: 'Option B for question ' + i },
          { label: 'C', text: 'Option C for question ' + i },
          { label: 'D', text: 'Option D for question ' + i }
        ],
        correctAnswer: 'A',
        explanation: 'The correct answer is A because...',
        difficulty: i <= 2 ? 'easy' : i <= 4 ? 'medium' : 'hard'
      });
    }
  }

  // 听力部分
  if (!component || component === 'listening') {
    for (let i = 1; i <= 4; i++) {
      questions.push({
        questionId: `${examType}_L_P${i}_Q1`,
        examType,
        component: 'listening',
        part: i,
        questionNumber: 1,
        questionText: `Listen to the audio and select the correct answer. This is sample listening question ${i}.`,
        questionAudio: 'sample_audio_' + i,
        options: [
          { label: 'A', text: 'Audio option A' },
          { label: 'B', text: 'Audio option B' },
          { label: 'C', text: 'Audio option C' }
        ],
        correctAnswer: 'B',
        difficulty: i <= 2 ? 'easy' : 'hard'
      });
    }
  }

  // 写作部分
  if (!component || component === 'writing') {
    questions.push({
      questionId: `${examType}_W_P1_Q1`,
      examType,
      component: 'writing',
      part: 1,
      questionNumber: 1,
      questionText: 'Write an email (25-35 words) to your friend about your weekend plans.',
      correctAnswer: '',
      difficulty: 'medium'
    });
    questions.push({
      questionId: `${examType}_W_P2_Q1`,
      examType,
      component: 'writing',
      part: 2,
      questionNumber: 1,
      questionText: 'Write a story (about 100 words) based on the picture prompt. Include: what happened, where, and how you felt.',
      correctAnswer: '',
      questionImage: 'sample_writing_image',
      difficulty: 'hard'
    });
  }

  return questions;
}

/**
 * 提交模拟考试答案
 * POST /api/v1/exams/mock/submit
 */
router.post('/mock/submit', (req: Request, res: Response) => {
  const {
    childId,
    examType,
    answers
  }: {
    childId: string;
    examType: string;
    answers: Array<{ questionId: string; answer: string; timeSpent: number }>;
  } = req.body;

  // 模拟评分逻辑
  const readingScore = Math.floor(Math.random() * 15) + 10;
  const writingScore = Math.floor(Math.random() * 12) + 8;
  const listeningScore = Math.floor(Math.random() * 18) + 7;
  const speakingScore = Math.floor(Math.random() * 20) + 10;

  const totalScore = readingScore + writingScore + listeningScore + speakingScore;
  const totalMax = 100;

  // 根据分数预测等级
  let predictedGrade = 'Fail';
  let passConfidencePct = 0;
  if (totalScore >= 90) {
    predictedGrade = 'Pass with Distinction';
    passConfidencePct = 95 + Math.random() * 5;
  } else if (totalScore >= 80) {
    predictedGrade = 'Pass with Merit';
    passConfidencePct = 85 + Math.random() * 10;
  } else if (totalScore >= 70) {
    predictedGrade = 'Pass';
    passConfidencePct = 70 + Math.random() * 15;
  } else if (totalScore >= 60) {
    predictedGrade = 'Narrow Pass';
    passConfidencePct = 55 + Math.random() * 15;
  } else {
    predictedGrade = 'Below Pass';
    passConfidencePct = Math.random() * 40;
  }

  const exam: MockExam = {
    examId: `MOCK_${Date.now()}`,
    childId,
    examType,
    examDate: new Date().toISOString(),
    readingScore,
    readingMax: 25,
    writingScore,
    writingMax: 25,
    listeningScore,
    listeningMax: 25,
    speakingScore,
    speakingMax: 25,
    totalScore,
    totalMax,
    predictedGrade,
    passConfidencePct: Math.floor(passConfidencePct),
    timeSpent: {
      reading: Math.floor(Math.random() * 15) + 35,
      writing: Math.floor(Math.random() * 15) + 30,
      listening: Math.floor(Math.random() * 10) + 20,
      speaking: Math.floor(Math.random() * 5) + 8
    },
    detailedAnalysis: {
      strengths: [
        '词汇运用较为准确',
        '语法结构掌握良好',
        '阅读理解能力强'
      ],
      weaknesses: [
        '写作表达需要丰富',
        '听力细节把握需加强',
        '口语流利度可提升'
      ],
      recommendations: [
        '建议加强词汇量的积累',
        '多做听力精听练习',
        '坚持每日口语对话练习',
        '每周完成一套模拟题'
      ],
      questionAnalysis: answers.slice(0, 10).map((a, i) => ({
        questionId: a.questionId,
        component: ['reading', 'writing', 'listening', 'speaking'][i % 4] as any,
        part: (i % 5) + 1,
        isCorrect: Math.random() > 0.4,
        timeSpent: a.timeSpent
      }))
    },
    isPassReady: passConfidencePct >= 75,
    createdAt: new Date().toISOString()
  };

  mockExams.set(exam.examId, exam);

  res.json({
    success: true,
    data: exam
  });
});

/**
 * 获取模拟考试成绩列表
 * GET /api/v1/exams/mock/history
 * Query: childId, examType
 */
router.get('/mock/history', (req: Request, res: Response) => {
  const { childId, examType } = req.query;
  
  let exams = Array.from(mockExams.values());
  
  if (childId) {
    exams = exams.filter(e => e.childId === childId);
  }
  if (examType) {
    exams = exams.filter(e => e.examType === examType);
  }

  // 按时间倒序
  exams.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

  res.json({
    success: true,
    data: exams
  });
});

/**
 * 获取模拟考试详情
 * GET /api/v1/exams/mock/:examId
 */
router.get('/mock/:examId', (req: Request, res: Response) => {
  const examId = req.params.examId as string;
  const exam = mockExams.get(examId);
  
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: '模拟考试成绩不存在'
    });
  }

  // 获取考试信息
  const examCatalog = examCatalogs.get(exam.examType);

  res.json({
    success: true,
    data: {
      ...exam,
      examCatalog
    }
  });
});

// ==================== 备考计划 API ====================

/**
 * 创建备考计划
 * POST /api/v1/exams/plans
 */
router.post('/plans', (req: Request, res: Response) => {
  const {
    childId,
    examType,
    targetDate,
    currentLevel
  }: {
    childId: string;
    examType: string;
    targetDate: string;
    currentLevel: string;
  } = req.body;

  // 计算备考周期（周）
  const target = new Date(targetDate);
  const now = new Date();
  const weeksUntilExam = Math.ceil((target.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const planItems = [];
  for (let week = 1; week <= Math.min(weeksUntilExam, 12); week++) {
    const tasks = [];
    
    if (week <= 4) {
      tasks.push('词汇积累：每日背诵20个核心词汇');
      tasks.push('基础语法：完成相应章节练习');
      tasks.push('听力训练：每日30分钟精听');
    } else if (week <= 8) {
      tasks.push('强化训练：完成专项练习');
      tasks.push('模拟测试：完成一套全真模拟');
      tasks.push('薄弱项突破：根据错误分析重点练习');
    } else {
      tasks.push('冲刺复习：高频错题回顾');
      tasks.push('全真模拟：严格按照时间完成');
      tasks.push('考试技巧：复习各题型解题策略');
    }

    if (week % 2 === 0) {
      planItems.push({
        week,
        tasks,
        mockExamSchedule: `第${week}周`
      });
    } else {
      planItems.push({ week, tasks });
    }
  }

  const plan: ExamPrepPlan = {
    planId: `PLAN_${Date.now()}`,
    childId,
    examType,
    targetDate,
    currentLevel,
    planItems,
    createdAt: new Date().toISOString(),
    progressPct: 0
  };

  examPrepPlans.set(plan.planId, plan);

  res.json({
    success: true,
    data: plan
  });
});

/**
 * 获取备考计划列表
 * GET /api/v1/exams/plans
 * Query: childId
 */
router.get('/plans/list', (req: Request, res: Response) => {
  const { childId } = req.query;
  
  let plans = Array.from(examPrepPlans.values());
  
  if (childId) {
    plans = plans.filter(p => p.childId === childId);
  }

  // 添加考试信息
  const plansWithDetails = plans.map(plan => ({
    ...plan,
    exam: examCatalogs.get(plan.examType)
  }));

  res.json({
    success: true,
    data: plansWithDetails
  });
});

/**
 * 更新备考计划进度
 * PUT /api/v1/exams/plans/:planId
 */
router.put('/plans/:planId', (req: Request, res: Response) => {
  const planId = req.params.planId as string;
  const { progressPct, completedWeeks } = req.body;
  
  const plan = examPrepPlans.get(planId);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: '备考计划不存在'
    });
  }

  if (progressPct !== undefined) {
    plan.progressPct = progressPct;
  }
  if (completedWeeks !== undefined) {
    plan.progressPct = Math.floor((completedWeeks / plan.planItems.length) * 100);
  }

  examPrepPlans.set(planId, plan);

  res.json({
    success: true,
    data: plan
  });
});

// ==================== 冲刺包 API ====================

/**
 * 获取冲刺包列表
 * GET /api/v1/exams/crash-courses
 */
router.get('/crash-courses', (req: Request, res: Response) => {
  const crashCourses = [
    {
      packageId: 'KET_BASIC',
      examType: 'A2_KEY',
      examName: 'KET',
      packageName: 'KET 冲刺包（基础版）',
      description: '含8次全真模拟+专项训练+考前技巧课',
      originalPrice: 299,
      price: 199,
      mockExamQuota: 8,
      validDays: 90,
      features: [
        '8次全真模拟考试',
        '薄弱项分析报告',
        '考前技巧直播课（2节）',
        '错题本永久保存'
      ]
    },
    {
      packageId: 'KET_PREMIUM',
      examType: 'A2_KEY',
      examName: 'KET',
      packageName: 'KET 冲刺包（尊享版）',
      description: '基础版+1对1考前辅导',
      originalPrice: 499,
      price: 399,
      mockExamQuota: 12,
      validDays: 120,
      features: [
        '12次全真模拟考试',
        '薄弱项分析报告',
        '考前技巧直播课（4节）',
        '1对1考前辅导（60分钟）',
        '不过重学保障'
      ]
    },
    {
      packageId: 'PET_BASIC',
      examType: 'B1_PRE',
      examName: 'PET',
      packageName: 'PET 冲刺包（基础版）',
      description: '含8次全真模拟+专项训练+考前技巧课',
      originalPrice: 349,
      price: 249,
      mockExamQuota: 8,
      validDays: 90,
      features: [
        '8次全真模拟考试',
        '薄弱项分析报告',
        '考前技巧直播课（2节）',
        '错题本永久保存'
      ]
    },
    {
      packageId: 'PET_PREMIUM',
      examType: 'B1_PRE',
      examName: 'PET',
      packageName: 'PET 冲刺包（尊享版）',
      description: '基础版+1对1考前辅导',
      originalPrice: 549,
      price: 449,
      mockExamQuota: 12,
      validDays: 120,
      features: [
        '12次全真模拟考试',
        '薄弱项分析报告',
        '考前技巧直播课（4节）',
        '1对1考前辅导（60分钟）',
        '不过重学保障'
      ]
    }
  ];

  res.json({
    success: true,
    data: crashCourses
  });
});

/**
 * 购买冲刺包
 * POST /api/v1/exams/crash-courses/purchase
 */
router.post('/crash-courses/purchase', (req: Request, res: Response) => {
  const {
    childId,
    packageId
  }: {
    childId: string;
    packageId: string;
  } = req.body;

  const packages: Record<string, any> = {
    'KET_BASIC': { examType: 'A2_KEY', amount: 199, quota: 8, days: 90 },
    'KET_PREMIUM': { examType: 'A2_KEY', amount: 399, quota: 12, days: 120 },
    'PET_BASIC': { examType: 'B1_PRE', amount: 249, quota: 8, days: 90 },
    'PET_PREMIUM': { examType: 'B1_PRE', amount: 449, quota: 12, days: 120 }
  };

  const pkg = packages[packageId];
  if (!pkg) {
    return res.status(404).json({
      success: false,
      message: '冲刺包不存在'
    });
  }

  const order: CrashCourseOrder = {
    orderId: `ORDER_${Date.now()}`,
    childId,
    examType: pkg.examType,
    packageType: packageId as any,
    amount: pkg.amount,
    paidAt: new Date().toISOString(),
    mockExamQuota: pkg.quota,
    remainingQuota: pkg.quota,
    validUntil: new Date(Date.now() + pkg.days * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  };

  crashCourseOrders.set(order.orderId, order);

  res.json({
    success: true,
    data: order
  });
});

/**
 * 获取用户的冲刺包订单
 * GET /api/v1/exams/crash-courses/orders
 * Query: childId
 */
router.get('/crash-courses/orders', (req: Request, res: Response) => {
  const { childId } = req.query;
  
  let orders = Array.from(crashCourseOrders.values());
  
  if (childId) {
    orders = orders.filter(o => o.childId === childId);
  }

  // 检查是否过期
  const now = new Date();
  orders = orders.map(order => {
    if (new Date(order.validUntil) < now && order.status === 'active') {
      order.status = 'expired';
      crashCourseOrders.set(order.orderId, order);
    }
    return order;
  });

  res.json({
    success: true,
    data: orders
  });
});

// ==================== 考试详情 API（动态路由，放在所有静态路由之后） ====================

/**
 * 获取考试详情
 * GET /api/v1/exams/:examId
 */
router.get('/:examId', (req: Request, res: Response) => {
  const examId = req.params.examId as string;
  const catalog = examCatalogs.get(examId);
  
  if (!catalog) {
    return res.status(404).json({
      success: false,
      message: '考试类型不存在'
    });
  }

  // 获取该考试的场次统计
  const sessions = Array.from(examSessions.values()).filter(s => s.examId === examId);
  const openSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'open');
  
  res.json({
    success: true,
    data: {
      ...catalog,
      statistics: {
        totalSessions: sessions.length,
        openSessions: openSessions.length,
        totalSeats: openSessions.reduce((sum, s) => sum + s.totalSeats, 0),
        availableSeats: openSessions.reduce((sum, s) => sum + s.availableSeats, 0)
      }
    }
  });
});

// ==================== 考前诊断 API ====================

/**
 * 快速能力诊断
 * POST /api/v1/exams/diagnosis
 */
router.post('/diagnosis', (req: Request, res: Response) => {
  const {
    childId,
    targetExamType
  }: {
    childId: string;
    targetExamType: string;
  } = req.body;

  // 获取孩子的历史测评和模拟考试成绩
  const historyExams = Array.from(mockExams.values())
    .filter(e => e.childId === childId)
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

  const latestExam = historyExams[0];

  let recommendation = {
    status: 'not_ready',
    confidence: 0,
    message: '',
    suggestion: '',
    recommendedWeeks: 0,
    suitableLevel: targetExamType
  };

  if (latestExam) {
    const confidence = latestExam.passConfidencePct;
    
    if (confidence >= 85) {
      recommendation = {
        status: 'ready',
        confidence,
        message: '预测通过率较高，建议立即报名！',
        suggestion: '你的英语能力已经达到了考试要求，可以直接报名参加正式考试。',
        recommendedWeeks: 0,
        suitableLevel: targetExamType
      };
    } else if (confidence >= 60) {
      recommendation = {
        status: 'almost_ready',
        confidence,
        message: '基础扎实，还需加强',
        suggestion: `建议再进行 ${Math.ceil((85 - confidence) / 10)} 周的专项训练，重点突破薄弱项。`,
        recommendedWeeks: Math.ceil((85 - confidence) / 10),
        suitableLevel: targetExamType
      };
    } else {
      recommendation = {
        status: 'not_ready',
        confidence,
        message: '建议先打好基础',
        suggestion: '建议先提升英语基础能力，可以从对应级别的入门课程开始学习。',
        recommendedWeeks: 12,
        suitableLevel: targetExamType
      };
    }
  } else {
    // 没有历史记录，建议先做能力测评
    recommendation = {
      status: 'no_history',
      confidence: 0,
      message: '建议先进行能力测评',
      suggestion: '系统将为你安排一次5分钟快速诊断，了解孩子的当前英语水平后再给出建议。',
      recommendedWeeks: 0,
      suitableLevel: ''
    };
  }

  res.json({
    success: true,
    data: {
      ...recommendation,
      historyExams: historyExams.slice(0, 3),
      examCatalog: examCatalogs.get(targetExamType)
    }
  });
});

export default router;
