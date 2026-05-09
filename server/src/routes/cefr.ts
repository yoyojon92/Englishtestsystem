import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

/**
 * CEFR 定期评估数据结构
 */
interface CefrAssessment {
  assessId: string;
  childId: string;
  assessDate: string;
  cefrLevel: string;
  confidencePct: number;
  scores: {
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
    vocabulary: number;
    grammar: number;
  };
  comparedToLast: {
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
    overall: number;
  };
  recommendations: string[];
  examRecommendations: {
    examName: string;
    readiness: number;
    suggestion: string;
  }[];
  nextAssessDate: string;
  createdAt: string;
}

/**
 * 模拟数据存储
 */
const assessments: Map<string, CefrAssessment[]> = new Map();

/**
 * 生成评估数据
 */
function generateAssessment(childId: string, previousLevel?: string): CefrAssessment {
  const assessId = `ASSESS-${Date.now()}`;
  const baseScores = {
    reading: 60 + Math.random() * 30,
    listening: 55 + Math.random() * 35,
    speaking: 50 + Math.random() * 40,
    writing: 55 + Math.random() * 35,
    vocabulary: 1200 + Math.random() * 800,
    grammar: 60 + Math.random() * 30,
  };

  // 计算CEFR等级
  const avgScore = (baseScores.reading + baseScores.listening + baseScores.speaking + baseScores.writing) / 4;
  let cefrLevel = 'A1';
  if (avgScore >= 80) cefrLevel = 'B2';
  else if (avgScore >= 70) cefrLevel = 'B1';
  else if (avgScore >= 60) cefrLevel = 'A2';
  else if (avgScore >= 50) cefrLevel = 'Pre-A1';

  // 计算通过置信度
  const confidencePct = Math.min(95, Math.round(avgScore + 10));

  // 与上次对比
  const comparedToLast = {
    reading: Math.round((Math.random() - 0.3) * 10),
    listening: Math.round((Math.random() - 0.3) * 10),
    speaking: Math.round((Math.random() - 0.3) * 10),
    writing: Math.round((Math.random() - 0.3) * 10),
    overall: Math.round((Math.random() - 0.2) * 8),
  };

  // 推荐建议
  const recommendations: string[] = [];
  if (baseScores.reading < 70) recommendations.push('建议加强阅读理解训练，每天完成2篇阅读练习');
  if (baseScores.listening < 70) recommendations.push('建议增加听力输入，可收听英文儿童节目');
  if (baseScores.speaking < 70) recommendations.push('建议多进行口语练习，可使用AI外教进行对话');
  if (baseScores.writing < 70) recommendations.push('建议背诵写作模板，并进行写作练习');
  if (recommendations.length === 0) recommendations.push('继续保持当前学习节奏，可尝试更高难度挑战');

  // 考试推荐
  const examRecommendations: CefrAssessment['examRecommendations'] = [];
  if (cefrLevel === 'Pre-A1' && confidencePct >= 85) {
    examRecommendations.push({
      examName: 'YLE Pre-A1 Starters',
      readiness: 85,
      suggestion: '已达到考试水平，可报名参加',
    });
  } else if (cefrLevel === 'A1') {
    if (confidencePct >= 85) {
      examRecommendations.push({
        examName: 'YLE A1 Movers',
        readiness: 85,
        suggestion: '建议报名参加',
      });
    }
    examRecommendations.push({
      examName: 'YLE Pre-A1 Starters',
      readiness: 95,
      suggestion: '可作为热身考试',
    });
  } else if (cefrLevel === 'A2') {
    if (confidencePct >= 85) {
      examRecommendations.push({
        examName: 'A2 Key (KET)',
        readiness: 85,
        suggestion: '已达到KET考试水平',
      });
    }
    examRecommendations.push({
      examName: 'YLE A2 Flyers',
      readiness: 95,
      suggestion: '可作为进阶考试',
    });
  } else if (cefrLevel === 'B1') {
    if (confidencePct >= 85) {
      examRecommendations.push({
        examName: 'B1 Preliminary (PET)',
        readiness: 85,
        suggestion: '已达到PET考试水平',
      });
    }
    examRecommendations.push({
      examName: 'A2 Key (KET)',
      readiness: 95,
      suggestion: '可作为保底考试',
    });
  }

  // 下次评估日期
  const nextAssessDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  return {
    assessId,
    childId,
    assessDate: new Date().toISOString(),
    cefrLevel,
    confidencePct,
    scores: baseScores,
    comparedToLast,
    recommendations,
    examRecommendations,
    nextAssessDate,
    createdAt: new Date().toISOString(),
  };
}

/**
 * GET /api/v1/cefr/assessments/:childId
 * 获取CEFR评估历史
 */
router.get('/assessments/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;
    const { limit } = req.query;

    let history = assessments.get(childId) || [];
    
    // 生成一些历史数据
    if (history.length === 0) {
      for (let i = 0; i < 3; i++) {
        history.push(generateAssessment(childId));
      }
      assessments.set(childId, history);
    }

    const limitNum = parseInt(limit as string) || 10;
    const recentAssessments = history.slice(-limitNum).reverse();

    return res.json({
      success: true,
      data: {
        assessments: recentAssessments,
        total: history.length,
      },
    });
  } catch (error: any) {
    console.error('Get assessments error:', error);
    return res.status(500).json({ error: 'Failed to get assessments' });
  }
});

/**
 * POST /api/v1/cefr/assessments/:childId
 * 创建新的CEFR评估
 */
router.post('/assessments/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;

    // 获取历史评估以确定当前等级
    const history = assessments.get(childId);
    const previousLevel = history?.[history.length - 1]?.cefrLevel;

    const assessment = generateAssessment(childId, previousLevel);

    // 保存评估
    const childAssessments = assessments.get(childId) || [];
    childAssessments.push(assessment);
    assessments.set(childId, childAssessments);

    return res.json({
      success: true,
      data: assessment,
    });
  } catch (error: any) {
    console.error('Create assessment error:', error);
    return res.status(500).json({ error: 'Failed to create assessment' });
  }
});

/**
 * GET /api/v1/cefr/assessments/:childId/latest
 * 获取最新评估
 */
router.get('/assessments/:childId/latest', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;

    let history = assessments.get(childId) || [];
    
    if (history.length === 0) {
      const assessment = generateAssessment(childId);
      history.push(assessment);
      assessments.set(childId, history);
    }

    const latest = history[history.length - 1];

    return res.json({
      success: true,
      data: latest,
    });
  } catch (error: any) {
    console.error('Get latest assessment error:', error);
    return res.status(500).json({ error: 'Failed to get latest assessment' });
  }
});

/**
 * GET /api/v1/cefr/progress/:childId
 * 获取CEFR进步趋势
 */
router.get('/progress/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;

    const history = assessments.get(childId) || [];
    
    // 生成趋势数据
    const trend = {
      timeline: history.map(a => ({
        date: a.assessDate.split('T')[0],
        cefrLevel: a.cefrLevel,
        overall: Math.round((a.scores.reading + a.scores.listening + a.scores.speaking + a.scores.writing) / 4),
      })),
      skills: {
        reading: history.map(a => ({ date: a.assessDate.split('T')[0], score: Math.round(a.scores.reading) })),
        listening: history.map(a => ({ date: a.assessDate.split('T')[0], score: Math.round(a.scores.listening) })),
        speaking: history.map(a => ({ date: a.assessDate.split('T')[0], score: Math.round(a.scores.speaking) })),
        writing: history.map(a => ({ date: a.assessDate.split('T')[0], score: Math.round(a.scores.writing) })),
      },
      cefrProgression: calculateCefrProgression(history),
    };

    return res.json({
      success: true,
      data: trend,
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    return res.status(500).json({ error: 'Failed to get progress' });
  }
});

/**
 * 计算CEFR等级数值
 */
function cefrToNumber(level: string): number {
  const mapping: Record<string, number> = {
    'Pre-A1': 1,
    'A1': 2,
    'A2': 3,
    'B1': 4,
    'B2': 5,
    'C1': 6,
    'C2': 7,
  };
  return mapping[level] || 0;
}

/**
 * 计算CEFR进阶
 */
function calculateCefrProgression(history: CefrAssessment[]) {
  if (history.length < 2) {
    return {
      startedAt: history[0]?.cefrLevel || 'Unknown',
      currentLevel: history[0]?.cefrLevel || 'Unknown',
      progression: [],
      monthsToNextLevel: 3,
      nextMilestone: cefrToNumber(history[0]?.cefrLevel || 'A1') + 1,
    };
  }

  const first = history[0];
  const latest = history[history.length - 1];

  return {
    startedAt: first.cefrLevel,
    currentLevel: latest.cefrLevel,
    progression: history.map(a => ({
      level: a.cefrLevel,
      date: a.assessDate.split('T')[0],
      levelNumber: cefrToNumber(a.cefrLevel),
    })),
    monthsToNextLevel: calculateMonthsToNextLevel(latest.cefrLevel, latest.confidencePct),
    nextMilestone: cefrToNumber(latest.cefrLevel) + 1,
  };
}

/**
 * 计算到下一等级所需时间
 */
function calculateMonthsToNextLevel(currentLevel: string, confidence: number): number {
  // 基础月数
  const baseMonths: Record<string, number> = {
    'Pre-A1': 3,
    'A1': 4,
    'A2': 6,
    'B1': 8,
    'B2': 12,
  };

  const base = baseMonths[currentLevel] || 6;
  
  // 根据置信度调整
  if (confidence >= 90) return Math.max(1, base / 2);
  if (confidence >= 75) return Math.max(2, Math.round(base * 0.7));
  return base;
}

/**
 * GET /api/v1/cefr/readiness/:childId
 * 获取考试就绪评估
 */
router.get('/readiness/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;
    const { examType } = req.query;

    const history = assessments.get(childId);
    const latest = history?.[history.length - 1];

    if (!latest) {
      return res.status(404).json({ error: 'No assessment found' });
    }

    // 模拟考试就绪评估
    const examLevels: Record<string, { minScore: number; cefr: string }> = {
      'YLE Starters': { minScore: 50, cefr: 'Pre-A1' },
      'YLE Movers': { minScore: 55, cefr: 'A1' },
      'YLE Flyers': { minScore: 60, cefr: 'A2' },
      'KET': { minScore: 65, cefr: 'A2' },
      'PET': { minScore: 70, cefr: 'B1' },
      'FCE': { minScore: 80, cefr: 'B2' },
    };

    const exam = examType as string || 'KET';
    const examConfig = examLevels[exam] || examLevels['KET'];

    const avgScore = (latest.scores.reading + latest.scores.listening + latest.scores.speaking + latest.scores.writing) / 4;
    const readiness = Math.min(100, Math.round(avgScore + (100 - avgScore) * (latest.confidencePct / 100)));

    let status: 'ready' | 'almost' | 'not_ready' = 'not_ready';
    if (readiness >= 85) status = 'ready';
    else if (readiness >= 70) status = 'almost';

    const suggestions: string[] = [];
    if (status === 'ready') {
      suggestions.push('恭喜！您已达到考试报名条件');
    } else if (status === 'almost') {
      suggestions.push('距离考试就绪仅一步之遥，建议再进行2-4周的针对性训练');
      if (latest.scores.reading < 70) suggestions.push('重点提升阅读理解能力');
      if (latest.scores.listening < 70) suggestions.push('加强听力训练');
      if (latest.scores.speaking < 70) suggestions.push('多进行口语练习');
    } else {
      suggestions.push('建议先打好基础，词汇量达到1500+后再考虑报名');
      suggestions.push('可参加模拟考试了解自身水平');
    }

    const readinessData = {
      examType: exam,
      cefrRequired: examConfig.cefr,
      currentLevel: latest.cefrLevel,
      readiness,
      status,
      gapAnalysis: {
        reading: { current: Math.round(latest.scores.reading), target: examConfig.minScore, gap: Math.max(0, examConfig.minScore - latest.scores.reading) },
        listening: { current: Math.round(latest.scores.listening), target: examConfig.minScore, gap: Math.max(0, examConfig.minScore - latest.scores.listening) },
        speaking: { current: Math.round(latest.scores.speaking), target: examConfig.minScore, gap: Math.max(0, examConfig.minScore - latest.scores.speaking) },
        writing: { current: Math.round(latest.scores.writing), target: examConfig.minScore, gap: Math.max(0, examConfig.minScore - latest.scores.writing) },
      },
      suggestions,
      estimatedTimeToReady: status === 'ready' ? '立即可报名' : `${Math.ceil((100 - readiness) / 5)}周强化训练`,
    };

    return res.json({
      success: true,
      data: readinessData,
    });
  } catch (error: any) {
    console.error('Get readiness error:', error);
    return res.status(500).json({ error: 'Failed to get readiness' });
  }
});

/**
 * GET /api/v1/cefr/recommendations/:childId
 * 获取学习建议
 */
router.get('/recommendations/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;

    const history = assessments.get(childId);
    const latest = history?.[history.length - 1];

    if (!latest) {
      return res.status(404).json({ error: 'No assessment found' });
    }

    // 基于评估结果生成个性化建议
    const recommendations = {
      dailyPractice: {
        duration: 30, // 分钟
        activities: [
          { type: 'vocabulary', duration: 10, description: '词汇记忆与复习' },
          { type: 'listening', duration: 10, description: '听力训练' },
          { type: 'speaking', duration: 10, description: '口语跟读练习' },
        ],
      },
      weeklyFocus: {
        current: latest.scores.reading < 70 ? '阅读' : 
                 latest.scores.listening < 70 ? '听力' :
                 latest.scores.speaking < 70 ? '口语' : '综合',
        weakPoints: latest.recommendations,
      },
      learningPath: {
        currentLevel: latest.cefrLevel,
        nextLevel: cefrToNumber(latest.cefrLevel) + 1,
        targetExam: latest.examRecommendations[0]?.examName || '待定',
        estimatedWeeks: Math.ceil((100 - latest.confidencePct) / 5) * 2,
      },
      resources: [
        { type: 'book', name: '剑桥少儿英语官方教材', level: latest.cefrLevel },
        { type: 'app', name: '多邻国英语学习', skill: '综合' },
        { type: 'video', name: 'BBC Learning English', skill: '听力' },
      ],
    };

    return res.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * POST /api/v1/cefr/notify-when-ready/:childId
 * 设置考试就绪提醒
 */
router.post('/notify-when-ready/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;
    const { examType, targetDate, channels } = req.body;

    // 模拟保存通知设置
    const notificationSetting = {
      settingId: `NOTIFY-${Date.now()}`,
      childId,
      examType,
      targetDate,
      channels: channels || ['wechat', 'sms'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: notificationSetting,
    });
  } catch (error: any) {
    console.error('Set notification error:', error);
    return res.status(500).json({ error: 'Failed to set notification' });
  }
});

export default router;
