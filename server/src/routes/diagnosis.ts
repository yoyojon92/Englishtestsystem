/**
 * L3: 认知诊断服务
 * 基于答题行为数据，计算 CEFR 能力等级和知识点掌握度
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// CEFR 等级顺序
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * 难度等级到 CEFR 的映射
 */
const DIFFICULTY_CEFR_MAP: Record<string, string> = {
  easy: 'A1',
  medium: 'A2',
  hard: 'B1',
};

/**
 * 根据正确率估算 CEFR 等级
 */
function estimateCEFRFromAccuracy(
  skill: string,
  accuracy: number,
  questionCount: number
): string {
  // 样本太少时不准确
  if (questionCount < 3) return 'A1';
  
  // 基于正确率和题量估算
  if (accuracy >= 0.9 && questionCount >= 10) return 'B1';
  if (accuracy >= 0.8 && questionCount >= 8) return 'A2';
  if (accuracy >= 0.7 && questionCount >= 5) return 'A2';
  if (accuracy >= 0.5) return 'A1';
  return 'Pre-A1';
}

/**
 * 根据综合能力估算整体 CEFR
 */
function estimateOverallCEFR(skillMasteries: Record<string, number>): string {
  if (Object.keys(skillMasteries).length === 0) return 'A1';
  
  // 听说读写的权重
  const weights: Record<string, number> = {
    reading: 0.3,
    listening: 0.25,
    writing: 0.25,
    speaking: 0.2,
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.entries(skillMasteries).forEach(([skill, mastery]) => {
    const weight = weights[skill] || 0.25;
    weightedSum += mastery * weight;
    totalWeight += weight;
  });
  
  const avgMastery = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  if (avgMastery >= 0.85) return 'B1';
  if (avgMastery >= 0.7) return 'A2';
  if (avgMastery >= 0.5) return 'A1';
  return 'Pre-A1';
}

/**
 * 识别弱项
 */
function identifyWeakPoints(
  skillMasteries: Record<string, number>,
  knowledgeMasteries: Record<string, number>
): { area: string; specific: string; mastery: number; priority: string }[] {
  const weakPoints: { area: string; specific: string; mastery: number; priority: string }[] = [];
  
  // 技能弱项
  Object.entries(skillMasteries).forEach(([skill, mastery]) => {
    if (mastery < 0.6) {
      weakPoints.push({
        area: skill,
        specific: getSkillWeakDescription(skill),
        mastery,
        priority: mastery < 0.4 ? 'high' : 'medium',
      });
    }
  });
  
  // 知识点弱项
  Object.entries(knowledgeMasteries).forEach(([kp, mastery]) => {
    if (mastery < 0.5) {
      weakPoints.push({
        area: 'knowledge',
        specific: kp,
        mastery,
        priority: mastery < 0.3 ? 'high' : 'medium',
      });
    }
  });
  
  // 按优先级排序
  return weakPoints.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }).slice(0, 5);
}

/**
 * 获取技能弱项描述
 */
function getSkillWeakDescription(skill: string): string {
  const descriptions: Record<string, string[]> = {
    reading: ['阅读理解', '细节定位', '主旨概括', '词汇理解'],
    listening: ['听力理解', '连读弱读', '场景词汇', '信息捕捉'],
    writing: ['语法错误', '句型单一', '词汇运用', '篇章结构'],
    speaking: ['发音问题', '流利度', '词汇选择', '语法准确性'],
  };
  const descs = descriptions[skill] || ['基础薄弱'];
  return descs[Math.floor(Math.random() * descs.length)];
}

/**
 * 计算预估词汇量
 */
function estimateVocabularySize(overallCEFR: string, accuracy: number): number {
  const baseVocabulary: Record<string, number> = {
    'Pre-A1': 500,
    'A1': 1000,
    'A2': 1800,
    'B1': 3500,
    'B2': 5500,
    'C1': 8000,
  };
  
  const base = baseVocabulary[overallCEFR] || 1000;
  // 根据正确率微调
  const adjustment = accuracy > 0.8 ? 1.1 : accuracy > 0.6 ? 1.0 : 0.9;
  return Math.round(base * adjustment);
}

/**
 * 诊断速度等级
 */
function diagnoseSpeedLevel(averageTime: number): { level: string; description: string } {
  if (averageTime < 15) {
    return { level: 'fast', description: '反应迅速' };
  } else if (averageTime < 30) {
    return { level: 'moderate', description: '速度适中' };
  } else if (averageTime < 60) {
    return { level: 'slow', description: '需要提速' };
  } else {
    return { level: 'very_slow', description: '建议加强练习' };
  }
}

// ============================================
// API 端点
// ============================================

/**
 * 执行诊断
 * POST /api/v1/diagnosis/run
 * 
 * Body: {
 *   student_id: string,
 *   answers_data?: { skills, knowledge_points, average_time }  // 直接传入数据
 * }
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { student_id, answers_data } = req.body;

    if (!student_id) {
      res.status(400).json({ error: 'student_id is required' });
      return;
    }

    let stats;
    if (answers_data) {
      // 直接传入数据
      stats = answers_data;
    } else {
      // 从 L1 API 获取数据
      try {
        const response = await fetch(`http://localhost:${process.env.PORT || 9091}/api/v1/answers/students/${student_id}/stats`);
        const data = await response.json();
        stats = data.data;
      } catch {
        // 如果无法获取，使用默认数据
        stats = {
          skills: { reading: 0.6 },
          knowledge_points: {},
          average_time: 30,
        };
      }
    }

    const { skills = {}, knowledge_points = {}, average_time = 30 } = stats;

    // 计算各项能力
    const skillsCEFR: Record<string, string> = {};
    Object.entries(skills).forEach(([skill, mastery]) => {
      skillsCEFR[skill] = estimateCEFRFromAccuracy(skill, mastery as number, skills[skill] ? 10 : 3);
    });

    // 整体等级
    const overallAccuracy = Object.values(skills).length > 0
      ? Object.values(skills).reduce((sum, m) => sum + (m as number), 0) / Object.values(skills).length
      : 0.5;
    const cefrOverall = estimateOverallCEFR(skills);

    // 识别弱项
    const weakPoints = identifyWeakPoints(skills, knowledge_points);

    // 词汇量估算
    const vocabularySize = estimateVocabularySize(cefrOverall, overallAccuracy);

    // 速度诊断
    const responseSpeed = diagnoseSpeedLevel(average_time);

    // 计算稳定性（简化版：基于答题数量）
    const totalQuestions = Object.values(skills).reduce((sum, m) => sum + 10, 0);
    const stabilityScore = Math.min(0.9, totalQuestions / 50);

    const diagnosis = {
      student_id,
      diagnosis_timestamp: new Date().toISOString(),
      cefr_overall: cefrOverall,
      skills: skillsCEFR,
      knowledge_mastery: knowledge_points,
      vocabulary_size: vocabularySize,
      response_speed: {
        average_seconds: average_time,
        level: responseSpeed.level,
      },
      stability_score: Math.round(stabilityScore * 100) / 100,
      weak_points: weakPoints,
      diagnosis_confidence: totalQuestions > 20 ? 'high' : totalQuestions > 5 ? 'medium' : 'low',
    };

    res.json({
      success: true,
      data: diagnosis,
    });
  } catch (error) {
    console.error('Error running diagnosis:', error);
    res.status(500).json({ error: 'Failed to run diagnosis' });
  }
});

/**
 * 获取最新诊断结果
 * GET /api/v1/diagnosis/:studentId/latest
 */
router.get('/:studentId/latest', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    // 模拟最新诊断（实际应从数据库查询）
    const mockDiagnosis = {
      student_id: studentId,
      diagnosis_timestamp: new Date().toISOString(),
      cefr_overall: 'A2',
      skills: {
        listening: 'A2',
        reading: 'B1',
        writing: 'A1',
        speaking: 'A2',
      },
      knowledge_mastery: {
        '价格与优惠表达': 0.85,
        '时态用法': 0.42,
        '介词搭配': 0.67,
      },
      vocabulary_size: 1800,
      response_speed: {
        average_seconds: 28,
        level: 'moderate',
      },
      stability_score: 0.78,
      weak_points: [
        { area: 'writing', specific: '时态混用', mastery: 0.35, priority: 'high' },
        { area: 'listening', specific: '连读弱读', mastery: 0.55, priority: 'medium' },
      ],
      diagnosis_confidence: 'medium',
    };

    res.json({
      success: true,
      data: mockDiagnosis,
    });
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    res.status(500).json({ error: 'Failed to fetch diagnosis' });
  }
});

/**
 * 能力趋势分析
 * GET /api/v1/diagnosis/:studentId/history
 */
router.get('/:studentId/history', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    // 模拟历史诊断数据
    const history = [
      {
        date: '2026-04-15',
        cefr_overall: 'A1',
        skills: { listening: 'A1', reading: 'A2', writing: 'A1', speaking: 'A1' },
        accuracy: 0.55,
      },
      {
        date: '2026-04-25',
        cefr_overall: 'A1',
        skills: { listening: 'A2', reading: 'A2', writing: 'A1', speaking: 'A1' },
        accuracy: 0.62,
      },
      {
        date: '2026-05-05',
        cefr_overall: 'A2',
        skills: { listening: 'A2', reading: 'B1', writing: 'A1', speaking: 'A2' },
        accuracy: 0.70,
      },
      {
        date: '2026-05-10',
        cefr_overall: 'A2',
        skills: { listening: 'A2', reading: 'B1', writing: 'A1', speaking: 'A2' },
        accuracy: 0.72,
      },
    ];

    res.json({
      success: true,
      data: {
        student_id: studentId,
        history,
        trend: {
          direction: 'improving',
          cefr_delta: 'A1 → A2',
          accuracy_delta: '+17%',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
