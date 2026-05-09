import { Router } from 'express';
import type { Request, Response } from 'express';
// TODO: 生产环境替换为 PostgreSQL
// import { query } from '../db';
import questionStore, { questions } from '../db/inMemory';

const router = Router();

// Debug: log questions size on each request
router.use((req, res, next) => {
  console.log(`[DEBUG] questions router: ${req.method} ${req.url}`);
  next();
});

/**
 * Get all exam sets
 * GET /api/v1/questions/sets
 * 
 * 生产环境 SQL:
 * SELECT DISTINCT exam_type, level, part, instruction FROM questions ORDER BY exam_type, part
 */
router.get('/sets', async (req: Request, res: Response) => {
  try {
    const { level, exam_type } = req.query;
    
    const allQuestions = questionStore.getAllQuestions();
    
    // 按 exam_type, level, part 分组
    const setsMap = new Map<string, { exam_type: string; level: string; part: number; instruction: string }>();
    
    for (const q of allQuestions) {
      const key = `${q.exam_type}-${q.level}-${q.part}`;
      if (!setsMap.has(key)) {
        setsMap.set(key, {
          exam_type: q.exam_type,
          level: q.level,
          part: q.part,
          instruction: q.instruction
        });
      }
    }
    
    let sets = Array.from(setsMap.values()).sort((a, b) => {
      if (a.exam_type !== b.exam_type) return a.exam_type.localeCompare(b.exam_type);
      return a.part - b.part;
    });
    
    // 筛选
    if (level) {
      sets = sets.filter(s => s.level.toLowerCase() === (level as string).toLowerCase());
    }
    if (exam_type) {
      sets = sets.filter(s => s.exam_type.toLowerCase() === (exam_type as string).toLowerCase());
    }
    
    res.json({
      success: true,
      data: sets
    });
  } catch (error) {
    console.error('Error fetching exam sets:', error);
    res.status(500).json({ error: 'Failed to fetch exam sets' });
  }
});

/**
 * Get single question by ID
 * GET /api/v1/questions/detail/:id
 * 
 * 生产环境 SQL:
 * SELECT * FROM questions WHERE id = $1
 */
router.get('/detail/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const question = questionStore.getQuestion(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const result = {
      ...question,
      notices: questionStore.getNotices(id),
      knowledge_points: questionStore.getKnowledgePoints(id)
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

/**
 * Get quick test questions (for 1-minute assessment)
 * GET /api/v1/questions/quick-test
 * NOTE: This route must be defined BEFORE /:examType/:part to avoid being matched as examType="quick-test"
 */
router.get('/quick-test', async (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 5;
    const allQuestions = questionStore.getQuickTestQuestions(count);
    
    const result = allQuestions.map((q) => ({
      question_id: q.id,
      question_type: q.question_type,
      question_text: q.question_text,
      exam_type: q.exam_type,
      level: q.level,
      part: q.part,
      difficulty: q.difficulty,
      notices: q.notices || [],
      knowledge_points: q.knowledge_points || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation
    }));
    
    res.json({
      success: true,
      data: result,
      total: result.length
    });
  } catch (error) {
    console.error('Error getting quick test:', error);
    res.status(500).json({ error: 'Failed to get quick test' });
  }
});

/**
 * Get questions by exam type and part
 * GET /api/v1/questions/:examType/:part?
 * 
 * 生产环境 SQL:
 * SELECT * FROM questions WHERE exam_type = $1 AND (part = $2 OR $2 IS NULL) ORDER BY id
 */
router.get('/:examType/:part?', async (req: Request, res: Response) => {
  try {
    const examType = req.params.examType as string; const part = req.params.part as string;
    const partNum = part ? parseInt(part, 10) : undefined;
    
    const questions = questionStore.getQuestionsByExam(examType.toUpperCase(), partNum);
    
    // 附加 notices 和 knowledge_points
    const result = questions.map(q => ({
      ...q,
      notices: questionStore.getNotices(q.id),
      knowledge_points: questionStore.getKnowledgePoints(q.id)
    }));
    
    res.json({
      success: true,
      data: result,
      total: result.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * Submit answers and get results
 * POST /api/v1/questions/submit
 * 
 * 生产环境 SQL:
 * SELECT correct_answer FROM questions WHERE id = ANY($1)
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { answers } = req.body as { answers: Array<{ question_id: string; user_answer: string }> };
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }
    
    const results = [];
    let correctCount = 0;
    
    for (const answer of answers) {
      const question = questionStore.getQuestion(answer.question_id);
      
      if (!question) {
        results.push({
          question_id: answer.question_id,
          status: 'not_found'
        });
        continue;
      }
      
      const isCorrect = question.correct_answer.toUpperCase() === answer.user_answer.toUpperCase();
      
      if (isCorrect) correctCount++;
      
      results.push({
        question_id: answer.question_id,
        user_answer: answer.user_answer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        explanation: question.explanation,
        difficulty: question.difficulty,
        knowledge_points: questionStore.getKnowledgePoints(answer.question_id)
      });
    }
    
    const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        results,
        score,
        total: answers.length,
        correct: correctCount,
        incorrect: answers.length - correctCount
      }
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

export default router;

/**
 * ================================================================================
 * 切换到 PostgreSQL 生产环境的步骤
 * ================================================================================
 * 
 * 1. 安装并启动 PostgreSQL:
 *    - macOS: brew install postgresql && brew services start postgresql
 *    - Ubuntu: sudo apt install postgresql && sudo systemctl start postgresql
 *    - Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=xxx postgres:15
 * 
 * 2. 创建数据库:
 *    createdb -U postgres english_platform
 * 
 * 3. 执行迁移脚本:
 *    psql -U postgres -d english_platform -f src/db/migrations/001_init.sql
 *    psql -U postgres -d english_platform -f src/db/migrations/002_seed_data.sql
 *    psql -U postgres -d english_platform -f src/db/migrations/003_questions_enhanced.sql
 * 
 * 4. 导入真题数据:
 *    npx tsx scripts/import-questions.ts src/db/questions/ket/reading_part1_test1.json
 * 
 * 5. 配置环境变量:
 *    在 .env 中设置 DATABASE_URL=postgresql://postgres:password@localhost:5432/english_platform
 * 
 * 6. 更新 API 路由:
 *    - 移除 inMemory 导入
 *    - 启用 PostgreSQL query 函数
 *    - 使用上方注释中的生产环境 SQL 查询
 * 
 * 7. 重启服务:
 *    pkill -f tsx && npx tsx src/index.ts
 * 
 * ================================================================================
 */
