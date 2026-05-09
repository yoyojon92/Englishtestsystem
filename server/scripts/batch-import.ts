/**
 * KET/PET 真题批量导入脚本
 * 支持从 JSON 文件批量导入真题到内存数据库
 * 
 * 使用方法：
 * cd server && npx tsx scripts/batch-import.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { questionStore } from '../db/inMemory';
import type { Question, KnowledgePoint, QuestionNotice, PrepareReference } from '../db/inMemory';

interface ExamQuestion {
  id: string;
  exam: string;
  level: string;
  part: number;
  instruction: string;
  notices?: Array<{ id: string; text: string; image?: string }>;
  questions: Array<{
    id: string;
    type: string;
    question: string;
    answer: string;
    explanation: string;
    difficulty: string;
    knowledge_points?: Array<{
      tag: string;
      prepare_reference?: {
        level: string;
        unit: string;
        section: string;
        page: number;
      };
    }>;
  }>;
}

// 题型映射
const typeMapping: Record<string, string> = {
  'match_notice': 'match_notice',
  'multiple_choice': 'multiple_choice',
  'fill_form': 'fill_form',
  'write_email': 'write_email',
  'reading_comprehension': 'reading_comprehension',
};

// 认知类型映射
const cognitiveTypeMapping: Record<string, string> = {
  'easy': 'understanding',
  'medium': 'application',
  'hard': 'analysis',
};

// 难度映射
const difficultyMapping: Record<string, string> = {
  'easy': 'easy',
  'medium': 'medium',
  'hard': 'hard',
};

/**
 * 解析单个真题文件
 */
function parseExamFile(filePath: string): ExamQuestion | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ 解析文件失败: ${filePath}`, error);
    return null;
  }
}

/**
 * 转换题目格式
 */
function transformQuestion(
  exam: ExamQuestion,
  q: ExamQuestion['questions'][0],
  examSetId: string,
  index: number
): { question: Question; notices: QuestionNotice[]; knowledgePoints: KnowledgePoint[] } {
  const questionId = `${exam.level.toLowerCase()}_r${exam.part}_t${examSetId}_q${String(index + 1).padStart(2, '0')}`;
  
  // 创建题目
  const question: Question = {
    question_id: questionId,
    exam_type: exam.level === 'A2' ? 'KET' : 'PET',
    level: exam.level,
    skill: 'reading',
    part: exam.part,
    question_type: typeMapping[q.type] || 'multiple_choice',
    question_text: q.question,
    correct_answer: q.answer,
    explanation: q.explanation,
    difficulty: difficultyMapping[q.difficulty] || 'medium',
    cognitive_type: cognitiveTypeMapping[q.difficulty] || 'application',
    notices: [],
    knowledge_points: [],
    image_url: null,
    options: exam.notices?.map(n => ({ id: n.id, text: n.text, image_url: n.image })) || [],
    source: exam.exam,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // 创建通知/选项
  const notices: QuestionNotice[] = (exam.notices || []).map(n => ({
    notice_id: `${questionId}_${n.id}`,
    question_id: questionId,
    notice_id_in_question: n.id,
    text: n.text,
    image_url: n.image || null,
  }));

  // 创建知识点
  const knowledgePoints: KnowledgePoint[] = (q.knowledge_points || []).map((kp, kpIndex) => {
    const kpId = `${questionId}_kp${kpIndex + 1}`;
    const prepareRef: PrepareReference | null = kp.prepare_reference ? {
      level: kp.prepare_reference.level,
      unit: kp.prepare_reference.unit,
      section: kp.prepare_reference.section,
      page: kp.prepare_reference.page,
    } : null;

    return {
      point_id: kpId,
      point_name: kp.tag,
      cefr_level: exam.level,
      related_question_id: questionId,
      prepare_reference: prepareRef,
      mastery_level: null,
      created_at: new Date(),
    };
  });

  return { question, notices, knowledgePoints };
}

/**
 * 导入单个真题文件
 */
function importExamFile(filePath: string, examSetId: string): number {
  const exam = parseExamFile(filePath);
  if (!exam) return 0;

  const fileName = path.basename(filePath, '.json');
  const setRecord = {
    set_id: `${exam.level.toLowerCase()}_r${exam.part}_${examSetId}`,
    exam_type: exam.level === 'A2' ? 'KET' : 'PET',
    level: exam.level,
    skill: 'reading',
    part: exam.part,
    test_number: parseInt(examSetId.replace('t', '')) || 1,
    title: exam.exam,
    instruction: exam.instruction,
    total_questions: exam.questions.length,
    source: `真题集 - ${fileName}`,
    created_at: new Date(),
  };

  let questionCount = 0;
  const allNotices: QuestionNotice[] = [];
  const allKnowledgePoints: KnowledgePoint[] = [];

  exam.questions.forEach((q, index) => {
    const { question, notices, knowledgePoints } = transformQuestion(exam, q, examSetId, index);
    
    // 使用 questionStore 添加
    const examSets = questionStore.get('examSets') || [];
    const examSet = examSets.find((s: any) => s.set_id === setRecord.set_id);
    
    if (examSet) {
      examSet.questions.push(question.question_id);
    }
    
    question.notices = notices.map(n => n.notice_id);
    question.knowledge_points = knowledgePoints.map(kp => kp.point_id);
    
    allNotices.push(...notices);
    allKnowledgePoints.push(...knowledgePoints);
    questionCount++;
  });

  // 存储到 questionStore
  const store = questionStore.getStore();
  
  // 添加试卷
  const sets = store.examSets || [];
  if (!sets.find((s: any) => s.set_id === setRecord.set_id)) {
    sets.push(setRecord);
    store.examSets = sets;
  }

  // 添加题目
  exam.questions.forEach((q, index) => {
    const { question } = transformQuestion(exam, q, examSetId, index);
    store.questions.set(question.question_id, question);
  });

  // 添加通知
  allNotices.forEach(n => {
    store.questionNotices.set(n.notice_id, n);
  });

  // 添加知识点
  allKnowledgePoints.forEach(kp => {
    store.knowledgePoints.set(kp.point_id, kp);
  });

  return questionCount;
}

/**
 * 批量导入 KET/PET 真题
 */
async function batchImport() {
  console.log('🚀 开始批量导入 KET/PET 真题...\n');

  const questionsDir = path.join(__dirname, '../db/questions');
  let totalQuestions = 0;

  // 导入 KET 真题
  const ketDir = path.join(questionsDir, 'ket');
  if (fs.existsSync(ketDir)) {
    const ketFiles = fs.readdirSync(ketDir).filter(f => f.endsWith('.json'));
    console.log(`📚 KET 真题 (${ketFiles.length} 个文件):`);

    ketFiles.forEach((file, index) => {
      const filePath = path.join(ketDir, file);
      const testNumber = `t${index + 1}`;
      const count = importExamFile(filePath, testNumber);
      console.log(`   ✅ ${file}: ${count} 题`);
      totalQuestions += count;
    });
  }

  // 导入 PET 真题
  const petDir = path.join(questionsDir, 'pet');
  if (fs.existsSync(petDir)) {
    const petFiles = fs.readdirSync(petDir).filter(f => f.endsWith('.json'));
    console.log(`\n📚 PET 真题 (${petFiles.length} 个文件):`);

    petFiles.forEach((file, index) => {
      const filePath = path.join(petDir, file);
      const testNumber = `t${index + 1}`;
      const count = importExamFile(filePath, testNumber);
      console.log(`   ✅ ${file}: ${count} 题`);
      totalQuestions += count;
    });
  }

  console.log(`\n✨ 导入完成! 总计: ${totalQuestions} 道题目`);

  // 输出统计
  const store = questionStore.getStore();
  console.log(`\n📊 题库统计:`);
  console.log(`   - 试卷: ${store.examSets?.length || 0} 套`);
  console.log(`   - 题目: ${store.questions.size} 道`);
  console.log(`   - 知识点: ${store.knowledgePoints.size} 个`);
  console.log(`   - 通知/选项: ${store.questionNotices.size} 个`);
}

// 执行导入
batchImport().catch(console.error);
