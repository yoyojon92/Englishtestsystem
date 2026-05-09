import { assessments, assessmentQuestions, assessmentReports, generateId } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import express, { Router, type Response } from 'express';

interface AuthRequest extends Record<string, any> {
  userId?: string;
  userRole?: string;
}

const router = Router();

// Sample assessment questions by Cambridge level
const sampleQuestions: Omit<typeof assessmentQuestions[0], 'id'>[] = [
  // Pre-A1 (Starters) - Listening & Reading
  {
    assessmentType: 'initial',
    cambridgeLevel: 'Pre-A1',
    category: 'listening',
    difficulty: 1,
    question: 'Listen and point to the correct picture: "This is a red ball."',
    options: ['Red ball', 'Blue ball', 'Green ball'],
    correctAnswer: 'Red ball',
    explanation: 'The audio says "red ball", so you point to the red ball.',
    audioUrl: '/uploads/audio/pre-a1-1.mp3'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'Pre-A1',
    category: 'listening',
    difficulty: 1,
    question: 'Listen and point: "The cat is under the table."',
    options: ['Cat under table', 'Dog under chair', 'Cat on table'],
    correctAnswer: 'Cat under table',
    explanation: 'The cat is located under the table.',
    audioUrl: '/uploads/audio/pre-a1-2.mp3'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'Pre-A1',
    category: 'reading',
    difficulty: 1,
    question: 'Which word means a yellow fruit?',
    options: ['Apple', 'Banana', 'Orange'],
    correctAnswer: 'Banana',
    explanation: 'A banana is a yellow fruit.'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'Pre-A1',
    category: 'reading',
    difficulty: 1,
    question: 'Choose the correct word: "I ___ a boy."',
    options: ['is', 'am', 'are'],
    correctAnswer: 'am',
    explanation: 'We use "am" with the pronoun "I".'
  },
  // A1 (Movers)
  {
    assessmentType: 'initial',
    cambridgeLevel: 'A1',
    category: 'listening',
    difficulty: 2,
    question: 'Listen and answer: "What time does the class start?" "It starts at ___."',
    options: ['9 o\'clock', '10 o\'clock', '11 o\'clock'],
    correctAnswer: '9 o\'clock',
    explanation: 'The class starts at 9 o\'clock.',
    audioUrl: '/uploads/audio/a1-1.mp3'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'A1',
    category: 'reading',
    difficulty: 2,
    question: 'Read and choose: "She ___ to school every day."',
    options: ['go', 'goes', 'going'],
    correctAnswer: 'goes',
    explanation: 'With he/she/it, we add -es to the verb.'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'A1',
    category: 'writing',
    difficulty: 2,
    question: 'Write a sentence about your family (at least 5 words):',
    correctAnswer: 'I have a big family.',
    explanation: 'A basic sentence about family.'
  },
  // A2 (Flyers/KET)
  {
    assessmentType: 'initial',
    cambridgeLevel: 'A2',
    category: 'listening',
    difficulty: 3,
    question: 'Listen and choose the correct answer: "Where did Maria go on vacation?"',
    options: ['Beach', 'Mountain', 'City'],
    correctAnswer: 'Beach',
    explanation: 'Maria went to the beach for vacation.',
    audioUrl: '/uploads/audio/a2-1.mp3'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'A2',
    category: 'reading',
    difficulty: 3,
    question: 'Read the text and answer: "What is the main topic?"\n\n"Yesterday was my birthday. My family gave me a new bicycle. I was very happy!"',
    options: ['A birthday party', 'A new bicycle', 'Family dinner'],
    correctAnswer: 'A new bicycle',
    explanation: 'The text mainly talks about receiving a bicycle as a birthday gift.'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'A2',
    category: 'writing',
    difficulty: 3,
    question: 'Write a short paragraph about your best friend (8-10 sentences):',
    correctAnswer: 'My best friend is Li Ming...',
    explanation: 'A paragraph describing a friend.'
  },
  // B1 (PET)
  {
    assessmentType: 'initial',
    cambridgeLevel: 'B1',
    category: 'reading',
    difficulty: 3,
    question: 'Read the article and answer:\n\n"The new shopping mall opens next week. It has 200 stores and a big cinema. The opening ceremony will be at 10 AM."\n\nWhat can we learn from the text?',
    options: [
      'The mall has 200 restaurants',
      'The cinema is very small',
      'The mall will open next week'
    ],
    correctAnswer: 'The mall will open next week',
    explanation: 'The text clearly states "opens next week".'
  },
  {
    assessmentType: 'initial',
    cambridgeLevel: 'B1',
    category: 'writing',
    difficulty: 3,
    question: 'Write a formal email to your teacher asking for leave:',
    correctAnswer: 'Dear Mr./Ms....',
    explanation: 'A formal email format with proper greeting and request.'
  }
];

// Initialize sample questions
sampleQuestions.forEach(q => {
  assessmentQuestions.push({ ...q, id: generateId() });
});

// Get assessment types and levels
router.get('/levels', (req, res: Response) => {
  res.json({
    levels: [
      { 
        code: 'Pre-A1', 
        name: 'Pre-A1 (Starters)', 
        age: '7-8',
        description: '适合零基础至小学一年级学生',
        examType: 'Cambridge Young Learners Starters'
      },
      { 
        code: 'A1', 
        name: 'A1 (Movers)', 
        age: '8-10',
        description: '适合完成Pre-A1测评的学生',
        examType: 'Cambridge Young Learners Movers'
      },
      { 
        code: 'A2', 
        name: 'A2 (Flyers/KET)', 
        age: '10-12',
        description: '适合小学高年级学生',
        examType: 'Cambridge Young Learners Flyers / KET'
      },
      { 
        code: 'B1', 
        name: 'B1 (PET)', 
        age: '12-15',
        description: '适合初中学生',
        examType: 'Cambridge Preliminary English Test (PET)'
      },
      { 
        code: 'B2', 
        name: 'B2 (FCE)', 
        age: '15+',
        description: '适合高中学生',
        examType: 'Cambridge First Certificate in English (FCE)'
      }
    ]
  });
});

// Start a new assessment
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { type, cambridgeLevel } = req.body;
    const userId = req.userId!;
    
    const assessment: typeof assessments[0] = {
      id: generateId(),
      userId,
      type: type || 'initial',
      cambridgeLevel,
      status: 'in_progress',
      totalQuestions: 10,
      answeredQuestions: 0,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    assessments.push(assessment);
    res.status(201).json({ 
      message: 'Assessment started',
      assessment 
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
});

// Get assessment questions
router.get('/:id/questions', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = assessments.find(a => a.id === id && a.userId === req.userId);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    // Get questions based on level and type
    const questions = assessmentQuestions
      .filter(q => 
        (q.assessmentType === assessment.type || q.assessmentType === 'initial') &&
        (!assessment.cambridgeLevel || q.cambridgeLevel === assessment.cambridgeLevel || 
         (q.cambridgeLevel && 
          ['Pre-A1', 'A1', 'A2', 'B1', 'B2'].indexOf(q.cambridgeLevel) <= 
          ['Pre-A1', 'A1', 'A2', 'B1', 'B2'].indexOf(assessment.cambridgeLevel!)))
      )
      .slice(0, assessment.totalQuestions)
      .map(({ correctAnswer, ...q }) => q); // Remove correct answer from response
    
    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Submit assessment answers
router.post('/:id/submit', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // { questionId: answer }
    
    const assessmentIndex = assessments.findIndex(a => a.id === id && a.userId === req.userId);
    
    if (assessmentIndex === -1) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const assessment = assessments[assessmentIndex];
    
    // Calculate score
    let correctCount = 0;
    const totalQuestions = Object.keys(answers).length;
    
    Object.entries(answers).forEach(([questionId, userAnswer]) => {
      const question = assessmentQuestions.find(q => q.id === questionId);
      if (question && question.correctAnswer === userAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // Update assessment
    assessment.status = 'completed';
    assessment.score = score;
    assessment.answeredQuestions = totalQuestions;
    assessment.completedAt = new Date().toISOString();
    
    // Generate report
    const levelScores = {
      listening: Math.round(score * (0.8 + Math.random() * 0.4)),
      reading: Math.round(score * (0.8 + Math.random() * 0.4)),
      writing: Math.round(score * (0.7 + Math.random() * 0.5)),
      speaking: Math.round(score * (0.7 + Math.random() * 0.5))
    };
    
    const report: typeof assessmentReports[0] = {
      id: generateId(),
      userId: req.userId!,
      assessmentId: id,
      cambridgeLevel: assessment.cambridgeLevel!,
      overallScore: score,
      listeningScore: levelScores.listening,
      readingScore: levelScores.reading,
      writingScore: levelScores.writing,
      speakingScore: levelScores.speaking,
      strengths: getStrengths(levelScores),
      weaknesses: getWeaknesses(levelScores),
      recommendations: getRecommendations(score, assessment.cambridgeLevel!),
      nextSteps: getNextSteps(score, assessment.cambridgeLevel!),
      comparedPeers: {
        percentile: Math.round(30 + Math.random() * 50),
        average: Math.round(60 + Math.random() * 20)
      },
      createdAt: new Date().toISOString()
    };
    
    assessmentReports.push(report);
    
    res.json({ 
      message: 'Assessment completed',
      score,
      report
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// Get assessment history
router.get('/history', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userAssessments = assessments
      .filter(a => a.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ assessments: userAssessments });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get assessment report
router.get('/:id/report', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const report = assessmentReports.find(r => 
      r.assessmentId === id && r.userId === req.userId
    );
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Helper functions
function getStrengths(scores: { listening: number; reading: number; writing: number; speaking: number }): string[] {
  const strengths: string[] = [];
  if (scores.listening >= 80) strengths.push('听力理解能力优秀，能够准确捕捉日常对话要点');
  if (scores.reading >= 80) strengths.push('阅读理解能力强，能够快速获取文章主旨');
  if (scores.writing >= 80) strengths.push('书面表达能力扎实，语法结构准确');
  if (scores.speaking >= 80) strengths.push('口语表达流畅，发音清晰自然');
  if (strengths.length === 0) strengths.push('整体表现良好，有继续提升的空间');
  return strengths;
}

function getWeaknesses(scores: { listening: number; reading: number; writing: number; speaking: number }): string[] {
  const weaknesses: string[] = [];
  if (scores.listening < 70) weaknesses.push('听力训练需要加强，建议多听英语原版材料');
  if (scores.reading < 70) weaknesses.push('阅读速度有待提升，需要扩大词汇量');
  if (scores.writing < 70) weaknesses.push('写作表达需要练习，注意句型多样化');
  if (scores.speaking < 70) weaknesses.push('口语输出需要更多练习机会');
  if (weaknesses.length === 0) weaknesses.push('各能力发展较为均衡');
  return weaknesses;
}

function getRecommendations(score: number, level: string): string[] {
  if (score >= 90) {
    return [
      `已达到${level}水平，可以准备参加剑桥官方考试`,
      '建议开始学习下一级别内容',
      '可以参加模拟考试熟悉题型'
    ];
  } else if (score >= 70) {
    return [
      '词汇量需要进一步扩充',
      '建议加强语法专项训练',
      '多进行读写练习提升综合能力'
    ];
  } else {
    return [
      '建议从基础内容重新学习',
      '加强词汇和语法薄弱环节',
      '增加英语浸泡时间，多听多读'
    ];
  }
}

function getNextSteps(score: number, level: string): string[] {
  if (score >= 90) {
    return [`进入${getNextLevel(level)}级别学习`, '报名参加剑桥官方考试', '完成考前冲刺课程'];
  } else if (score >= 70) {
    return ['完成当前级别强化课程', '词汇量达到2000+', '开始真题训练'];
  } else {
    return ['完成基础入门课程', '建立英语学习习惯', '每日坚持30分钟学习'];
  }
}

function getNextLevel(current: string): string {
  const levels = ['Pre-A1', 'A1', 'A2', 'B1', 'B2'];
  const index = levels.indexOf(current);
  return index < levels.length - 1 ? levels[index + 1] : 'FCE';
}

export default router;
