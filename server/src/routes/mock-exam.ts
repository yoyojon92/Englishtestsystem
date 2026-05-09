import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

/**
 * 模拟考试题目数据结构
 */
interface MockQuestion {
  questionId: string;
  type: 'reading' | 'listening' | 'writing' | 'speaking';
  part: number;
  content: {
    text?: string;
    audio?: string;
    image?: string;
    options?: string[];
  };
  answer?: string | string[];
  maxScore: number;
  timeLimit: number; // 秒
}

// 模拟考试配置
const MOCK_EXAM_CONFIG = {
  KET: {
    name: 'KET 模拟考试',
    duration: {
      reading: 60 * 60,      // 60分钟
      writing: 0,             // Reading & Writing 合并
      listening: 30 * 60,     // 30分钟
      speaking: 10 * 60,      // 8-10分钟
    },
    totalScore: 100,
    passingScore: 60,
  },
  PET: {
    name: 'PET 模拟考试',
    duration: {
      reading: 45 * 60,       // 45分钟
      writing: 45 * 60,       // 45分钟
      listening: 30 * 60,     // 30分钟
      speaking: 12 * 60,      // 10-12分钟
    },
    totalScore: 100,
    passingScore: 60,
  },
};

/**
 * 生成模拟考试题目
 */
function generateMockQuestions(examType: string): MockQuestion[] {
  const questions: MockQuestion[] = [];

  if (examType === 'KET' || examType === 'PET') {
    // Reading Part 1-5
    for (let part = 1; part <= 5; part++) {
      for (let q = 1; q <= 5; q++) {
        questions.push({
          questionId: `R${part}-${q}`,
          type: 'reading',
          part,
          content: {
            text: `Sample reading text for Part ${part}, Question ${q}. This is a ${examType} exam question.`,
            options: ['A', 'B', 'C', 'D'],
          },
          maxScore: 5,
          timeLimit: 60,
        });
      }
    }

    // Listening Part 1-4
    for (let part = 1; part <= 4; part++) {
      for (let q = 1; q <= 5; q++) {
        questions.push({
          questionId: `L${part}-${q}`,
          type: 'listening',
          part,
          content: {
            audio: `/audio/${examType}/listening/part${part}_q${q}.mp3`,
          },
          maxScore: 5,
          timeLimit: 30,
        });
      }
    }

    // Writing Part 1-2 (PET only has Part 1-2, KET has only Part 6-7)
    const writingParts = examType === 'KET' ? [6, 7] : [1, 2];
    for (const part of writingParts) {
      questions.push({
        questionId: `W${part}`,
        type: 'writing',
        part,
        content: {
          text: part === 1 
            ? 'Write 20-35 words about the picture.'
            : 'Write 25-35 words responding to the message.',
        },
        maxScore: examType === 'KET' ? 15 : 20,
        timeLimit: examType === 'KET' ? 10 * 60 : 20 * 60,
      });
    }
  }

  return questions;
}

/**
 * GET /api/v1/mock-exam/config/:examType
 * 获取模拟考试配置
 */
router.get('/config/:examType', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { examType } = req.params;
    const config = MOCK_EXAM_CONFIG[examType as keyof typeof MOCK_EXAM_CONFIG];

    if (!config) {
      return res.status(404).json({ error: 'Exam type not found' });
    }

    return res.json({
      success: true,
      data: {
        examType,
        config,
      },
    });
  } catch (error: any) {
    console.error('Get mock exam config error:', error);
    return res.status(500).json({ error: 'Failed to get exam config' });
  }
});

/**
 * POST /api/v1/mock-exam/start
 * 开始模拟考试
 */
router.post('/start', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { examType, childId } = req.body;

    if (!examType || !childId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const config = MOCK_EXAM_CONFIG[examType as keyof typeof MOCK_EXAM_CONFIG];
    if (!config) {
      return res.status(404).json({ error: 'Exam type not found' });
    }

    // 生成考试ID和题目
    const examId = `MOCK-${examType}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const questions = generateMockQuestions(examType);
    const totalTime = Object.values(config.duration).reduce((a, b) => a + b, 0);

    return res.json({
      success: true,
      data: {
        examId,
        examType,
        childId,
        questions,
        config: {
          ...config,
          totalTime,
          questionCount: questions.length,
        },
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + totalTime * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Start mock exam error:', error);
    return res.status(500).json({ error: 'Failed to start exam' });
  }
});

/**
 * POST /api/v1/mock-exam/submit
 * 提交模拟考试答案
 */
router.post('/submit', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { examId, examType, answers, timeSpent } = req.body;

    if (!examId || !answers) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const config = MOCK_EXAM_CONFIG[examType as keyof typeof MOCK_EXAM_CONFIG];
    if (!config) {
      return res.status(404).json({ error: 'Exam type not found' });
    }

    // 计算分数（模拟评分，实际需要AI或人工评分）
    const scores = calculateMockScores(answers, examType);

    // 生成详细分析
    const analysis = generateAnalysis(scores, answers);

    // 计算通过置信度
    const passConfidence = calculatePassConfidence(scores, examType);

    return res.json({
      success: true,
      data: {
        examId,
        scores: {
          reading: scores.reading,
          listening: scores.listening,
          writing: scores.writing,
          speaking: scores.speaking,
          total: scores.total,
          max: config.totalScore,
        },
        predictedGrade: getPredictedGrade(scores.total, config.passingScore),
        passConfidence,
        isPassReady: passConfidence >= 85,
        analysis,
        timeSpent,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Submit mock exam error:', error);
    return res.status(500).json({ error: 'Failed to submit exam' });
  }
});

/**
 * 计算模拟分数
 */
function calculateMockScores(answers: Record<string, any>, examType: string) {
  // 简化模拟评分逻辑
  const baseScore = 60 + Math.random() * 30;
  const reading = Math.round((baseScore * 0.35 + Math.random() * 10) * 100) / 100;
  const listening = Math.round((baseScore * 0.3 + Math.random() * 10) * 100) / 100;
  const writing = Math.round((baseScore * 0.2 + Math.random() * 10) * 100) / 100;
  const speaking = Math.round((baseScore * 0.15 + Math.random() * 10) * 100) / 100;
  
  const total = Math.round((reading + listening + writing + speaking) * 100) / 100;

  return {
    reading: Math.min(100, Math.max(0, reading)),
    listening: Math.min(100, Math.max(0, listening)),
    writing: Math.min(100, Math.max(0, writing)),
    speaking: Math.min(100, Math.max(0, speaking)),
    total,
  };
}

/**
 * 生成详细分析
 */
function generateAnalysis(scores: Record<string, number>, answers: Record<string, any>) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (scores.reading >= 70) {
    strengths.push('阅读理解能力强，能准确把握文章主旨');
  } else {
    weaknesses.push('阅读理解需要加强，建议多练习泛读');
    recommendations.push('每天阅读2篇英语短文，注意总结文章大意');
  }

  if (scores.listening >= 70) {
    strengths.push('听力理解较好，能捕捉关键信息');
  } else {
    weaknesses.push('听力需要加强，对细节把握不足');
    recommendations.push('每天听15分钟英语材料，可以先听再读');
  }

  if (scores.writing >= 70) {
    strengths.push('写作表达能力较好');
  } else {
    weaknesses.push('写作需要提升，句式变化不足');
    recommendations.push('背诵常用句型，练习写简短段落');
  }

  if (scores.speaking >= 70) {
    strengths.push('口语表达流利，发音清晰');
  } else {
    weaknesses.push('口语需要加强，流利度和发音需改进');
    recommendations.push('每天跟读5分钟，注意模仿语音语调');
  }

  return {
    strengths,
    weaknesses,
    recommendations,
    detailedFeedback: generateDetailedFeedback(scores),
  };
}

/**
 * 生成详细反馈
 */
function generateDetailedFeedback(scores: Record<string, number>) {
  const parts = [];

  parts.push({
    skill: 'reading',
    score: scores.reading,
    feedback: `阅读部分得分${scores.reading.toFixed(1)}分。${
      scores.reading >= 80 ? '表现优秀，已达到考试要求水平。' :
      scores.reading >= 60 ? '基本达到要求，建议继续巩固。' :
      '需要加强基础训练。'
    }`,
  });

  parts.push({
    skill: 'listening',
    score: scores.listening,
    feedback: `听力部分得分${scores.listening.toFixed(1)}分。${
      scores.listening >= 80 ? '听力理解能力强。' :
      scores.listening >= 60 ? '听力尚可，需注意细节。' :
      '建议增加听力训练时间。'
    }`,
  });

  parts.push({
    skill: 'writing',
    score: scores.writing,
    feedback: `写作部分得分${scores.writing.toFixed(1)}分。${
      scores.writing >= 80 ? '写作功底扎实。' :
      scores.writing >= 60 ? '写作基本合格，需注意文章结构。' :
      '建议加强写作模板和句型练习。'
    }`,
  });

  parts.push({
    skill: 'speaking',
    score: scores.speaking,
    feedback: `口语部分得分${scores.speaking.toFixed(1)}分。${
      scores.speaking >= 80 ? '口语表达自然流畅。' :
      scores.speaking >= 60 ? '口语基本达标，注意发音。' :
      '建议多进行口语练习。'
    }`,
  });

  return parts;
}

/**
 * 计算通过置信度
 */
function calculatePassConfidence(scores: Record<string, number>, examType: string): number {
  const passingScore = MOCK_EXAM_CONFIG[examType as keyof typeof MOCK_EXAM_CONFIG]?.passingScore || 60;
  const total = scores.total;

  if (total >= passingScore + 20) return 95;
  if (total >= passingScore + 15) return 88;
  if (total >= passingScore + 10) return 80;
  if (total >= passingScore + 5) return 72;
  if (total >= passingScore) return 65;
  if (total >= passingScore - 10) return 50;
  if (total >= passingScore - 20) return 35;
  return 20;
}

/**
 * 获取预测等级
 */
function getPredictedGrade(score: number, passingScore: number): string {
  if (score >= passingScore + 20) return 'Distinction';
  if (score >= passingScore + 10) return 'Merit';
  if (score >= passingScore) return 'Pass';
  if (score >= passingScore - 15) return 'Level A1';
  return 'Fail';
}

/**
 * GET /api/v1/mock-exam/history/:childId
 * 获取模拟考试历史记录
 */
router.get('/history/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;
    const { examType, page = 1, pageSize = 10 } = req.query;

    // 模拟历史数据
    const history = [];
    const examTypes = examType ? [examType] : ['KET', 'PET'];
    
    for (let i = 0; i < 5; i++) {
      const type = examTypes[Math.floor(Math.random() * examTypes.length)];
      const config = MOCK_EXAM_CONFIG[type as keyof typeof MOCK_EXAM_CONFIG];
      const total = 50 + Math.random() * 40;
      
      history.push({
        examId: `MOCK-${type}-${Date.now() - i * 7 * 24 * 60 * 60 * 1000}`,
        examType: type,
        examDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        scores: {
          reading: Math.round((50 + Math.random() * 40) * 100) / 100,
          listening: Math.round((50 + Math.random() * 40) * 100) / 100,
          writing: Math.round((50 + Math.random() * 40) * 100) / 100,
          speaking: Math.round((50 + Math.random() * 40) * 100) / 100,
          total: Math.round(total * 100) / 100,
        },
        predictedGrade: getPredictedGrade(total, config.passingScore),
        passConfidence: calculatePassConfidence({ total }, type),
      });
    }

    return res.json({
      success: true,
      data: {
        list: history,
        total: history.length,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
    });
  } catch (error: any) {
    console.error('Get mock exam history error:', error);
    return res.status(500).json({ error: 'Failed to get history' });
  }
});

/**
 * GET /api/v1/mock-exam/compare/:childId
 * 对比历史考试进步情况
 */
router.get('/compare/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;
    const { examType } = req.query;

    // 模拟对比数据
    const history = [];
    const baseScore = 55;
    
    for (let i = 0; i < 4; i++) {
      const improvement = i * 5 + Math.random() * 3;
      history.push({
        examId: `MOCK-${examType || 'KET'}-${Date.now() - (4 - i) * 7 * 24 * 60 * 60 * 1000}`,
        examDate: new Date(Date.now() - (4 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalScore: Math.round((baseScore + improvement) * 100) / 100,
        improvement: i === 0 ? 0 : Math.round(improvement * 100) / 100,
      });
    }

    const latestScore = history[history.length - 1].totalScore;
    const firstScore = history[0].totalScore;
    const totalImprovement = Math.round((latestScore - firstScore) * 100) / 100;

    return res.json({
      success: true,
      data: {
        history,
        summary: {
          firstScore,
          latestScore,
          totalImprovement,
          averageImprovement: Math.round((totalImprovement / 3) * 100) / 100,
          trend: totalImprovement > 0 ? 'improving' : totalImprovement < 0 ? 'declining' : 'stable',
        },
      },
    });
  } catch (error: any) {
    console.error('Compare mock exams error:', error);
    return res.status(500).json({ error: 'Failed to compare exams' });
  }
});

/**
 * POST /api/v1/mock-exam/practice
 * 获取专项练习题目
 */
router.post('/practice', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { skill, level, count = 10 } = req.body;

    if (!skill) {
      return res.status(400).json({ error: 'Missing skill parameter' });
    }

    const practiceQuestions: MockQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      practiceQuestions.push({
        questionId: `PRACTICE-${skill.toUpperCase()}-${Date.now()}-${i}`,
        type: skill as 'reading' | 'listening' | 'writing' | 'speaking',
        part: 0,
        content: {
          text: `专项练习题目 ${i + 1}，难度：${level || '中等'}`,
          options: ['A. 选项一', 'B. 选项二', 'C. 选项三', 'D. 选项四'],
        },
        maxScore: 10,
        timeLimit: skill === 'listening' ? 30 : 60,
      });
    }

    return res.json({
      success: true,
      data: {
        practiceId: `PRACTICE-${skill}-${Date.now()}`,
        questions: practiceQuestions,
        skill,
        level: level || 'intermediate',
        estimatedTime: practiceQuestions.length * 60,
      },
    });
  } catch (error: any) {
    console.error('Get practice questions error:', error);
    return res.status(500).json({ error: 'Failed to get practice questions' });
  }
});

export default router;
