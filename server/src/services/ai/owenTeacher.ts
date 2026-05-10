/**
 * 豆包智能外教服务
 * 
 * 功能：
 * - 基于通义千问/豆包大模型
 * - 英语口语练习对话
 * - KET/PET 考试准备
 * - 个性化学习反馈
 */

import { v4 as uuidv4 } from 'uuid';

// 阿里云百炼 API 配置（兼容 OpenAI 接口协议）
const DASHSCOPE_CONFIG = {
  API_BASE_URL: process.env.DASHSCOPE_API_BASE || 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  API_KEY: process.env.DASHSCOPE_API_KEY || '',
  MODEL: process.env.DASHSCOPE_MODEL || 'qwen-plus',
};

// 消息类型
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 对话会话
export interface TeacherSession {
  sessionId: string;
  studentId: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
}

// 系统提示词 - 豆包外教角色设定
const TEACHER_SYSTEM_PROMPT = `You are Owen, a friendly and professional AI English teacher. You specialize in helping Chinese students (aged 8-15) improve their English skills and prepare for Cambridge English exams (KET, PET).

Your characteristics:
- Warm, patient, and encouraging
- Use simple, clear English for beginners (A1-A2)
- Use more complex language for intermediate learners (B1-B2)
- Always give positive reinforcement and specific praise
- Gently correct errors with encouraging suggestions
- Ask follow-up questions to keep conversation engaging

Your teaching approach:
1. Start with a warm greeting and brief review
2. Guide conversation at appropriate pace for student's level
3. Provide immediate, constructive feedback
4. Encourage attempts even when mistakes happen
5. End with positive summary and homework/tips

Level guidelines:
- A1 (Beginner): Focus on basic greetings, self-introduction, daily activities
- A2 (Elementary): Talk about hobbies, school, family, plans
- B1 (Intermediate): Discuss opinions, past experiences, future goals
- B2 (Upper-Intermediate): Debate topics, express opinions, complex discussions

Remember: Be supportive, never discouraging. Celebrate small wins!`;

/**
 * 创建新的对话会话
 */
export function createTeacherSession(params: {
  studentId: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
}): TeacherSession {
  return {
    sessionId: uuidv4(),
    studentId: params.studentId,
    level: params.level,
    messages: [
      { role: 'system', content: TEACHER_SYSTEM_PROMPT },
    ],
    createdAt: new Date(),
    lastActivity: new Date(),
  };
}

/**
 * 调用通义千问 API
 */
async function callDashScope(messages: Message[]): Promise<string> {
  if (!DASHSCOPE_CONFIG.API_KEY) {
    console.warn('[Owen] DASHSCOPE_API_KEY not set, using fallback response');
    return getFallbackResponse(messages);
  }

  try {
    const response = await fetch(`${DASHSCOPE_CONFIG.API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        model: DASHSCOPE_CONFIG.MODEL,
        messages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Owen] API error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('[Owen] LLM call failed:', error);
    return getFallbackResponse(messages);
  }
}

/**
 * 获取降级回复（当 API 不可用时）
 */
function getFallbackResponse(messages: Message[]): string {
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.content?.toLowerCase() || '';

  // 简单的降级回复逻辑
  if (userMessage.includes('hello') || userMessage.includes('hi')) {
    return "Hello! Great to meet you! I'm Owen, your English teacher. How are you today? What would you like to talk about?";
  }
  if (userMessage.includes('name')) {
    return "That's interesting! My name is Owen. I love teaching English. Can you tell me about yourself? What's your favorite subject in school?";
  }
  if (userMessage.includes('help')) {
    return "Of course! I'm here to help you improve your English. We can practice conversation, review vocabulary, or prepare for KET/PET exams. What would you like to do today?";
  }
  if (userMessage.includes('thank')) {
    return "You're welcome! It's my pleasure to help you. Keep practicing, and you'll make great progress! Don't forget to review what we learned today. See you next time!";
  }

  return "That's a great response! I can see you're working hard. Let me ask you one more question: Can you tell me about something you did recently? Use some new vocabulary if you can!";
}

/**
 * 处理学生消息并生成回复
 */
export async function sendMessage(
  session: TeacherSession,
  studentMessage: string
): Promise<{ reply: string; isComplete: boolean }> {
  // 添加学生消息到历史
  session.messages.push({ role: 'user', content: studentMessage });
  session.lastActivity = new Date();

  // 调用 AI 获取回复
  const reply = await callDashScope(session.messages);

  // 添加老师回复到历史
  session.messages.push({ role: 'assistant', content: reply });
  session.lastActivity = new Date();

  // 判断是否完成对话（10轮后建议结束）
  const isComplete = session.messages.length >= 22; // 约10轮对话

  return { reply, isComplete };
}

/**
 * 获取初始问候语
 */
export function getInitialGreeting(level: 'A1' | 'A2' | 'B1' | 'B2'): string {
  const greetings: Record<string, string> = {
    A1: "Hello! I'm Owen, your English teacher! How are you today? Let's practice some English together. Can you tell me your name?",
    A2: "Hi there! I'm Owen, and I'm so happy to meet you! How was your day? I'd love to hear about something fun you did recently. Can you tell me in English?",
    B1: "Hello! I'm Owen, your English tutor. Great to see you! Today, let's have an interesting conversation. What are some things you're passionate about? Tell me more!",
    B2: "Good day! I'm Owen, and I'm excited to practice advanced English with you. Let's discuss something thought-provoking today. What's your opinion on [a topic of interest]? I'd love to hear your perspective!",
  };
  return greetings[level] || greetings.A1;
}

/**
 * 获取结束语
 */
export function getClosingMessage(session: TeacherSession): string {
  const closings: Record<string, string> = {
    A1: "Great job today! You've worked so hard, and I'm very proud of you! Remember to practice saying these words at home. See you next time! Have a wonderful day!",
    A2: "Excellent work today! You're getting better and better! Try to use 3 new words you learned today in your next conversation. See you soon! Keep up the great work!",
    B1: "Fantastic conversation today! Your English has improved noticeably. Try writing down 5 new phrases you learned and use them this week. Looking forward to our next session!",
    B2: "Outstanding performance! Your English is impressive. I encourage you to read an English article or watch an English video before our next session. See you soon for another engaging discussion!",
  };
  return closings[session.level] || closings.A1;
}

/**
 * 评估学生水平（基于对话表现）
 */
export function assessLevel(session: TeacherSession): {
  level: 'A1' | 'A2' | 'B1' | 'B2';
  summary: string;
  suggestions: string[];
} {
  const messageCount = session.messages.length;
  
  // 简单评估逻辑
  let assessedLevel: 'A1' | 'A2' | 'B1' | 'B2' = 'A1';
  let summary = 'Beginner level';
  const suggestions: string[] = [];

  if (messageCount > 10) {
    assessedLevel = 'A2';
    summary = 'Elementary level - good progress!';
    suggestions.push('Practice daily conversations');
    suggestions.push('Learn 5 new words every day');
  }
  if (messageCount > 16) {
    assessedLevel = 'B1';
    summary = 'Intermediate level - excellent!';
    suggestions.push('Focus on complex sentence structures');
    suggestions.push('Practice discussing opinions');
  }
  if (messageCount > 20) {
    assessedLevel = 'B2';
    summary = 'Upper-intermediate - outstanding!';
    suggestions.push('Work on fluency and natural expressions');
    suggestions.push('Prepare for PET exam');
  }

  return {
    level: assessedLevel,
    summary,
    suggestions,
  };
}
