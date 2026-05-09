/**
 * CEFR 评估服务
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1';

/**
 * 获取CEFR评估历史
 */
export async function getCefrAssessments(childId: string, limit = 10) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/cefr/assessments/${childId}?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch assessments');
  }
  
  return response.json();
}

/**
 * 获取最新CEFR评估
 */
export async function getLatestCefrAssessment(childId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/cefr/assessments/${childId}/latest`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch latest assessment');
  }
  
  return response.json();
}

/**
 * 创建新的CEFR评估
 */
export async function createCefrAssessment(childId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/cefr/assessments/${childId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to create assessment');
  }
  
  return response.json();
}

/**
 * 获取CEFR进步趋势
 */
export async function getCefrProgress(childId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/cefr/progress/${childId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch progress');
  }
  
  return response.json();
}

/**
 * 获取考试就绪评估
 */
export async function getExamReadiness(childId: string, examType?: string) {
  const token = await AsyncStorage.getItem('token');
  const url = examType 
    ? `${API_BASE}/cefr/readiness/${childId}?examType=${examType}`
    : `${API_BASE}/cefr/readiness/${childId}`;
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch readiness');
  }
  
  return response.json();
}

/**
 * 获取学习建议
 */
export async function getLearningRecommendations(childId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/cefr/recommendations/${childId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return response.json();
}

/**
 * 设置考试就绪提醒
 */
export async function setExamReadyNotification(childId: string, data: {
  examType: string;
  targetDate: string;
  channels?: string[];
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/cefr/notify-when-ready/${childId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to set notification');
  }
  
  return response.json();
}

/**
 * CEFR评估数据类型
 */
export interface CefrAssessment {
  assessId: string;
  childId: string;
  assessDate: string;
  cefrLevel: string;
  confidencePct: number;
  scores: {
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
    vocabulary: number;
    grammar: number;
  };
  comparedToLast: {
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
    overall: number;
  };
  recommendations: string[];
  examRecommendations: {
    examName: string;
    readiness: number;
    suggestion: string;
  }[];
  nextAssessDate: string;
}

export interface CefrProgress {
  timeline: {
    date: string;
    cefrLevel: string;
    overall: number;
  }[];
  skills: {
    reading: { date: string; score: number }[];
    listening: { date: string; score: number }[];
    speaking: { date: string; score: number }[];
    writing: { date: string; score: number }[];
  };
  cefrProgression: {
    startedAt: string;
    currentLevel: string;
    progression: { level: string; date: string; levelNumber: number }[];
    monthsToNextLevel: number;
    nextMilestone: number;
  };
}

export interface ExamReadiness {
  examType: string;
  cefrRequired: string;
  currentLevel: string;
  readiness: number;
  status: 'ready' | 'almost' | 'not_ready';
  gapAnalysis: Record<string, { current: number; target: number; gap: number }>;
  suggestions: string[];
  estimatedTimeToReady: string;
}
