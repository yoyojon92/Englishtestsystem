/**
 * L1: 答题行为记录 API
 * 记录每次答题行为，供 L3 诊断服务使用
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// 内存存储答题记录
interface AnswerLog {
  id: string;
  student_id: string;
  session_id: string;
  question_id: string;
  question_type: string;
  skill: string;
  knowledge_point: string;
  answer_given: string;
  answer_correct: string;
  is_correct: boolean;
  time_spent_seconds: number;
  attempt_count: number;
  hints_used: number;
  created_at: string;
}

interface Session {
  session_id: string;
  student_id: string;
  start_time: string;
  end_time?: string;
  question_count: number;
  correct_count: number;
}

const answerLogs: AnswerLog[] = [];
const sessions: Map<string, Session> = new Map();

/**
 * 创建练习会话
 * POST /api/v1/answers/sessions
 */
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { student_id, exam_type, skill } = req.body;
    
    if (!student_id) {
      res.status(400).json({ error: 'student_id is required' });
      return;
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const session: Session = {
      session_id: sessionId,
      student_id,
      start_time: new Date().toISOString(),
      question_count: 0,
      correct_count: 0,
    };

    sessions.set(sessionId, session);

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        student_id,
        start_time: session.start_time,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * 记录单题答题
 * POST /api/v1/answers/log
 */
router.post('/log', async (req: Request, res: Response) => {
  try {
    const {
      session_id,
      question_id,
      question_type,
      skill,
      knowledge_point,
      answer_given,
      answer_correct,
      time_spent_seconds,
      attempt_count = 1,
      hints_used = 0,
    } = req.body;

    if (!session_id || !question_id) {
      res.status(400).json({ error: 'session_id and question_id are required' });
      return;
    }

    const isCorrect = String(answer_given).toUpperCase() === String(answer_correct).toUpperCase();
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const log: AnswerLog = {
      id: logId,
      student_id: sessions.get(session_id)?.student_id || 'unknown',
      session_id,
      question_id,
      question_type: question_type || 'multiple_choice',
      skill: skill || 'reading',
      knowledge_point: knowledge_point || '',
      answer_given: String(answer_given),
      answer_correct: String(answer_correct),
      is_correct: isCorrect,
      time_spent_seconds: Number(time_spent_seconds) || 0,
      attempt_count: Number(attempt_count),
      hints_used: Number(hints_used),
      created_at: new Date().toISOString(),
    };

    answerLogs.push(log);

    // 更新会话统计
    const session = sessions.get(session_id);
    if (session) {
      session.question_count++;
      if (isCorrect) session.correct_count++;
    }

    res.json({
      success: true,
      data: {
        log_id: logId,
        is_correct: isCorrect,
        correct_answer: answer_correct,
      },
    });
  } catch (error) {
    console.error('Error logging answer:', error);
    res.status(500).json({ error: 'Failed to log answer' });
  }
});

/**
 * 批量记录答题
 * POST /api/v1/answers/logs
 */
router.post('/logs', async (req: Request, res: Response) => {
  try {
    const { student_id, session_id, questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      res.status(400).json({ error: 'questions array is required' });
      return;
    }

    const results = [];
    let session = sessions.get(session_id);

    // 如果没有 session，创建一个
    if (!session && student_id) {
      const newSessionId = session_id || `sess_${Date.now()}`;
      session = {
        session_id: newSessionId,
        student_id,
        start_time: new Date().toISOString(),
        question_count: 0,
        correct_count: 0,
      };
      sessions.set(newSessionId, session);
    }

    for (const q of questions) {
      const isCorrect = String(q.answer_given).toUpperCase() === String(q.answer_correct).toUpperCase();
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

      const log: AnswerLog = {
        id: logId,
        student_id: session?.student_id || student_id || 'unknown',
        session_id: session?.session_id || session_id || 'unknown',
        question_id: q.question_id,
        question_type: q.type || q.question_type || 'multiple_choice',
        skill: q.skill || 'reading',
        knowledge_point: q.knowledge_point || '',
        answer_given: String(q.answer_given),
        answer_correct: String(q.answer_correct),
        is_correct: isCorrect,
        time_spent_seconds: Number(q.time_spent_seconds) || 0,
        attempt_count: Number(q.attempt_count) || 1,
        hints_used: Number(q.hints_used) || 0,
        created_at: new Date().toISOString(),
      };

      answerLogs.push(log);
      results.push({ log_id: logId, is_correct: isCorrect });

      if (session) {
        session.question_count++;
        if (isCorrect) session.correct_count++;
      }
    }

    res.json({
      success: true,
      data: {
        session_id: session?.session_id,
        total: questions.length,
        correct: results.filter(r => r.is_correct).length,
        results,
      },
    });
  } catch (error) {
    console.error('Error logging answers:', error);
    res.status(500).json({ error: 'Failed to log answers' });
  }
});

/**
 * 获取会话记录
 * GET /api/v1/answers/sessions/:sessionId
 */
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = sessions.get(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const sessionLogs = answerLogs.filter(log => log.session_id === sessionId);

    res.json({
      success: true,
      data: {
        session,
        logs: sessionLogs,
        accuracy: session.question_count > 0 
          ? Math.round((session.correct_count / session.question_count) * 100) 
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * 获取学员答题历史
 * GET /api/v1/answers/students/:studentId/history
 */
router.get('/students/:studentId/history', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const studentLogs = answerLogs
      .filter(log => log.student_id === studentId)
      .slice(Number(offset), Number(offset) + Number(limit));

    const total = answerLogs.filter(log => log.student_id === studentId).length;
    const correctCount = studentLogs.filter(log => log.is_correct).length;

    res.json({
      success: true,
      data: {
        logs: studentLogs,
        total,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          has_more: Number(offset) + studentLogs.length < total,
        },
        summary: {
          total_questions: total,
          correct_count: studentLogs.filter(l => l.is_correct).length,
          accuracy: total > 0 ? Math.round((correctCount / total) * 100) : 0,
          average_time: total > 0 
            ? Math.round(studentLogs.reduce((sum, l) => sum + l.time_spent_seconds, 0) / total)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * 获取学员能力统计（供 L3 诊断使用）
 * GET /api/v1/answers/students/:studentId/stats
 */
router.get('/students/:studentId/stats', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    const recentLogs = answerLogs.filter(log => {
      return log.student_id === studentId && 
             new Date(log.created_at) >= cutoffDate;
    });

    // 按技能分组统计
    const skillStats: Record<string, { total: number; correct: number }> = {};
    const knowledgeStats: Record<string, { total: number; correct: number }> = {};

    recentLogs.forEach(log => {
      // 技能统计
      if (!skillStats[log.skill]) {
        skillStats[log.skill] = { total: 0, correct: 0 };
      }
      skillStats[log.skill].total++;
      if (log.is_correct) skillStats[log.skill].correct++;

      // 知识点统计
      if (log.knowledge_point) {
        if (!knowledgeStats[log.knowledge_point]) {
          knowledgeStats[log.knowledge_point] = { total: 0, correct: 0 };
        }
        knowledgeStats[log.knowledge_point].total++;
        if (log.is_correct) knowledgeStats[log.knowledge_point].correct++;
      }
    });

    // 计算各项正确率
    const skillMastery: Record<string, number> = {};
    Object.entries(skillStats).forEach(([skill, stats]) => {
      skillMastery[skill] = stats.total > 0 ? stats.correct / stats.total : 0;
    });

    const knowledgeMastery: Record<string, number> = {};
    Object.entries(knowledgeStats).forEach(([kp, stats]) => {
      knowledgeMastery[kp] = stats.total > 0 ? stats.correct / stats.total : 0;
    });

    res.json({
      success: true,
      data: {
        student_id: studentId,
        period_days: Number(days),
        total_questions: recentLogs.length,
        skills: skillMastery,
        knowledge_points: knowledgeMastery,
        average_time: recentLogs.length > 0
          ? Math.round(recentLogs.reduce((sum, l) => sum + l.time_spent_seconds, 0) / recentLogs.length)
          : 0,
        sessions_count: new Set(recentLogs.map(l => l.session_id)).size,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
