// 测试会话管理模块
// 支持渠道追踪、完整测试流程

import { questionStore } from './inMemory';

// 题目类型
export type QuestionType = 'multiple_choice' | 'match_notice' | 'fill_blank' | 'reading_comprehension';

// 单题答题记录
export interface AnswerRecord {
  questionId: string;
  answer: string;
  timeSpent: number; // 秒
  answeredAt: number; // 时间戳
  isCorrect?: boolean;
}

// 测试会话状态
export type SessionStatus = 'in_progress' | 'submitted' | 'expired';

// 测试会话
export interface TestSession {
  sessionId: string;
  phone?: string;
  channel: string; // 渠道来源
  examType?: string; // KET/PET
  questions: string[]; // 题目ID列表
  answers: Map<string, AnswerRecord>; // 已提交的答案
  startedAt: number;
  submittedAt?: number;
  status: SessionStatus;
  report?: TestReport; // 测试报告
}

// 测试报告
export interface SkillScore {
  score: number; // 0-100
  cefr: string;
  level: string;
}

export interface WeakPoint {
  tag: string;
  mastery: number; // 0-1
  questionCount: number;
  correctRate: number;
}

export interface TestReport {
  sessionId: string;
  phone?: string;
  channel: string;
  generatedAt: number;
  
  // 整体评分
  totalQuestions: number;
  correctCount: number;
  accuracy: number; // 0-1
  cefrLevel: string;
  cefrColor: string;
  
  // 分项评分
  skills: {
    reading: SkillScore;
    listening: SkillScore;
    writing: SkillScore;
    speaking: SkillScore;
  };
  
  // 薄弱项
  weakPoints: WeakPoint[];
  
  // 答题时间分析
  timeAnalysis: {
    totalTime: number;
    averageTime: number;
    fastAnswers: number; // 过快标记
    slowAnswers: number; // 过慢标记
  };
  
  // 推荐服务
  recommendedService: {
    type: 'offline' | 'online' | 'self_study';
    name: string;
    description: string;
  };
  
  // 诊断详情（来自L3）
  diagnosis?: any;
  
  // 学习计划（来自L5）
  learningPlan?: any;
}

// 会话存储
const sessions = new Map<string, TestSession>();

// 生成会话ID
function generateSessionId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// 获取或创建会话
export function getOrCreateSession(sessionId: string): TestSession | undefined {
  return sessions.get(sessionId);
}

// 创建测试会话
export function createTestSession(params: {
  phone?: string;
  channel?: string;
  examType?: string;
  count?: number; // 题目数量，默认40
}): { session: TestSession; questions: any[] } {
  const sessionId = generateSessionId();
  const count = params.count || 40;
  
  // 从题库获取题目
  let questions: any[] = [];
  
  if (params.examType) {
    // 按考试类型获取
    const sets = questionStore.getQuestionSets();
    const targetSets = sets.filter(s => s.exam_type === params.examType);
    
    const selectedQuestions: any[] = [];
    for (const set of targetSets) {
      const setQuestions = questionStore.getQuestionsBySet(set.set_id);
      selectedQuestions.push(...setQuestions);
    }
    
    // 随机选择指定数量
    questions = shuffleArray(selectedQuestions).slice(0, count);
  } else {
    // 获取快速测试题目（混合）
    questions = questionStore.getQuickTestQuestions(count);
  }
  
  const questionIds = questions.map(q => q.question_id);
  
  const session: TestSession = {
    sessionId,
    phone: params.phone,
    channel: params.channel || 'direct',
    examType: params.examType,
    questions: questionIds,
    answers: new Map(),
    startedAt: Date.now(),
    status: 'in_progress'
  };
  
  sessions.set(sessionId, session);
  
  return { session, questions };
}

// 记录单题答案
export function recordAnswer(sessionId: string, params: {
  questionId: string;
  answer: string;
  timeSpent: number;
}): { success: boolean; isCorrect?: boolean; error?: string } {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }
  
  if (session.status !== 'in_progress') {
    return { success: false, error: 'Session already submitted' };
  }
  
  // 获取题目正确答案
  const question = questionStore.getQuestion(params.questionId);
  const isCorrect = question ? params.answer === question.correct_answer : undefined;
  
  // 记录答案
  session.answers.set(params.questionId, {
    questionId: params.questionId,
    answer: params.answer,
    timeSpent: params.timeSpent,
    answeredAt: Date.now(),
    isCorrect
  });
  
  return { success: true, isCorrect };
}

// 提交试卷并生成报告
export function submitTest(sessionId: string): { 
  success: boolean; 
  report?: TestReport; 
  error?: string 
} {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }
  
  if (session.status !== 'in_progress') {
    return { success: false, error: 'Session already submitted' };
  }
  
  // 更新状态
  session.status = 'submitted';
  session.submittedAt = Date.now();
  
  // 生成报告
  const report = generateReport(session);
  session.report = report;
  
  return { success: true, report };
}

// 生成测试报告
function generateReport(session: TestSession): TestReport {
  const { answers, questions, channel } = session;
  
  // 统计正确率
  let correctCount = 0;
  const skillStats = {
    reading: { total: 0, correct: 0 },
    listening: { total: 0, correct: 0 },
    writing: { total: 0, correct: 0 },
    speaking: { total: 0, correct: 0 }
  };
  const knowledgeStats = new Map<string, { total: number; correct: number }>();
  let totalTime = 0;
  let fastCount = 0;
  let slowCount = 0;
  
  const avgTimePerQuestion = 45; // 平均每题45秒
  
  for (const questionId of questions) {
    const answer = answers.get(questionId);
    if (!answer) continue;
    
    const question = questionStore.getQuestion(questionId);
    if (!question) continue;
    
    totalTime += answer.timeSpent;
    
    // 统计正确率
    if (answer.isCorrect) {
      correctCount++;
    }
    
    // 统计分项
    const skill = question.skill || 'reading';
    if (skillStats[skill as keyof typeof skillStats]) {
      skillStats[skill as keyof typeof skillStats].total++;
      if (answer.isCorrect) {
        skillStats[skill as keyof typeof skillStats].correct++;
      }
    }
    
    // 统计知识点
    if (question.knowledge_points) {
      for (const kp of question.knowledge_points) {
        const tag = kp.tag || '基础语法';
        if (!knowledgeStats.has(tag)) {
          knowledgeStats.set(tag, { total: 0, correct: 0 });
        }
        const stats = knowledgeStats.get(tag)!;
        stats.total++;
        if (answer.isCorrect) stats.correct++;
      }
    }
    
    // 答题时间异常检测
    if (answer.timeSpent < 5) {
      fastCount++; // 过快（可能乱答）
    } else if (answer.timeSpent > 120) {
      slowCount++; // 过慢
    }
  }
  
  // 计算正确率
  const answeredCount = answers.size;
  const accuracy = answeredCount > 0 ? correctCount / answeredCount : 0;
  
  // 计算CEFR等级
  const cefrLevel = calculateCEFR(accuracy);
  const cefrColor = getCEFRColor(cefrLevel);
  
  // 计算分项分数
  const skills = {
    reading: calculateSkillScore(skillStats.reading),
    listening: calculateSkillScore(skillStats.listening),
    writing: calculateSkillScore(skillStats.writing),
    speaking: calculateSkillScore(skillStats.speaking)
  };
  
  // 找出薄弱项
  const weakPoints: WeakPoint[] = [];
  knowledgeStats.forEach((stats, tag) => {
    const mastery = stats.total > 0 ? stats.correct / stats.total : 0;
    if (mastery < 0.5) {
      weakPoints.push({
        tag,
        mastery,
        questionCount: stats.total,
        correctRate: Math.round(mastery * 100)
      });
    }
  });
  
  // 按掌握度排序，取Top 2
  weakPoints.sort((a, b) => a.mastery - b.mastery);
  const topWeakPoints = weakPoints.slice(0, 2);
  
  // 推荐服务
  const recommendedService = recommendService(cefrLevel, weakPoints.length);
  
  // 构建报告
  const report: TestReport = {
    sessionId: session.sessionId,
    phone: session.phone,
    channel,
    generatedAt: Date.now(),
    totalQuestions: questions.length,
    correctCount,
    accuracy,
    cefrLevel,
    cefrColor,
    skills,
    weakPoints: topWeakPoints,
    timeAnalysis: {
      totalTime,
      averageTime: answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0,
      fastAnswers: fastCount,
      slowAnswers: slowCount
    },
    recommendedService,
    // 诊断和学习计划数据（基于本次测试）
    diagnosis: {
      cefrOverall: cefrLevel,
      skills: {
        reading: skills.reading.cefr,
        listening: skills.listening.cefr,
        writing: skills.writing.cefr,
        speaking: skills.speaking.cefr,
      },
      knowledgeMastery: Object.fromEntries(
        weakPoints.map(w => [w.tag, w.mastery])
      ),
      vocabularySize: getVocabularyEstimate(cefrLevel),
      responseSpeed: {
        averageSeconds: answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0,
        level: totalTime / answeredCount < 20 ? 'fast' : 'slow'
      },
      stabilityScore: 0.75
    },
    learningPlan: {
      planPeriod: new Date().toISOString().slice(0, 7),
      monthlyGoals: generateMonthlyGoals(cefrLevel, weakPoints),
      abilityInfo: {
        currentCefr: cefrLevel,
        targetCefr: getNextLevel(cefrLevel),
        estimatedMonthsToTarget: getMonthsToTarget(cefrLevel),
        recommendedHoursPerWeek: getRecommendedHours(cefrLevel)
      }
    }
  };
  
  return report;
}

// 词汇量估算
function getVocabularyEstimate(cefr: string): number {
  const estimates: Record<string, number> = {
    'B2': 3500,
    'B1': 2750,
    'A2': 1800,
    'A1': 1200,
    'Pre-A1': 600
  };
  return estimates[cefr] || 1800;
}

// 获取下一级别
function getNextLevel(cefr: string): string {
  const levels: Record<string, string> = {
    'Pre-A1': 'A1',
    'A1': 'A2',
    'A2': 'B1',
    'B1': 'B2',
    'B2': 'C1'
  };
  return levels[cefr] || 'B1';
}

// 预估达到目标时间
function getMonthsToTarget(cefr: string): number {
  const months: Record<string, number> = {
    'Pre-A1': 4,
    'A1': 6,
    'A2': 8,
    'B1': 10,
    'B2': 12
  };
  return months[cefr] || 6;
}

// 推荐每周学习时长
function getRecommendedHours(cefr: string): number {
  if (cefr === 'Pre-A1' || cefr === 'A1') return 4;
  if (cefr === 'A2') return 5;
  if (cefr === 'B1') return 6;
  return 7;
}

// 生成月度目标
function generateMonthlyGoals(cefr: string, weakPoints: WeakPoint[]): string[] {
  const goals: string[] = [];
  
  if (weakPoints.length > 0) {
    goals.push(`重点提升${weakPoints[0].tag}`);
  }
  
  if (cefr === 'Pre-A1' || cefr === 'A1') {
    goals.push('掌握26个字母发音');
    goals.push('积累100个基础词汇');
    goals.push('学习简单日常对话');
  } else if (cefr === 'A2') {
    goals.push('掌握基础语法时态');
    goals.push('阅读简单文章');
    goals.push('练习听力理解');
  } else {
    goals.push('提升阅读速度');
    goals.push('练习写作表达');
    goals.push('听力专项训练');
  }
  
  return goals;
}

// 计算CEFR等级
function calculateCEFR(accuracy: number): string {
  if (accuracy >= 0.85) return 'B2';
  if (accuracy >= 0.70) return 'B1';
  if (accuracy >= 0.55) return 'A2';
  if (accuracy >= 0.40) return 'A1';
  return 'Pre-A1';
}

// 获取CEFR颜色
function getCEFRColor(cefr: string): string {
  const colors: Record<string, string> = {
    'B2': '#10B981', // 绿色
    'B1': '#3B82F6', // 蓝色
    'A2': '#F59E0B', // 黄色
    'A1': '#F97316', // 橙色
    'Pre-A1': '#EF4444' // 红色
  };
  return colors[cefr] || '#6B7280';
}

// 计算分项分数
function calculateSkillScore(stats: { total: number; correct: number }): SkillScore {
  const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
  const score = Math.round(accuracy * 100);
  const cefr = calculateCEFR(accuracy);
  const cefrColor = getCEFRColor(cefr);
  
  const levelMap: Record<string, string> = {
    'B2': '优秀',
    'B1': '良好',
    'A2': '中等',
    'A1': '初级',
    'Pre-A1': '入门'
  };
  
  return {
    score,
    cefr,
    level: levelMap[cefr] || '未知'
  };
}

// 推荐服务
function recommendService(cefrLevel: string, weakCount: number): TestReport['recommendedService'] {
  if (cefrLevel === 'Pre-A1' || cefrLevel === 'A1') {
    return {
      type: 'offline',
      name: '线下小班启蒙课',
      description: '适合零基础，系统学习字母、音标和日常对话'
    };
  }
  
  if (cefrLevel === 'A2') {
    if (weakCount >= 2) {
      return {
        type: 'offline',
        name: '线下强化班',
        description: '老师面对面，针对薄弱项专项突破'
      };
    }
    return {
      type: 'online',
      name: '线上系统课',
      description: '灵活高效，巩固A2知识点'
    };
  }
  
  if (cefrLevel === 'B1') {
    return {
      type: 'self_study',
      name: '自学+冲刺班',
      description: '自主练习为主，考前冲刺强化'
    };
  }
  
  return {
    type: 'online',
    name: 'VIP定制课',
    description: '针对B2+，个性化提升方案'
  };
}

// 数组乱序
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 获取会话
export function getSession(sessionId: string): TestSession | undefined {
  return sessions.get(sessionId);
}

// 获取报告
export function getReport(sessionId: string): TestReport | undefined {
  const session = sessions.get(sessionId);
  return session?.report;
}

// 检查会话是否超时（15分钟）
export function isSessionExpired(session: TestSession): boolean {
  const elapsed = Date.now() - session.startedAt;
  return elapsed > 15 * 60 * 1000; // 15分钟
}

// 清理过期会话（每小时清理一次）
setInterval(() => {
  const now = Date.now();
  const expireTime = 30 * 60 * 1000; // 30分钟
  sessions.forEach((session, id) => {
    if (now - session.startedAt > expireTime && session.status === 'in_progress') {
      session.status = 'expired';
    }
  });
}, 60 * 60 * 1000);
