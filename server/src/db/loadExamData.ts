/**
 * 加载考试数据到内存
 * 数据格式与 PostgreSQL 表结构一致
 */

import * as fs from 'fs';
import * as path from 'path';
import { questions, questionNotices, knowledgePoints, prepareReferences } from './inMemory.js';
import type { Question, Notice, KnowledgePoint } from './inMemory.js';

interface ExamQuestion {
  id: string;
  type: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: string;
  knowledge_points?: any[];
  notices?: any[];
  image?: string;
  options?: string[];
}

interface ExamSet {
  exam: string;
  exam_type: string;
  level: string;
  test_number?: number;
  skill?: string;
  part: number;
  instruction: string;
  notices?: any[];
  questions: ExamQuestion[];
}

export function loadExamFromFile(jsonPath: string): number {
  try {
    if (!fs.existsSync(jsonPath)) {
      console.log(`File not found: ${jsonPath}`);
      return 0;
    }

    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data: ExamSet = JSON.parse(content);

    // 提取考试信息
    const examType = data.exam_type || data.exam?.split(' ')[0] || 'KET';
    const level = data.level || (examType === 'PET' ? 'B1' : 'A2');
    const skill = data.skill || extractSkill(data.exam);
    const part = data.part || 1;
    const testNum = data.test_number || extractTestNumber(data.exam);
    const setId = `${examType}_${skill}_Part${part}_Test${testNum}`;

    // 收集所有 notices 到共享池（用于 match_notice 类型）
    const sharedNotices: Notice[] = [];
    if (data.notices && Array.isArray(data.notices)) {
      for (const n of data.notices) {
        sharedNotices.push({
          id: `${setId}_${n.id}`,
          question_id: setId, // 标记为共享
          notice_id: n.id,
          text: n.text,
          image: n.image
        });
      }
    }

    // 处理题目
    let count = 0;
    if (data.questions && Array.isArray(data.questions)) {
      for (const q of data.questions) {
        const questionId = `${setId}_q${count + 1}`;

        // 构建选项（如果有 notices 则用于匹配）
        let options: string[] = [];
        if (q.notices && Array.isArray(q.notices)) {
          options = q.notices.map((n: any) => `${n.id}. ${n.text}`);
        } else if (data.notices && data.notices.length > 0) {
          // 使用共享 notices 作为选项
          options = sharedNotices.map(n => `${n.notice_id}. ${n.text}`);
        } else if (q.options) {
          options = q.options;
        }

        // 创建题目记录
        const question: Question = {
          id: questionId,
          exam_type: examType,
          level,
          part,
          question_type: q.type || 'multiple_choice',
          instruction: data.instruction || '',
          question_text: q.question || '',
          correct_answer: q.answer || '',
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          notices: [],
          knowledge_points: [],
          created_at: new Date()
        };

        // 添加到 store
        questions.set(question.id, question);

        // 处理 notices（每道题关联的 notices）
        if (q.notices && Array.isArray(q.notices)) {
          const qNotices: any[] = q.notices.map((n: any) => ({
            id: `${questionId}_${n.id}`,
            question_id: questionId,
            notice_id: n.id,
            text: n.text,
            image: n.image
          }));
          questionNotices.set(questionId, qNotices);
        } else if (sharedNotices.length > 0) {
          // 对于 match_notice 类型题，关联所有共享 notices
          questionNotices.set(questionId, sharedNotices);
        }

        // 处理知识点
        if (q.knowledge_points && Array.isArray(q.knowledge_points)) {
          const kps: KnowledgePoint[] = [];
          for (const kp of q.knowledge_points) {
            const kpRecord: KnowledgePoint = {
              id: `kp-${questionId}-${count}`,
              question_id: questionId,
              tag: kp.tag || kp.name || '',
              prepare_level: kp.prepare_reference?.level || '',
              prepare_unit: kp.prepare_reference?.unit || '',
              prepare_section: kp.prepare_reference?.section || '',
              prepare_page: kp.prepare_reference?.page || undefined
            };
            kps.push(kpRecord);
          }
          knowledgePoints.set(questionId, kps);
        }

        count++;
      }
    }

    console.log(`Loaded ${count} questions from ${jsonPath}`);
    return count;
  } catch (error) {
    console.error('Error loading exam:', error);
    return 0;
  }
}

export function loadExamsFromDirectory(dirPath: string): number {
  let total = 0;
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return 0;
  }

  const files = fs.readdirSync(dirPath);
  console.log(`Scanning directory: ${dirPath} (${files.length} files)`);
  for (const file of files) {
    console.log(`  Found file: ${file}`);
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      total += loadExamFromFile(filePath);
    }
  }
  return total;
}

export function loadAllExams(): number {
  const ketPath = path.join(process.cwd(), 'src/db/questions/ket');
  const petPath = path.join(process.cwd(), 'src/db/questions/pet');

  let total = 0;
  total += loadExamsFromDirectory(ketPath);
  total += loadExamsFromDirectory(petPath);

  console.log(`Total loaded: ${total} questions`);
  return total;
}

// 辅助函数
function extractSkill(exam: string): string {
  if (!exam) return 'Reading';
  const lower = exam.toLowerCase();
  if (lower.includes('reading')) return 'Reading';
  if (lower.includes('writing')) return 'Writing';
  if (lower.includes('listening')) return 'Listening';
  if (lower.includes('speaking')) return 'Speaking';
  return 'Reading';
}

function extractTestNumber(exam: string): number {
  if (!exam) return 1;
  const match = exam.match(/test\s*(\d+)/i);
  return match ? parseInt(match[1]) : 1;
}
