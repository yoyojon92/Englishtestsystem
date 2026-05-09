/**
 * 备考计划服务
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1';

/**
 * 创建备考计划
 */
export async function createPrepPlan(data: {
  childId: string;
  examType: string;
  targetDate: string;
  currentLevel?: string;
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/prep-plan/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create prep plan');
  }
  
  return response.json();
}

/**
 * 获取备考计划
 */
export async function getPrepPlan(childId: string, examType?: string) {
  const token = await AsyncStorage.getItem('token');
  const url = examType 
    ? `${API_BASE}/prep-plan/${childId}?examType=${examType}`
    : `${API_BASE}/prep-plan/${childId}`;
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch prep plan');
  }
  
  return response.json();
}

/**
 * 获取今日任务
 */
export async function getTodayTasks(childId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/prep-plan/${childId}/today`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch today tasks');
  }
  
  return response.json();
}

/**
 * 获取备考进度统计
 */
export async function getPrepProgress(childId: string) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/prep-plan/${childId}/progress`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch prep progress');
  }
  
  return response.json();
}

/**
 * 更新任务进度
 */
export async function updateTaskProgress(planId: string, taskId: string, data: {
  completed?: boolean;
  completedHours?: number;
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/prep-plan/${planId}/task/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  
  return response.json();
}

/**
 * 更新里程碑状态
 */
export async function updateMilestone(planId: string, milestoneId: string, data: {
  completed: boolean;
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/prep-plan/${planId}/milestone/${milestoneId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update milestone');
  }
  
  return response.json();
}

/**
 * 调整备考计划
 */
export async function adjustPrepPlan(planId: string, data: {
  targetDate?: string;
  addTasks?: string[];
  removeTasks?: string[];
}) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE}/prep-plan/${planId}/adjust`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to adjust plan');
  }
  
  return response.json();
}

/**
 * 备考计划数据类型
 */
export interface PrepPlan {
  planId: string;
  childId: string;
  examType: string;
  targetDate: string;
  currentLevel: string;
  currentScore: number;
  targetScore: number;
  phase: 'foundation' | 'practice' | '冲刺' | '模拟';
  milestones: PrepMilestone[];
  weeklyTasks: WeeklyTask[];
  createdAt: string;
  updatedAt: string;
  progressPct: number;
}

export interface PrepMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface WeeklyTask {
  week: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Task {
  id: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mock_exam' | 'review';
  title: string;
  description: string;
  targetHours: number;
  completedHours: number;
  completed: boolean;
}

export interface TodayTasks {
  date: string;
  tasks: {
    id: string;
    type: string;
    title: string;
    description: string;
    targetHours: number;
    completedHours: number;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    progressPct: number;
    totalHours: number;
    completedHours: number;
  };
}

export interface PrepProgress {
  overview: {
    totalDays: number;
    passedDays: number;
    remainingDays: number;
    overallProgress: number;
    currentPhase: string;
  };
  skills: Record<string, { progress: number; target: number; current: number; daily: number }>;
  mockExams: {
    total: number;
    completed: number;
    averageScore: number;
    trend: number[];
    targetScore: number;
  };
  weakPoints: { skill: string; description: string }[];
  suggestions: string[];
}
