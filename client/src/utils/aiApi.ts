/**
 * AI 服务 API 客户端
 * 
 * 功能：
 * - 口语评测
 * - AI 对话会话
 * - 词汇量估算
 * - 考试通过率预测
 */

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

/**
 * 口语发音评测
 */
export async function evaluateSpeaking(params: {
  audioUri: string;
  text: string;
  category?: 'read_sentence' | 'read_word' | 'read_chapter';
  language?: 'en_us' | 'en_gb';
}): Promise<{
  success: boolean;
  data?: {
    total_score: number;
    sentence_score: number;
    words?: Array<{ word: string; score: number }>;
  };
  error?: string;
}> {
  try {
    // 读取音频文件并转换为 Base64
    const audioResponse = await fetch(params.audioUri);
    const audioBlob = await audioResponse.blob();
    const reader = new FileReader();
    
    const audioBase64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    }) as string;
    
    // 移除 data URL 前缀
    const base64Data = audioBase64.split(',')[1];
    
    const response = await fetch(`${API_BASE}/api/v1/ai/speaking-evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64Data,
        text: params.text,
        category: params.category || 'read_sentence',
        language: params.language || 'en_us',
      }),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Evaluation failed',
    };
  }
}

/**
 * KET/PET 口语考试评测
 */
export async function evaluateKetPetSpeaking(params: {
  audioUri: string;
  part: 1 | 2 | 3 | 4;
  question: string;
  expectedKeywords?: string[];
}): Promise<{
  success: boolean;
  data?: {
    score: number;
    accuracy: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
    interaction: number;
    feedback: string;
  };
  error?: string;
}> {
  try {
    const audioResponse = await fetch(params.audioUri);
    const audioBlob = await audioResponse.blob();
    const reader = new FileReader();
    
    const audioBase64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    }) as string;
    
    const base64Data = audioBase64.split(',')[1];
    
    const response = await fetch(`${API_BASE}/api/v1/ai/ket-pet-speaking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64Data,
        part: params.part,
        question: params.question,
        expectedKeywords: params.expectedKeywords,
      }),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Evaluation failed',
    };
  }
}

/**
 * 开始 AI 对话会话
 */
export async function startConversation(params: {
  childId: string;
  type: 'post_class' | 'exam_practice' | 'free_conversation';
  level: 'A1' | 'A2' | 'B1' | 'B2';
}): Promise<{
  success: boolean;
  data?: {
    sessionId: string;
    question: string;
    instructions: string;
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/ai/conversation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start conversation',
    };
  }
}

/**
 * 发送回复并获取反馈
 */
export async function sendConversationResponse(params: {
  sessionId: string;
  answer: string;
  isLast?: boolean;
}): Promise<{
  success: boolean;
  data?: {
    teacherResponse: string;
    scores: {
      accuracy: number;
      fluency: number;
      vocabulary: number;
      grammar: number;
      pronunciation: number;
      interaction: number;
      overall: number;
    };
    isComplete: boolean;
    report?: {
      summary: string;
      strengths: string[];
      areasForImprovement: string[];
      recommendations: string[];
      overallScore: number;
      cefrPrediction: string;
    };
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/ai/conversation/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send response',
    };
  }
}

/**
 * 获取对话报告
 */
export async function getConversationReport(sessionId: string): Promise<{
  success: boolean;
  data?: {
    sessionId: string;
    childId: string;
    type: string;
    level: string;
    totalQuestions: number;
    report: {
      summary: string;
      strengths: string[];
      areasForImprovement: string[];
      recommendations: string[];
      overallScore: number;
      cefrPrediction: string;
    };
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/ai/conversation/${sessionId}/report`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get report',
    };
  }
}

/**
 * 词汇量估算
 */
export async function estimateVocabulary(params: {
  correctCount: number;
  totalQuestions: number;
  knownWordRatio?: number;
}): Promise<{
  success: boolean;
  data?: {
    estimatedVocabulary: number;
    cefrLevel: string;
    accuracy: number;
    confidence: 'high' | 'medium' | 'low';
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/ai/vocabulary-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Estimation failed',
    };
  }
}

/**
 * 考试通过率预测
 */
export async function predictExamPass(params: {
  ability: number;
  examType: 'KET' | 'PET';
  mockExamHistory?: Array<{ score: number; maxScore: number }>;
}): Promise<{
  success: boolean;
  data?: {
    examType: string;
    currentAbility: number;
    prediction: {
      passRate: number;
      recommendation: 'recommend' | 'prepare' | 'not_ready';
      suggestedWeeks: number;
    };
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/ai/exam-predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Prediction failed',
    };
  }
}

export default {
  evaluateSpeaking,
  evaluateKetPetSpeaking,
  startConversation,
  sendConversationResponse,
  getConversationReport,
  estimateVocabulary,
  predictExamPass,
};
