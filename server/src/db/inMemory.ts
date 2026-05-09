/**
 * 内存数据存储 - 用于存储导入的题目数据
 * 在生产环境中应替换为 PostgreSQL 数据库查询
 */

// 题目数据
export interface Question {
  id: string;
  exam_type: string;
  level: string;
  part: number;
  question_type: string;
  instruction: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  notices?: Notice[];
  knowledge_points?: KnowledgePoint[];
  created_at: Date;
}

export interface Notice {
  id: string;
  question_id: string;
  notice_id: string;
  text: string;
  image?: string;
}

export interface KnowledgePoint {
  id: string;
  question_id: string;
  tag: string;
  prepare_level?: string;
  prepare_unit?: string;
  prepare_section?: string;
  prepare_page?: number;
}

export interface PrepareReference {
  level: string;
  unit: string;
  section: string;
  page: number;
}

// 内存存储
const questions: Map<string, Question> = new Map();
const notices: Map<string, Notice[]> = new Map();
const knowledgePoints: Map<string, KnowledgePoint[]> = new Map();

export const questionStore = {
  // 添加题目
  addQuestion(question: Question): void {
    questions.set(question.id, question);
  },

  // 获取所有题目
  getAllQuestions(): Question[] {
    return Array.from(questions.values());
  },

  // 按考试类型和部分获取题目
  getQuestionsByExam(examType: string, part?: number): Question[] {
    return Array.from(questions.values()).filter(q => {
      if (q.exam_type.toLowerCase() !== examType.toLowerCase()) return false;
      if (part !== undefined && q.part !== part) return false;
      return true;
    });
  },

  // 获取题目的通知
  getNotices(questionId: string): Notice[] {
    return notices.get(questionId) || [];
  },

  // 添加通知
  addNotices(questionId: string, questionNotices: Notice[]): void {
    notices.set(questionId, questionNotices);
  },

  // 获取题目的知识点
  getKnowledgePoints(questionId: string): KnowledgePoint[] {
    return knowledgePoints.get(questionId) || [];
  },

  // 添加知识点
  addKnowledgePoints(questionId: string, points: KnowledgePoint[]): void {
    knowledgePoints.set(questionId, points);
  },

  // 按ID获取题目
  getQuestionById(id: string): Question | undefined {
    return questions.get(id);
  },

  // 清空所有数据
  clear(): void {
    questions.clear();
    notices.clear();
    knowledgePoints.clear();
  },

  // 获取统计数据
  getStats(): { totalQuestions: number; totalNotices: number; totalKnowledgePoints: number } {
    let totalNotices = 0;
    let totalKnowledgePoints = 0;
    notices.forEach(n => totalNotices += n.length);
    knowledgePoints.forEach(kp => totalKnowledgePoints += kp.length);
    return {
      totalQuestions: questions.size,
      totalNotices,
      totalKnowledgePoints
    };
  }
};

export default questionStore;
