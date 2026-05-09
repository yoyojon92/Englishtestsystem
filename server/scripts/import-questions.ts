#!/usr/bin/env npx tsx

/**
 * KET/PET 真题导入脚本
 * 用法: npx tsx scripts/import-questions.ts <json文件路径>
 * 示例: npx tsx scripts/import-questions.ts src/db/questions/ket/reading_part1_test1.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ============== 类型定义 ==============

interface Notice {
  id: string;
  text: string;
  image?: string;
}

interface KnowledgePoint {
  tag: string;
  prepare_reference?: {
    level?: string;
    unit?: string;
    section?: string;
    page?: number;
  };
}

interface Question {
  id: string;
  type: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty?: string;
  knowledge_points?: KnowledgePoint[];
}

interface ExamJson {
  exam: string;
  level: string;
  part: number;
  instruction?: string;
  notices?: Notice[];
  questions: Question[];
}

// ============== 模拟数据库（内存存储） ==============

interface DBQuestion {
  id: number;
  exam_type: string;
  part: number;
  question_type: string;
  instruction: string;
  content: string;
  options: any;
  answer: string;
  explanation: string;
  difficulty: number;
  cefr_level: string;
  source: string;
  metadata: any;
  created_at: Date;
}

interface DBKnowledgePoint {
  id: number;
  tag: string;
  category: string;
  cefr_level: string;
}

interface DBAttachment {
  id: number;
  question_id: number;
  attachment_type: string;
  identifier: string;
  content: string;
  order_index: number;
}

interface DBPrepareReference {
  id: number;
  question_id: number;
  knowledge_point_id: number;
  prepare_level: string;
  unit: string;
  section: string;
  page: number;
}

// 内存数据库
const db = {
  knowledge_points: [] as DBKnowledgePoint[],
  questions: [] as DBQuestion[],
  attachments: [] as DBAttachment[],
  prepare_references: [] as DBPrepareReference[],
  nextIds: {
    knowledge_point: 1,
    question: 1,
    attachment: 1,
    prepare_reference: 1
  }
};

// ============== 工具函数 ==============

function parseJsonFile(filePath: string): ExamJson {
  const fullPath = path.resolve(filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

function extractExamType(exam: string): string {
  if (exam.includes('KET')) return 'KET';
  if (exam.includes('PET')) return 'PET';
  if (exam.includes('FCE')) return 'FCE';
  if (exam.includes('YLE') || exam.includes('Starters') || exam.includes('Movers') || exam.includes('Flyers')) return 'YLE';
  return 'KET';
}

function parseQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'match_notice': 'match_notice',
    'choice': 'multiple_choice',
    'multiple_choice': 'multiple_choice',
    'fill_blank': 'fill_blank',
    'fill_in_blank': 'fill_blank',
    'true_false': 'true_false',
    'ordering': 'ordering',
    'listening': 'listening',
    'speaking': 'speaking'
  };
  return typeMap[type] || type;
}

function parseDifficulty(difficulty?: string): number {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    default: return 2;
  }
}

// ============== 数据导入函数 ==============

function importKnowledgePoint(tag: string, cefrLevel: string): number {
  // 检查是否已存在
  const existing = db.knowledge_points.find(kp => kp.tag === tag);
  if (existing) return existing.id;

  // 创建新知识点
  const id = db.nextIds.knowledge_point++;
  db.knowledge_points.push({
    id,
    tag,
    category: '词汇', // 默认分类
    cefr_level: cefrLevel
  });
  console.log(`  ✓ 新增知识点: ${tag}`);
  return id;
}

function importQuestion(data: ExamJson, question: Question): number {
  const questionId = db.nextIds.question++;
  
  // 导入题目
  const q: DBQuestion = {
    id: questionId,
    exam_type: extractExamType(data.exam),
    part: data.part,
    question_type: parseQuestionType(question.type),
    instruction: data.instruction || '',
    content: question.question,
    options: null,
    answer: question.answer,
    explanation: question.explanation || '',
    difficulty: parseDifficulty(question.difficulty),
    cefr_level: data.level || 'A2',
    source: 'KET Official Sample',
    metadata: {
      original_id: question.id
    },
    created_at: new Date()
  };
  db.questions.push(q);

  // 导入知识点关联
  if (question.knowledge_points) {
    for (const kp of question.knowledge_points) {
      const kpId = importKnowledgePoint(kp.tag, data.level || 'A2');
      
      db.prepare_references.push({
        id: db.nextIds.prepare_reference++,
        question_id: questionId,
        knowledge_point_id: kpId,
        prepare_level: kp.prepare_reference?.level || '',
        unit: kp.prepare_reference?.unit || '',
        section: kp.prepare_reference?.section || '',
        page: kp.prepare_reference?.page || 0
      });
    }
  }

  return questionId;
}

function importNotices(data: ExamJson, questionId: number): void {
  if (!data.notices || data.notices.length === 0) return;

  data.notices.forEach((notice, index) => {
    db.attachments.push({
      id: db.nextIds.attachment++,
      question_id: questionId,
      attachment_type: 'notice',
      identifier: notice.id,
      content: notice.text,
      order_index: index
    });
  });
}

function importExamJson(filePath: string): void {
  console.log(`\n==========================================`);
  console.log(`       导入真题: ${path.basename(filePath)}`);
  console.log(`==========================================\n`);

  const data = parseJsonFile(filePath);
  
  console.log(`考试类型: ${data.exam}`);
  console.log(`CEFR级别: ${data.level}`);
  console.log(`Part: ${data.part}`);
  console.log(`题目数量: ${data.questions.length}`);
  if (data.notices) {
    console.log(`选项数量: ${data.notices.length}`);
  }
  console.log('');

  // 导入每道题目
  for (const question of data.questions) {
    const qId = importQuestion(data, question);
    
    // 导入通知选项
    importNotices(data, qId);
    
    console.log(`  ✓ 题目 ${question.id}: ${question.question.substring(0, 40)}...`);
    console.log(`    答案: ${question.answer}`);
    console.log(`    难度: ${question.difficulty || 'medium'}`);
    if (question.knowledge_points) {
      console.log(`    知识点: ${question.knowledge_points.map(kp => kp.tag).join(', ')}`);
    }
    console.log('');
  }
}

// ============== 验证函数 ==============

function verifyImport(): void {
  console.log(`\n==========================================`);
  console.log(`       导入验证结果`);
  console.log(`==========================================\n`);

  console.log(`知识点总数: ${db.knowledge_points.length}`);
  console.log(`题目总数: ${db.questions.length}`);
  console.log(`附件总数: ${db.attachments.length}`);
  console.log(`备考参考总数: ${db.prepare_references.length}`);

  // 按考试类型统计
  const byType = db.questions.reduce((acc, q) => {
    acc[q.exam_type] = (acc[q.exam_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n按考试类型统计:`);
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  - ${type}: ${count} 题`);
  }

  // 按难度统计
  const byDifficulty = db.questions.reduce((acc, q) => {
    const diff = q.difficulty === 1 ? 'easy' : q.difficulty === 2 ? 'medium' : 'hard';
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n按难度统计:`);
  for (const [diff, count] of Object.entries(byDifficulty)) {
    console.log(`  - ${diff}: ${count} 题`);
  }
}

function printSampleQuestions(): void {
  console.log(`\n==========================================`);
  console.log(`       样题预览`);
  console.log(`==========================================\n`);

  const samples = db.questions.slice(0, 3);
  for (const q of samples) {
    console.log(`【${q.exam_type} Part ${q.part}】${q.question_type}`);
    console.log(`题目: ${q.content}`);
    
    // 获取附件
    const attachments = db.attachments.filter(a => a.question_id === q.id);
    if (attachments.length > 0) {
      console.log(`选项:`);
      attachments.forEach(a => {
        console.log(`  ${a.identifier}: ${a.content}`);
      });
    }
    
    console.log(`答案: ${q.answer}`);
    console.log(`解析: ${q.explanation}`);
    
    // 获取知识点
    const refs = db.prepare_references.filter(r => r.question_id === q.id);
    if (refs.length > 0) {
      console.log(`备考参考:`);
      refs.forEach(r => {
        if (r.prepare_level || r.unit) {
          console.log(`  ${r.prepare_level} ${r.unit} ${r.section} P.${r.page}`);
        }
      });
    }
    console.log('');
  }
}

// ============== 主函数 ==============

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════╗
║         KET/PET 真题导入工具 v1.0                ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  用法:                                            ║
║    npx tsx scripts/import-questions.ts <文件路径>  ║
║                                                   ║
║  示例:                                            ║
║    npx tsx scripts/import-questions.ts \\          ║
║      src/db/questions/ket/reading_part1_test1.json║
║                                                   ║
║  批量导入:                                        ║
║    npx tsx scripts/import-questions.ts \\          ║
║      src/db/questions/ket/                       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }

  const targetPath = path.resolve(args[0]);
  
  // 检查文件/目录是否存在
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ 文件不存在: ${targetPath}`);
    process.exit(1);
  }

  // 判断是文件还是目录
  const stat = fs.statSync(targetPath);
  
  if (stat.isDirectory()) {
    // 批量导入目录下的所有JSON文件
    const files = fs.readdirSync(targetPath)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(targetPath, f));
    
    console.log(`找到 ${files.length} 个JSON文件`);
    
    for (const file of files) {
      try {
        importExamJson(file);
      } catch (error: any) {
        console.error(`❌ 导入失败: ${file}`);
        console.error(`   错误: ${error.message}`);
      }
    }
  } else {
    // 单文件导入
    importExamJson(targetPath);
  }

  // 验证结果
  verifyImport();
  printSampleQuestions();

  console.log(`\n✅ 导入完成!\n`);
}

// 导出函数供其他模块使用
export { importExamJson, loadQuestions, getQuestionSet, getQuestionsBySet };

// 运行
main().catch(console.error);
