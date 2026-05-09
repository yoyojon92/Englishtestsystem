/**
 * AI 外教智能体服务
 * 
 * 功能：
 * - 课后 AI 评估对话
 * - KET/PET 口语考试模拟
 * - 实时口语练习与反馈
 * - 学习进度评估
 * 
 * 使用 DeepSeek/Kimi 等 LLM API
 */

import { v4 as uuidv4 } from 'uuid';

// LLM 配置
const LLM_CONFIG = {
  API_BASE_URL: process.env.LLM_API_BASE || 'https://api.deepseek.com',
  API_KEY: process.env.LLM_API_KEY || 'your_api_key',
  MODEL: process.env.LLM_MODEL || 'deepseek-chat',
};

// 会话状态
export interface ConversationSession {
  sessionId: string;
  childId: string;
  type: 'post_class' | 'exam_practice' | 'free_conversation';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  history: Message[];
  scores: SpeakingScore[];
  createdAt: Date;
  lastActivity: Date;
}

// 口语评分
interface SpeakingScore {
  question: string;
  answer: string;
  accuracy: number;      // 0-5
  fluency: number;       // 0-5
  vocabulary: number;    // 0-5
  grammar: number;       // 0-5
  pronunciation: number;  // 0-5
  interaction: number;   // 0-5
  timestamp: Date;
}

// 消息
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 课后评估问题模板
const POST_CLASS_QUESTIONS = {
  A1: [
    "What did you learn today?",
    "Can you tell me one new word you learned?",
    "Did you enjoy the class? What was your favorite part?",
  ],
  A2: [
    "What was the topic of today's lesson?",
    "Can you describe what you learned in a sentence?",
    "What was challenging for you today?",
    "How would you use what you learned in real life?",
  ],
  B1: [
    "Summarize the main points of today's lesson.",
    "What vocabulary or phrases did you find most useful?",
    "Describe a situation where you could use today's topic.",
    "What aspects do you want to practice more?",
  ],
  B2: [
    "Give your opinion on the topic you studied today.",
    "Compare this topic to something you already know.",
    "What was your most insightful learning today?",
    "How would you explain this topic to someone younger?",
  ],
};

// KET 口语考试题目模板
const KET_SPEAKING_TEMPLATE = {
  part1: {
    name: "Personal Introduction",
    duration: "5-6 minutes",
    questions: [
      "What's your name?",
      "Where do you live?",
      "How old are you?",
      "Do you have any hobbies?",
      "What's your favorite subject at school?",
    ],
  },
  part2: {
    name: "Picture Description",
    duration: "3-4 minutes",
    prompt: "Look at the pictures. Talk about them. Tell me about one of the pictures.",
  },
};

// PET 口语考试题目模板
const PET_SPEAKING_TEMPLATE = {
  part1: {
    name: "Interview",
    duration: "5-6 minutes",
    questions: [
      "Tell me about your hometown.",
      "What do you usually do at weekends?",
      "What's your favorite type of movie? Why?",
      "Tell me about a memorable trip you had.",
      "What are your plans for the future?",
    ],
  },
  part2: {
    name: "Photo Comparison",
    duration: "3-4 minutes",
    prompt: "Compare the photographs. Say what's happening in each one and say what's similar or different.",
  },
  part3: {
    name: "Collaborative Task",
    duration: "5-6 minutes",
    prompt: "We're going to talk about {topic}. First, let's look at the situation. What should we consider?",
  },
  part4: {
    name: "Discussion",
    duration: "5-6 minutes",
    prompt: "I'd like to discuss the topic from the last part more. Why do you think that's important? What are the advantages and disadvantages?",
  },
};

// AI 外教系统提示词
const TEACHER_SYSTEM_PROMPT = `You are a friendly and professional English teacher named Teacher Emma. You specialize in teaching children aged 6-15 and preparing students for Cambridge English exams (KET, PET, FCE).

Your characteristics:
- Patient, encouraging, and supportive
- Use simple language for lower levels, more complex for higher levels
- Give specific praise and gentle corrections
- Ask follow-up questions to engage students
- Focus on building confidence and conversational skills

Your teaching approach:
1. Start with a warm greeting
2. Ask questions appropriate to the student's level
3. Provide immediate, constructive feedback
4. Encourage attempts even when errors occur
5. End with positive reinforcement and homework suggestions

Scoring criteria (for KET/PET):
- Accuracy (0-5): Grammar and vocabulary correctness
- Fluency (0-5): Natural flow and pacing
- Vocabulary (0-5): Range and appropriateness
- Grammar (0-5): Sentence structure and tense usage
- Pronunciation (0-5): Clarity and intonation
- Interaction (0-5): Response quality and conversation skills

Always keep responses concise and age-appropriate.`;

/**
 * 创建新的对话会话
 */
export function createConversationSession(params: {
  childId: string;
  type: 'post_class' | 'exam_practice' | 'free_conversation';
  level: 'A1' | 'A2' | 'B1' | 'B2';
}): ConversationSession {
  const session: ConversationSession = {
    sessionId: uuidv4(),
    childId: params.childId,
    type: params.type,
    level: params.level,
    history: [
      { role: 'system', content: TEACHER_SYSTEM_PROMPT },
    ],
    scores: [],
    createdAt: new Date(),
    lastActivity: new Date(),
  };
  
  return session;
}

/**
 * 生成课后评估问题
 */
export function generatePostClassQuestions(level: 'A1' | 'A2' | 'B1' | 'B2'): string[] {
  return POST_CLASS_QUESTIONS[level] || POST_CLASS_QUESTIONS.A1;
}

/**
 * 生成 KET/PET 口语考试问题
 */
export function generateExamQuestion(
  examType: 'KET' | 'PET',
  part: 1 | 2 | 3 | 4,
  context?: Record<string, string>
): { question: string; instructions: string; time: string } {
  if (examType === 'KET') {
    if (part === 1) {
      return {
        question: KET_SPEAKING_TEMPLATE.part1.questions[Math.floor(Math.random() * 5)],
        instructions: "Answer the examiner's questions. Speak clearly.",
        time: "5-6 minutes",
      };
    } else {
      return {
        question: KET_SPEAKING_TEMPLATE.part2.prompt,
        instructions: "Look at the pictures. Describe one picture in detail. Tell me why you chose it.",
        time: "3-4 minutes",
      };
    }
  } else {
    // PET
    switch (part) {
      case 1:
        return {
          question: PET_SPEAKING_TEMPLATE.part1.questions[Math.floor(Math.random() * 5)],
          instructions: "Answer the examiner's questions. Give detailed responses.",
          time: "5-6 minutes",
        };
      case 2:
        return {
          question: PET_SPEAKING_TEMPLATE.part2.prompt,
          instructions: "Compare the two photographs. Say what's happening in each one and explain the differences.",
          time: "3-4 minutes",
        };
      case 3:
        return {
          question: PET_SPEAKING_TEMPLATE.part3.prompt.replace('{topic}', context?.topic || 'making plans'),
          instructions: "Discuss with the examiner. Make decisions together and explain your reasons.",
          time: "5-6 minutes",
        };
      case 4:
        return {
          question: PET_SPEAKING_TEMPLATE.part4.prompt,
          instructions: "Discuss the topic in more detail. Give opinions and justify them.",
          time: "5-6 minutes",
        };
      default:
        return {
          question: "What do you think about this topic?",
          instructions: "Share your thoughts.",
          time: "2-3 minutes",
        };
    }
  }
}

/**
 * 调用 LLM 生成回复
 */
async function callLLM(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${LLM_CONFIG.API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_CONFIG.MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }
    
    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('LLM call failed:', error);
    // 返回默认回复作为降级
    return "I'm having trouble connecting. Let's try that again! Can you repeat what you said?";
  }
}

/**
 * 处理学生回答并生成反馈
 */
export async function processStudentResponse(
  session: ConversationSession,
  studentAnswer: string
): Promise<{
  teacherResponse: string;
  scores: SpeakingScore;
  isComplete: boolean;
}> {
  // 添加学生回答到历史
  session.history.push({ role: 'user', content: studentAnswer });
  session.lastActivity = new Date();
  
  // 调用 LLM 生成回复
  const teacherResponse = await callLLM(session.history);
  
  // 添加老师回复到历史
  session.history.push({ role: 'assistant', content: teacherResponse });
  
  // 生成评分（实际产品中应该基于更复杂的分析）
  const scores = generateSpeakingScores(studentAnswer, session.level);
  session.scores.push(scores);
  
  // 检查是否完成（达到一定轮次或评分稳定）
  const isComplete = session.scores.length >= 5 || 
    (session.scores.length >= 3 && calculateAverageScore(scores) >= 4);
  
  return {
    teacherResponse,
    scores,
    isComplete,
  };
}

/**
 * 生成口语评分
 */
function generateSpeakingScores(answer: string, level: 'A1' | 'A2' | 'B1' | 'B2'): SpeakingScore {
  // 简化版评分逻辑，实际产品中应该结合讯飞 API 和 LLM 分析
  const baseScores = {
    A1: { accuracy: 2.5, fluency: 2.5, vocabulary: 2, grammar: 2, pronunciation: 3, interaction: 2.5 },
    A2: { accuracy: 3, fluency: 3, vocabulary: 3, grammar: 2.5, pronunciation: 3, interaction: 3 },
    B1: { accuracy: 3.5, fluency: 3.5, vocabulary: 3.5, grammar: 3, pronunciation: 3.5, interaction: 3.5 },
    B2: { accuracy: 4, fluency: 4, vocabulary: 4, grammar: 4, pronunciation: 4, interaction: 4 },
  };
  
  const base = baseScores[level];
  // 添加一些随机变化模拟真实评分
  const variance = () => (Math.random() - 0.5) * 0.5;
  
  return {
    question: '',
    answer,
    accuracy: Math.min(5, Math.max(0, base.accuracy + variance())),
    fluency: Math.min(5, Math.max(0, base.fluency + variance())),
    vocabulary: Math.min(5, Math.max(0, base.vocabulary + variance())),
    grammar: Math.min(5, Math.max(0, base.grammar + variance())),
    pronunciation: Math.min(5, Math.max(0, base.pronunciation + variance())),
    interaction: Math.min(5, Math.max(0, base.interaction + variance())),
    timestamp: new Date(),
  };
}

/**
 * 计算平均分数
 */
function calculateAverageScore(scores: SpeakingScore): number {
  return (
    scores.accuracy +
    scores.fluency +
    scores.vocabulary +
    scores.grammar +
    scores.pronunciation +
    scores.interaction
  ) / 6;
}

/**
 * 生成课后评估报告
 */
export async function generatePostClassReport(
  session: ConversationSession
): Promise<{
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  overallScore: number;
  cefrPrediction: string;
}> {
  if (session.scores.length === 0) {
    throw new Error('No scores available');
  }
  
  // 计算平均分数
  const avgScores = {
    accuracy: 0,
    fluency: 0,
    vocabulary: 0,
    grammar: 0,
    pronunciation: 0,
    interaction: 0,
  };
  
  session.scores.forEach(s => {
    avgScores.accuracy += s.accuracy;
    avgScores.fluency += s.fluency;
    avgScores.vocabulary += s.vocabulary;
    avgScores.grammar += s.grammar;
    avgScores.pronunciation += s.pronunciation;
    avgScores.interaction += s.interaction;
  });
  
  const count = session.scores.length;
  Object.keys(avgScores).forEach(k => {
    avgScores[k as keyof typeof avgScores] /= count;
  });
  
  const overallScore = Object.values(avgScores).reduce((a, b) => a + b, 0) / 6;
  
  // 生成报告
  const report = {
    summary: generateSummary(avgScores, session.level),
    strengths: identifyStrengths(avgScores),
    areasForImprovement: identifyWeaknesses(avgScores),
    recommendations: generateRecommendations(avgScores, session.level),
    overallScore: Math.round(overallScore * 10) / 10,
    cefrPrediction: predictCEFR(overallScore, session.level),
  };
  
  return report;
}

/**
 * 生成评估摘要
 */
function generateSummary(scores: Record<string, number>, currentLevel: string): string {
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
  
  if (avg >= 4) {
    return `Excellent performance! The student demonstrated strong ${currentLevel}-level English skills with clear pronunciation and good conversational ability.`;
  } else if (avg >= 3) {
    return `Good progress! The student shows solid ${currentLevel} comprehension with room for improvement in some areas.`;
  } else if (avg >= 2) {
    return `The student is working at ${currentLevel} level. Consistent practice will help build confidence and fluency.`;
  } else {
    return `The student is at the beginning of their ${currentLevel} journey. Focus on basic vocabulary and simple sentence structures.`;
  }
}

/**
 * 识别优势
 */
function identifyStrengths(scores: Record<string, number>): string[] {
  const strengths: string[] = [];
  
  if (scores.pronunciation >= 3.5) {
    strengths.push('Clear and understandable pronunciation');
  }
  if (scores.fluency >= 3.5) {
    strengths.push('Good speaking pace and flow');
  }
  if (scores.vocabulary >= 3.5) {
    strengths.push('Good vocabulary range for level');
  }
  if (scores.interaction >= 3.5) {
    strengths.push('Responds well to questions');
  }
  if (scores.grammar >= 3.5) {
    strengths.push('Accurate basic grammar usage');
  }
  
  return strengths.length > 0 ? strengths : ['Shows enthusiasm and willingness to communicate'];
}

/**
 * 识别需要改进的方面
 */
function identifyWeaknesses(scores: Record<string, number>): string[] {
  const weaknesses: string[] = [];
  
  if (scores.pronunciation < 2.5) {
    weaknesses.push('Practice individual sounds and word stress');
  }
  if (scores.fluency < 2.5) {
    weaknesses.push('Work on reducing pauses and hesitations');
  }
  if (scores.vocabulary < 2.5) {
    weaknesses.push('Expand topic-related vocabulary');
  }
  if (scores.grammar < 2.5) {
    weaknesses.push('Focus on basic sentence patterns');
  }
  if (scores.interaction < 2.5) {
    weaknesses.push('Practice giving longer, more detailed responses');
  }
  
  return weaknesses.length > 0 ? weaknesses : [];
}

/**
 * 生成建议
 */
function generateRecommendations(scores: Record<string, number>, currentLevel: string): string[] {
  const recommendations: string[] = [];
  
  if (scores.pronunciation < 3) {
    recommendations.push('Listen to native speakers and repeat after them daily');
  }
  if (scores.fluency < 3) {
    recommendations.push('Practice speaking for 2 minutes on any topic without stopping');
  }
  if (scores.vocabulary < 3) {
    recommendations.push('Learn 5 new words each day and use them in sentences');
  }
  if (scores.grammar < 3) {
    recommendations.push('Review present simple and past tense structures');
  }
  
  recommendations.push(`Continue with ${currentLevel} level exercises to build confidence`);
  recommendations.push('Try to speak in English for at least 15 minutes daily');
  
  return recommendations;
}

/**
 * 预测 CEFR 等级
 */
function predictCEFR(score: number, currentLevel: string): string {
  const scoreMap: Record<string, { min: number; cefr: string }> = {
    'A1': { min: 0, cefr: 'A1' },
    'A2': { min: 2.5, cefr: 'A2' },
    'B1': { min: 3.5, cefr: 'B1' },
    'B2': { min: 4.5, cefr: 'B2' },
  };
  
  const levels = ['A1', 'A2', 'B1', 'B2'];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (score >= 4.5) {
    return currentIndex < 3 ? levels[currentIndex + 1] : 'B2+';
  }
  
  if (score >= 3.5) {
    return currentLevel;
  }
  
  if (score >= 2.5) {
    return currentIndex > 0 ? levels[currentIndex - 1] : 'Pre-A1';
  }
  
  return currentIndex > 0 ? levels[currentIndex - 1] : 'Pre-A1';
}

export default {
  createConversationSession,
  generatePostClassQuestions,
  generateExamQuestion,
  processStudentResponse,
  generatePostClassReport,
};
