// 测试模块 API 路由
import { Router } from 'express';
import {
  createTestSession,
  recordAnswer,
  submitTest,
  getSession,
  getReport,
  isSessionExpired
} from '../db/testSession';

const router = Router();

/**
 * 创建测试会话
 * POST /api/v1/test/session/create
 */
router.post('/session/create', (req, res) => {
  try {
    const { phone, channel, examType, count } = req.body;
    
    const result = createTestSession({
      phone,
      channel: channel || req.query.channel as string || 'direct',
      examType,
      count: count || 40
    });
    
    // 返回题目详情给前端
    const questions = result.questions.map((q, index) => ({
      index: index + 1,
      questionId: q.question_id,
      type: q.question_type,
      content: q.question_text,
      options: q.options || [], // 选项列表（如A-H通知）
      notices: q.notices || [], // 通知选项详情
      skill: q.skill,
      difficulty: q.difficulty
    }));
    
    res.json({
      success: true,
      data: {
        sessionId: result.session.sessionId,
        totalTime: 15 * 60, // 15分钟
        totalQuestions: questions.length,
        questions
      }
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create session'
    });
  }
});

/**
 * 提交单题答案
 * POST /api/v1/test/session/:sessionId/answer
 */
router.post('/session/:sessionId/answer', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer, timeSpent } = req.body;
    
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // 检查是否超时
    if (isSessionExpired(session)) {
      return res.status(400).json({
        success: false,
        error: 'Session expired',
        submitted: true
      });
    }
    
    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Session already submitted'
      });
    }
    
    const result = recordAnswer(sessionId, {
      questionId,
      answer,
      timeSpent: timeSpent || 0
    });
    
    res.json({
      success: result.success,
      isCorrect: result.isCorrect,
      error: result.error
    });
  } catch (error: any) {
    console.error('Record answer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record answer'
    });
  }
});

/**
 * 提交试卷
 * POST /api/v1/test/session/:sessionId/submit
 */
router.post('/session/:sessionId/submit', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Session already submitted'
      });
    }
    
    const result = submitTest(sessionId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId,
        totalQuestions: result.report!.totalQuestions,
        correctCount: result.report!.correctCount,
        accuracy: Math.round(result.report!.accuracy * 100),
        cefrLevel: result.report!.cefrLevel,
        cefrColor: result.report!.cefrColor,
        skills: result.report!.skills,
        weakPoints: result.report!.weakPoints,
        recommendedService: result.report!.recommendedService
      }
    });
  } catch (error: any) {
    console.error('Submit test error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit test'
    });
  }
});

/**
 * 获取测试报告
 * GET /api/v1/test/report/:sessionId
 */
router.get('/report/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const report = getReport(sessionId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get report'
    });
  }
});

/**
 * 获取会话状态
 * GET /api/v1/test/session/:sessionId
 */
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    const isExpired = isSessionExpired(session);
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: isExpired ? 'expired' : session.status,
        totalQuestions: session.questions.length,
        answeredCount: session.answers.size,
        startedAt: session.startedAt,
        remainingTime: Math.max(0, 15 * 60 * 1000 - (Date.now() - session.startedAt))
      }
    });
  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get session'
    });
  }
});

/**
 * 渠道统计
 * GET /api/v1/test/stats
 */
router.get('/stats', (req, res) => {
  try {
    // 简单的渠道统计（实际应该存数据库）
    res.json({
      success: true,
      data: {
        message: 'Channel stats endpoint - implement with database',
        channels: [
          { channel: 'direct', count: 0 },
          { channel: 'school1', count: 0 },
          { channel: 'wechat', count: 0 }
        ]
      }
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get stats'
    });
  }
});

export default router;
