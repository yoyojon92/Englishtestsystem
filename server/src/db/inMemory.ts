/**
 * 内存数据存储 - 用于存储导入的题目数据
 * 在生产环境中应替换为 PostgreSQL 数据库查询
 */

// 题目数据
export interface Question {
  id: string;
  exam_type: string;
  skill?: string;
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

export interface ExamSet {
  set_id: string;
  exam_type: string;
  skill: string;
  part: number;
  test_number: number;
  level: string;
  instruction: string;
  total_questions: number;
  questions: Question[];
  created_at: Date;
}

// 内存存储
const questions = new Map<string, Question>();
const examSets = new Map<string, ExamSet>();
const notices = new Map<string, Notice[]>();
const knowledgePoints = new Map<string, KnowledgePoint[]>();
const prepareReferences = new Map<string, PrepareReference[]>();
const questionNotices = new Map<string, Notice[]>();

/**
 * 题目存储操作
 */
const questionStore = {
  // 添加单个题目
  addQuestion(question: Question): void {
    questions.set(question.id, question);
  },

  // 获取单个题目
  getQuestion(id: string): Question | undefined {
    return questions.get(id);
  },

  // 获取所有题目
  getAllQuestions(): Question[] {
    return Array.from(questions.values());
  },

  // 按考试类型和部分获取题目
  getQuestionsByExam(examType: string, part?: number): Question[] {
    return Array.from(questions.values()).filter(q => {
      if (q.exam_type !== examType) return false;
      if (part !== undefined && q.part !== part) return false;
      return true;
    });
  },

  // 添加试卷
  addExamSet(set: ExamSet): void {
    examSets.set(set.set_id, set);
  },

  // 获取试卷列表
  getExamSets(examType?: string): ExamSet[] {
    const allSets = Array.from(examSets.values());
    if (examType) {
      return allSets.filter(s => s.exam_type === examType);
    }
    return allSets;
  },

  // 按试卷获取题目
  getQuestionsBySet(setId: string): Question[] {
    const set = examSets.get(setId);
    if (!set) return [];
    return set.questions;
  },

  // 添加通知
  addNotice(questionId: string, noticeList: Notice[]): void {
    notices.set(questionId, noticeList);
  },

  // 获取通知
  getNotices(questionId: string): Notice[] {
    return notices.get(questionId) || [];
  },

  // 添加单个知识点
  addKnowledgePoint(questionId: string, point: KnowledgePoint): void {
    const existing = knowledgePoints.get(questionId) || [];
    existing.push(point);
    knowledgePoints.set(questionId, existing);
  },

  // 添加多个知识点
  addKnowledgePoints(questionId: string, points: KnowledgePoint[]): void {
    const existing = knowledgePoints.get(questionId) || [];
    knowledgePoints.set(questionId, [...existing, ...points]);
  },

  // 获取知识点
  getKnowledgePoints(questionId: string): KnowledgePoint[] {
    return knowledgePoints.get(questionId) || [];
  },

  // 获取快速测试题目（随机抽取指定数量）
  getQuickTestQuestions(count: number = 5): Question[] {
    const allQuestions = Array.from(questions.values());
    // 随机打乱
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    return allQuestions.slice(0, Math.min(count, allQuestions.length));
  },

  // 清空所有数据
  clear(): void {
    questions.clear();
    notices.clear();
    knowledgePoints.clear();
    examSets.clear();
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

export { questions, knowledgePoints, prepareReferences, questionNotices, examSets };
export default questionStore;
