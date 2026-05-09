import { Router } from 'express';
import type { Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * Get all exam sets
 * GET /api/v1/questions/sets
 */
router.get('/sets', async (req: Request, res: Response) => {
  try {
    const { level, exam_type } = req.query;
    
    let sql = 'SELECT DISTINCT exam_type, level, part, instruction FROM questions ORDER BY exam_type, part';
    const params: string[] = [];
    
    if (level || exam_type) {
      sql = 'SELECT DISTINCT exam_type, level, part, instruction FROM questions WHERE 1=1';
      if (level) {
        sql += ' AND level = $' + (params.length + 1);
        params.push(level as string);
      }
      if (exam_type) {
        sql += ' AND exam_type = $' + (params.length + 1);
        params.push(exam_type as string);
      }
      sql += ' ORDER BY exam_type, part';
    }
    
    const result = await query(sql, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching exam sets:', error);
    res.status(500).json({ error: 'Failed to fetch exam sets' });
  }
});

/**
 * Get questions by exam type
 * GET /api/v1/questions/:examType/:part?
 */
router.get('/:examType/:part?', async (req: Request, res: Response) => {
  try {
    const { examType, part } = req.params;
    
    let sql = `
      SELECT 
        q.id,
        q.exam_type,
        q.level,
        q.part,
        q.section_type,
        q.instruction,
        q.type,
        q.question_text,
        q.options,
        q.correct_answer,
        q.explanation,
        q.difficulty,
        q.audio_url,
        q.image_url
      FROM questions q
      WHERE q.exam_type = $1
    `;
    const params: (string | number)[] = [examType];
    
    if (part) {
      sql += ' AND q.part = $2';
      params.push(parseInt(part));
    }
    
    sql += ' ORDER BY q.part, q.id';
    
    const result = await query(sql, params);
    
    // Fetch notices for each question set
    const noticesSql = `
      SELECT n.* FROM question_notices n
      JOIN questions q ON n.question_id = q.id
      WHERE q.exam_type = $1
      GROUP BY n.id
      ORDER BY n.id
    `;
    const noticesResult = await query(noticesSql, [examType]);
    
    res.json({
      success: true,
      data: {
        questions: result.rows,
        notices: noticesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * Get question by ID with details
 * GET /api/v1/questions/detail/:id
 */
router.get('/detail/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get question details
    const questionSql = `
      SELECT 
        q.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', kp.id,
          'tag', kp.tag,
          'level', kp.level,
          'unit', kp.unit,
          'section', kp.section,
          'page', kp.page
        )) FILTER (WHERE kp.id IS NOT NULL) as knowledge_points
      FROM questions q
      LEFT JOIN question_knowledge_points qkp ON q.id = qkp.question_id
      LEFT JOIN knowledge_points kp ON qkp.knowledge_point_id = kp.id
      WHERE q.id = $1
      GROUP BY q.id
    `;
    const questionResult = await query(questionSql, [id]);
    
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Get notices for this question's exam set
    const noticesSql = `
      SELECT n.* FROM question_notices n
      WHERE n.question_id IN (
        SELECT id FROM questions 
        WHERE exam_type = (SELECT exam_type FROM questions WHERE id = $1)
        AND part = (SELECT part FROM questions WHERE id = $1)
      )
      ORDER BY n.id
    `;
    const noticesResult = await query(noticesSql, [id]);
    
    res.json({
      success: true,
      data: {
        ...questionResult.rows[0],
        notices: noticesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching question detail:', error);
    res.status(500).json({ error: 'Failed to fetch question detail' });
  }
});

/**
 * Get knowledge points
 * GET /api/v1/questions/knowledge-points
 */
router.get('/knowledge-points/all', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM knowledge_points ORDER BY level, tag'
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching knowledge points:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge points' });
  }
});

/**
 * Get knowledge points by level
 * GET /api/v1/questions/knowledge-points/:level
 */
router.get('/knowledge-points/:level', async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const result = await query(
      'SELECT * FROM knowledge_points WHERE level = $1 ORDER BY tag',
      [level]
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching knowledge points:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge points' });
  }
});

/**
 * Submit exam answers and get results
 * POST /api/v1/questions/submit
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { examType, answers } = req.body;
    
    if (!examType || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        required: ['examType', 'answers']
      });
    }
    
    // Fetch all questions for the exam type
    const questionsSql = `
      SELECT id, question_text, correct_answer, difficulty 
      FROM questions 
      WHERE exam_type = $1
    `;
    const questionsResult = await query(questionsSql, [examType]);
    
    // Calculate results
    const results = answers.map(answer => {
      const question = questionsResult.rows.find(q => q.id === answer.questionId);
      if (!question) {
        return {
          questionId: answer.questionId,
          status: 'not_found'
        };
      }
      
      const isCorrect = question.correct_answer.toUpperCase() === answer.answer.toUpperCase();
      return {
        questionId: answer.questionId,
        userAnswer: answer.answer,
        correctAnswer: question.correct_answer,
        isCorrect,
        difficulty: question.difficulty
      };
    });
    
    // Calculate scores
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        examType,
        totalQuestions: totalCount,
        correctCount,
        incorrectCount: totalCount - correctCount,
        score,
        results
      }
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

/**
 * Get exam statistics
 * GET /api/v1/questions/stats/:examType
 */
router.get('/stats/:examType', async (req: Request, res: Response) => {
  try {
    const { examType } = req.params;
    
    const statsSql = `
      SELECT 
        COUNT(*) as total_questions,
        COUNT(DISTINCT part) as total_parts,
        COUNT(DISTINCT level) as total_levels,
        COUNT(DISTINCT difficulty) as difficulty_types,
        json_object_agg(difficulty, COUNT(*)) as by_difficulty,
        json_object_agg(part, COUNT(*)) as by_part
      FROM questions
      WHERE exam_type = $1
      GROUP BY exam_type
    `;
    const result = await query(statsSql, [examType]);
    
    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
