// CEFR 评估服务
// 用于获取用户的 CEFR 等级评估历史

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export interface CefrAssessment {
  id: string;
  phone: string;
  cefrLevel: string;
  score: number;
  skillScores: Record<string, number>;
  weakPoints: string[];
  recommendations: string[];
  createdAt: number;
}

/**
 * 获取用户最新的 CEFR 评估
 */
export async function getLatestCefrAssessment(phone: string): Promise<CefrAssessment | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/diagnosis/latest?phone=${encodeURIComponent(phone)}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to get latest CEFR assessment:', error);
    return null;
  }
}

/**
 * 获取用户所有 CEFR 评估历史
 */
export async function getCefrAssessments(phone: string): Promise<CefrAssessment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/diagnosis/history?phone=${encodeURIComponent(phone)}`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to get CEFR assessments:', error);
    return [];
  }
}
