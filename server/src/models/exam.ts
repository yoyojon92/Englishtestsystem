// 考试相关的数据模型

// 考试信息模型
export interface ExamCatalog {
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

export interface ExamStructure {
  components: ExamComponent[];
  totalDuration: number; // 分钟
  totalScore: number;
}

export interface ExamComponent {
  name: string;
  duration: number;
  score: number;
  format: string;
  parts?: ExamPart[];
}

export interface ExamPart {
  partNumber: number;
  description: string;
  questionCount: number;
}

// 考试场次模型
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
  status: 'upcoming' | 'open' | 'closed' | 'completed';
}

// 考试报名记录模型
export interface ExamRegistration {
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

export interface StudentInfo {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  idNumber: string;
  idType: 'id_card' | 'passport';
}

export interface ParentInfo {
  name: string;
  phone: string;
  relationship: string;
}

// 模拟考试记录模型
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
  timeSpent: Record<string, number>;
  detailedAnalysis: DetailedAnalysis;
  isPassReady: boolean;
  createdAt: string;
}

export interface DetailedAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  questionAnalysis: QuestionAnalysis[];
}

export interface QuestionAnalysis {
  questionId: string;
  component: string;
  part: number;
  isCorrect: boolean;
  timeSpent: number;
}

// 备考计划模型
export interface ExamPrepPlan {
  planId: string;
  childId: string;
  examType: string;
  targetDate: string;
  currentLevel: string;
  planItems: PrepPlanItem[];
  createdAt: string;
  progressPct: number;
}

export interface PrepPlanItem {
  week: number;
  tasks: string[];
  mockExamSchedule?: string;
}

// 冲刺包订单模型
export interface CrashCourseOrder {
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
export interface MockExamQuestion {
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

export interface QuestionOption {
  label: string;
  text: string;
  image?: string;
}
