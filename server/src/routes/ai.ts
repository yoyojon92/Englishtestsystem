/**
 * AI 服务路由
 * 
 * 端点：
 * - POST /api/v1/ai/speaking-evaluate - 口语评测
 * - POST /api/v1/ai/conversation/start - 开始 AI 对话
 * - POST /api/v1/ai/conversation/respond - 发送回复
 * - GET /api/v1/ai/conversation/:id/report - 获取对话报告
 * - POST /api/v1/ai/vocabulary-estimate - 词汇量估算
 * - POST /api/v1/ai/exam-predict - 考试通过率预测
 */

import express, { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as iflytekIse from '../services/ai/iflytekIse';
import * as aiTeacher from '../services/ai/aiTeacher';
import * as catAlgorithm from '../algorithms/cat';

const router = Router();
export default router;

// 会话存储（实际产品中应使用 Redis 或数据库）
const conversationSessions = new Map<string, aiTeacher.ConversationSession>();

/**
 * POST /api/v1/ai/speaking-evaluate
 * 口语发音评测
 */
router.post('/speaking-evaluate', async (req: any, res: any) => {
  try {
    const { audioBase64, text, category, language } = req.body;
    
    if (!audioBase64 || !text) {
      return res.status(400).json({
        success: false,
        error: 'audioBase64 and text are required',
      });
    }
    
    // 将 Base64 转换为 Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // 调用讯飞评测
    const result = await iflytekIse.evaluateSpeech({
      audioBuffer,
      text,
      category: category || 'read_sentence',
      language: language || 'en_us',
    });
    
    res.json(result);
  } catch (error) {
    console.error('Speaking evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Evaluation failed',
    });
  }
});

/**
 * POST /api/v1/ai/ket-pet-speaking
 * KET/PET 口语考试评测
 */
router.post('/ket-pet-speaking', async (req: any, res: any) => {
  try {
    const { audioBase64, part, question, expectedKeywords } = req.body;
    
    if (!audioBase64 || !question) {
      return res.status(400).json({
        success: false,
        error: 'audioBase64 and question are required',
      });
    }
    
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    const result = await iflytekIse.evaluateKetPetSpeaking({
      audioBuffer,
      part: part || 1,
      question,
      expectedKeywords,
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('KET/PET speaking evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Evaluation failed',
    });
  }
});

/**
 * POST /api/v1/ai/conversation/start
 * 开始 AI 对话会话
 */
router.post('/conversation/start', (req: any, res: any) => {
  try {
    const { childId, type, level } = req.body;
    
    if (!childId || !type || !level) {
      return res.status(400).json({
        success: false,
        error: 'childId, type, and level are required',
      });
    }
    
    const session = aiTeacher.createConversationSession({
      childId,
      type,
      level,
    });
    
    // 生成初始问题
    let initialQuestion: string;
    
    if (type === 'post_class') {
      const questions = aiTeacher.generatePostClassQuestions(level);
      initialQuestion = questions[0];
    } else if (type === 'exam_practice') {
      const examType = level === 'A1' || level === 'A2' ? 'KET' : 'PET';
      const question = aiTeacher.generateExamQuestion(examType, 1);
      initialQuestion = question.question;
    } else {
      initialQuestion = `Hello! I'm Teacher Emma. Let's practice English together. Can you tell me about yourself? What's your name?`;
    }
    
    // 添加初始问题到历史
    session.history.push({ role: 'assistant', content: initialQuestion });
    
    // 存储会话
    conversationSessions.set(session.sessionId, session);
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        question: initialQuestion,
        instructions: type === 'exam_practice' ? 'This is Part 1 of the speaking test. Answer the examiner\'s questions.' : 'Please answer the question.',
      },
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start conversation',
    });
  }
});

/**
 * POST /api/v1/ai/conversation/respond
 * 发送回复并获取反馈
 */
router.post('/conversation/respond', async (req: any, res: any) => {
  try {
    const { sessionId, answer, isLast = false } = req.body;
    
    if (!sessionId || !answer) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and answer are required',
      });
    }
    
    const session = conversationSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    // 处理回复
    const { teacherResponse, scores, isComplete } = await aiTeacher.processStudentResponse(
      session,
      answer
    );
    
    // 更新会话
    conversationSessions.set(sessionId, session);
    
    // 如果是对话结束，生成报告
    let report = null;
    if (isComplete || isLast) {
      report = await aiTeacher.generatePostClassReport(session);
    }
    
    res.json({
      success: true,
      data: {
        teacherResponse,
        scores: {
          accuracy: scores.accuracy,
          fluency: scores.fluency,
          vocabulary: scores.vocabulary,
          grammar: scores.grammar,
          pronunciation: scores.pronunciation,
          interaction: scores.interaction,
          overall: (scores.accuracy + scores.fluency + scores.vocabulary + 
                    scores.grammar + scores.pronunciation + scores.interaction) / 6,
        },
        isComplete: isComplete || isLast,
        report,
      },
    });
  } catch (error) {
    console.error('Conversation respond error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process response',
    });
  }
});

/**
 * GET /api/v1/ai/conversation/:id/report
 * 获取对话报告
 */
router.get('/conversation/:id/report', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const session = conversationSessions.get(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    const report = await aiTeacher.generatePostClassReport(session);
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        childId: session.childId,
        type: session.type,
        level: session.level,
        totalQuestions: session.scores.length,
        report,
      },
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get report',
    });
  }
});

/**
 * POST /api/v1/ai/vocabulary-estimate
 * 词汇量估算
 */
router.post('/vocabulary-estimate', (req: any, res: any) => {
  try {
    const { correctCount, totalQuestions, knownWordRatio } = req.body;
    
    if (typeof correctCount !== 'number' || typeof totalQuestions !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'correctCount and totalQuestions are required',
      });
    }
    
    const vocabularySize = catAlgorithm.estimateVocabularySize(
      correctCount,
      totalQuestions,
      knownWordRatio || 0.5
    );
    
    // CEFR 对应词汇量
    const cefrVocabulary: Record<string, { min: number; max: number }> = {
      'Pre-A1': { min: 0, max: 500 },
      'A1': { min: 500, max: 1000 },
      'A2': { min: 1000, max: 2500 },
      'B1': { min: 2500, max: 5000 },
      'B2': { min: 5000, max: 8000 },
      'C1': { min: 8000, max: 12000 },
      'C2': { min: 12000, max: 20000 },
    };
    
    // 确定 CEFR 等级
    let cefrLevel = 'Pre-A1';
    for (const [level, range] of Object.entries(cefrVocabulary)) {
      if (vocabularySize >= range.min && vocabularySize < range.max) {
        cefrLevel = level;
        break;
      }
    }
    
    res.json({
      success: true,
      data: {
        estimatedVocabulary: vocabularySize,
        cefrLevel,
        accuracy: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
        confidence: totalQuestions >= 20 ? 'high' : totalQuestions >= 10 ? 'medium' : 'low',
      },
    });
  } catch (error) {
    console.error('Vocabulary estimate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Estimation failed',
    });
  }
});

/**
 * POST /api/v1/ai/exam-predict
 * 考试通过率预测
 */
router.post('/exam-predict', (req: any, res: any) => {
  try {
    const { ability, examType, mockExamHistory } = req.body;
    
    if (typeof ability !== 'number' || !examType) {
      return res.status(400).json({
        success: false,
        error: 'ability and examType are required',
      });
    }
    
    const prediction = catAlgorithm.predictExamPassRate(
      ability,
      examType,
      mockExamHistory || []
    );
    
    res.json({
      success: true,
      data: {
        examType,
        currentAbility: ability,
        prediction,
      },
    });
  } catch (error) {
    console.error('Exam predict error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Prediction failed',
    });
  }
});

/**
 * POST /api/v1/ai/adaptive-test/start
 * 开始自适应测试
 */
router.post('/adaptive-test/start', (req: any, res: any) => {
  try {
    const { studentId, category, targetCEFR, maxItems, minItems } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'studentId is required',
      });
    }
    
    // 初始化测试
    const test = catAlgorithm.runAdaptiveTest(studentId, {
      category,
      targetCEFR,
      maxItems: maxItems || 30,
      minItems: minItems || 10,
    });
    
    const initialState = test.startTest();
    const firstItem = test.getNextItem(initialState);
    
    res.json({
      success: true,
      data: {
        testId: uuidv4(),
        state: {
          testLength: initialState.testLength,
          standardError: initialState.standardError,
          isComplete: initialState.isComplete,
        },
        firstItem: firstItem ? {
          id: firstItem.itemId,
          content: firstItem.content,
          options: firstItem.options,
          category: firstItem.category,
          cefrLevel: firstItem.cefrLevel,
          timeLimit: firstItem.timeLimit,
        } : null,
      },
    });
  } catch (error) {
    console.error('Adaptive test start error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start test',
    });
  }
});

/**
 * POST /api/v1/ai/adaptive-test/next
 * 获取下一题
 */
router.post('/adaptive-test/next', (req: any, res: any) => {
  try {
    const { currentAbility, administeredItems, remainingItemIds } = req.body;
    
    if (typeof currentAbility !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'currentAbility is required',
      });
    }
    
    // 简化实现：基于能力水平返回题目
    // 实际产品中应从数据库查询并选择信息量最大的题目
    const difficulty = currentAbility;
    
    res.json({
      success: true,
      data: {
        recommendedDifficulty: difficulty,
        nextItemHint: `Select a question with difficulty around ${Math.round(difficulty * 10) / 10}`,
      },
    });
  } catch (error) {
    console.error('Adaptive test next error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get next item',
    });
  }
});

/**
 * GET /api/v1/ai/health
 * 健康检查
 */
router.get('/health', (req: any, res: any) => {
  res.json({
    status: 'ok',
    services: {
      iflytek: 'configured',
      llm: 'configured',
      cat: 'ready',
    },
  });
});


/**
 * GET /api/v1/ai/status
 * AI 服务状态
 */
router.get('/status', (req: any, res: any) => {
  res.json({
    success: true,
    status: 'ready',
    services: {
      iflytek: 'configured',
      llm: 'configured',
      cat: 'ready',
    },
  });
});
