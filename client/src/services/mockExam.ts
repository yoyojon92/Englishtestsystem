/**
 * 模拟考试服务
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1';

/**
 * 获取模拟考试会话列表
 */
export async function getMockExamSessions(examType: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/sessions/${examType}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  
  return response.json();
}

/**
 * 开始模拟考试
 */
export async function startMockExam(sessionId: string, childId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, childId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to start exam');
  }
  
  return response.json();
}

/**
 * 提交模拟考试答案
 */
export async function submitMockExamAnswer(examId: string, data: {
  questionId: string;
  userAnswer: string | string[];
  timeSpentSec?: number;
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/${examId}/answer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit answer');
  }
  
  return response.json();
}

/**
 * 完成模拟考试
 */
export async function finishMockExam(examId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/${examId}/finish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to finish exam');
  }
  
  return response.json();
}

/**
 * 获取模拟考试成绩报告
 */
export async function getMockExamReport(examId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/${examId}/report`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch report');
  }
  
  return response.json();
}

/**
 * 获取模拟考试历史
 */
export async function getMockExamHistory(childId: string, examType?: string) {
  const token = await AsyncStorage.getItem('token');
  const url = examType 
    ? `${API_BASE}/mock-exam/history/${childId}?examType=${examType}`
    : `${API_BASE}/mock-exam/history/${childId}`;
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  
  return response.json();
}

/**
 * 获取冲刺包信息
 */
export async function getCrashPackage(examType: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/crash-package/${examType}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch crash package');
  }
  
  return response.json();
}

/**
 * 购买冲刺包
 */
export async function purchaseCrashPackage(data: {
  childId: string;
  examType: string;
  packageType: 'basic' | 'vip';
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/crash-package/purchase`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to purchase crash package');
  }
  
  return response.json();
}

/**
 * 获取口语考试状态
 */
export async function getSpeakingExamStatus(examId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/speaking/${examId}/status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch speaking status');
  }
  
  return response.json();
}

/**
 * 提交口语答案
 */
export async function submitSpeakingAnswer(examId: string, data: {
  audioUrl: string;
  duration: number;
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/mock-exam/speaking/${examId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit speaking answer');
  }
  
  return response.json();
}

/**
 * 模拟考试数据类型
 */
export interface MockExamSession {
  sessionId: string;
  examType: string;
  title: string;
  description: string;
  duration: number;
  questions: number;
  sections: {
    name: string;
    type: 'reading' | 'writing' | 'listening' | 'speaking';
    duration: number;
    questions: number;
  }[];
  available: boolean;
  attemptsUsed: number;
  attemptsTotal: number;
  isPurchased: boolean;
}

export interface MockExam {
  examId: string;
  sessionId: string;
  childId: string;
  examType: string;
  status: 'in_progress' | 'completed' | 'expired';
  startedAt: string;
  answers: Record<string, MockExamAnswer>;
  currentSection?: string;
  currentQuestion?: number;
  timeRemaining?: number;
}

export interface MockExamAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect?: boolean;
  timeSpentSec?: number;
  submittedAt?: string;
}

export interface MockExamReport {
  reportId: string;
  examId: string;
  examType: string;
  examDate: string;
  totalScore: number;
  totalMax: number;
  predictedGrade: string;
  passConfidencePct: number;
  isPassReady: boolean;
  sections: {
    name: string;
    type: string;
    score: number;
    max: number;
    percentage: number;
    correctRate: number;
  }[];
  timeAnalysis: Record<string, number>;
  detailedAnalysis: {
    strongPoints: string[];
    weakPoints: string[];
    improvementSuggestions: string[];
  };
  comparedToLast: {
    totalScore: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
  };
  nextRecommendedExam?: string;
}

export interface CrashPackage {
  packageId: string;
  examType: string;
  packageType: 'basic' | 'vip';
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  includes: {
    mockExams: number;
    practiceHours: number;
    speakingReviews: number;
    tutorials: string[];
  };
  validDays: number;
  purchased: boolean;
  remainingQuota?: number;
  validUntil?: string;
}
