import { Router } from 'express';
import {
  lessons,
  exercises,
  quizzes,
  badges,
  userProgress,
  type UserProgress
} from '../../models/freeCourse';

const router = Router();

// 获取课程分类列表
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'pre-a1', name: 'Pre-A1 入门', level: 'Pre-A1', ageRange: '6-8岁', description: '剑桥少儿英语入门级', icon: '🌟', courseCount: lessons.filter(l => l.id.startsWith('pre-a1')).length },
    { id: 'a1', name: 'A1 基础', level: 'A1', ageRange: '8-10岁', description: '剑桥少儿英语进阶级', icon: '📗', courseCount: lessons.filter(l => l.id.startsWith('a1')).length },
    { id: 'a2', name: 'A2 进阶', level: 'A2', ageRange: '9-12岁', description: '剑桥少儿英语高级', icon: '📘', courseCount: lessons.filter(l => l.id.startsWith('a2')).length },
    { id: 'skill-phonics', name: '自然拼读', level: 'All', ageRange: '5-12岁', description: '字母发音规律训练', icon: '🔤', courseCount: lessons.filter(l => l.id.startsWith('skill-phonics')).length },
    { id: 'skill-reading', name: '阅读技巧', level: 'A1-A2', ageRange: '7-12岁', description: '阅读理解能力培养', icon: '📖', courseCount: lessons.filter(l => l.id.startsWith('skill-reading')).length },
  ];
  res.json({ success: true, data: categories });
});

// 获取课程列表
router.get('/lessons', (req, res) => {
  const { category, level, page = 1, pageSize = 10 } = req.query;
  
  let filtered = [...lessons];
  
  if (category && typeof category === 'string') {
    filtered = filtered.filter(l => l.id.startsWith(category));
  }
  if (level && typeof level === 'string') {
    filtered = filtered.filter(l => l.id.startsWith(level));
  }
  
  const total = filtered.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const end = start + Number(pageSize);
  const data = filtered.slice(start, end);
  
  res.json({
    success: true,
    data: {
      list: data,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    },
  });
});

// 获取课程详情
router.get('/lessons/:id', (req, res) => {
  const lesson = lessons.find(l => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ success: false, error: '课程不存在' });
  }
  res.json({ success: true, data: lesson });
});

// 获取练习题
router.get('/lessons/:id/exercises', (req, res) => {
  const lesson = lessons.find(l => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ success: false, error: '课程不存在' });
  }
  
  // 根据课程类型返回相应练习
  const lessonExercises = exercises.slice(0, 3);
  res.json({ success: true, data: lessonExercises });
});

// 提交练习答案
router.post('/lessons/:id/exercises/submit', (req, res) => {
  const { userId, answers } = req.body;
  
  if (!userId || !answers) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }
  
  let progress = userProgress.get(userId) || {
    userId,
    completedLessons: [],
    completedQuizzes: [],
    earnedBadges: [],
    streakDays: 0,
    lastStudyDate: '',
    totalPoints: 0,
    vocabularyLearned: [],
  };
  
  // 计算得分
  let correctCount = 0;
  answers.forEach((answer: any, index: number) => {
    const exercise = exercises[index];
    if (exercise && answer.answer === exercise.correctAnswer) {
      correctCount++;
      progress.totalPoints += exercise.points;
    }
  });
  
  // 更新进度
  progress.lastStudyDate = new Date().toISOString().split('T')[0];
  userProgress.set(userId, progress);
  
  res.json({
    success: true,
    data: {
      total: exercises.length,
      correct: correctCount,
      score: Math.round((correctCount / exercises.length) * 100),
      pointsEarned: correctCount * 10,
      newBadges: checkBadges(progress),
    },
  });
});

// 获取测验列表
router.get('/quizzes', (req, res) => {
  const { level } = req.query;
  
  let filtered = [...quizzes];
  if (level && typeof level === 'string') {
    filtered = filtered.filter(q => q.id.startsWith(level));
  }
  
  res.json({ success: true, data: filtered });
});

// 获取测验详情
router.get('/quizzes/:id', (req, res) => {
  const quiz = quizzes.find(q => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, error: '测验不存在' });
  }
  res.json({ success: true, data: quiz });
});

// 提交测验答案
router.post('/quizzes/:id/submit', (req, res) => {
  const { userId, answers } = req.body;
  const quiz = quizzes.find(q => q.id === req.params.id);
  
  if (!quiz) {
    return res.status(404).json({ success: false, error: '测验不存在' });
  }
  
  let progress: UserProgress = userProgress.get(userId) || {
    userId,
    completedLessons: [] as string[],
    completedQuizzes: [] as string[],
    earnedBadges: [] as string[],
    streakDays: 0,
    lastStudyDate: '',
    totalPoints: 0,
    vocabularyLearned: [],
  };
  
  // 计算得分
  let correctCount = 0;
  quiz.questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      correctCount++;
    }
  });
  
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;
  
  if (passed) {
    progress.completedQuizzes.push(quiz.id);
    progress.totalPoints += 50;
  }
  
  // 更新连续学习天数
  const today = new Date().toISOString().split('T')[0];
  const lastDate = progress.lastStudyDate;
  if (lastDate) {
    const last = new Date(lastDate);
    const now = new Date(today);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      progress.streakDays++;
    } else if (diffDays > 1) {
      progress.streakDays = 1;
    }
  } else {
    progress.streakDays = 1;
  }
  progress.lastStudyDate = today;
  
  userProgress.set(userId, progress);
  
  res.json({
    success: true,
    data: {
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      passingScore: quiz.passingScore,
      pointsEarned: passed ? 50 : 0,
      newBadges: checkBadges(progress),
    },
  });
});

// 获取徽章列表
router.get('/badges', (req, res) => {
  res.json({ success: true, data: badges });
});

// 获取用户学习进度
router.get('/progress/:userId', (req, res) => {
  const { userId } = req.params;
  const progress = userProgress.get(userId);
  
  if (!progress) {
    return res.json({
      success: true,
      data: {
        userId,
        completedLessons: [],
        completedQuizzes: [],
        earnedBadges: [],
        streakDays: 0,
        lastStudyDate: null,
        totalPoints: 0,
        vocabularyLearned: [],
        unlockedBadges: [],
        recentActivity: [],
      },
    });
  }
  
  // 获取已解锁的徽章
  const unlockedBadges = badges.filter(b => progress.earnedBadges.includes(b.id));
  
  // 获取最近活动
  const recentActivity = [
    ...progress.completedLessons.map(id => ({
      type: 'lesson',
      lessonId: id,
      date: progress.lastStudyDate,
    })),
    ...progress.completedQuizzes.map(id => ({
      type: 'quiz',
      quizId: id,
      date: progress.lastStudyDate,
    })),
  ].slice(-10);
  
  res.json({
    success: true,
    data: {
      ...progress,
      unlockedBadges,
      recentActivity,
    },
  });
});

// 完成课程
router.post('/lessons/:id/complete', (req, res) => {
  const { userId } = req.body;
  const lesson = lessons.find(l => l.id === req.params.id);
  
  if (!lesson) {
    return res.status(404).json({ success: false, error: '课程不存在' });
  }
  
  let progress: UserProgress = userProgress.get(userId) || {
    userId,
    completedLessons: [] as string[],
    completedQuizzes: [] as string[],
    earnedBadges: [] as string[],
    streakDays: 0,
    lastStudyDate: '',
    totalPoints: 0,
    vocabularyLearned: [],
  };
  
  if (!progress.completedLessons.includes(lesson.id)) {
    progress.completedLessons.push(lesson.id);
    progress.totalPoints += 20;
  }
  
  // 更新连续学习
  const today = new Date().toISOString().split('T')[0];
  const lastDate = progress.lastStudyDate;
  if (lastDate) {
    const last = new Date(lastDate);
    const now = new Date(today);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      progress.streakDays++;
    } else if (diffDays > 1) {
      progress.streakDays = 1;
    }
  } else {
    progress.streakDays = 1;
  }
  progress.lastStudyDate = today;
  
  userProgress.set(userId, progress);
  
  res.json({
    success: true,
    data: {
      completedLessons: progress.completedLessons.length,
      totalPoints: progress.totalPoints,
      newBadges: checkBadges(progress),
    },
  });
});

// 获取排行榜
router.get('/leaderboard', (req, res) => {
  const { period = 'week' } = req.query;
  
  // 模拟排行榜数据
  const leaderboard = [
    { rank: 1, userId: 'user001', nickname: '小明', avatar: 'https://i.pravatar.cc/100?img=1', points: 2580, streak: 45 },
    { rank: 2, userId: 'user002', nickname: '小红', avatar: 'https://i.pravatar.cc/100?img=2', points: 2340, streak: 38 },
    { rank: 3, userId: 'user003', nickname: '小华', avatar: 'https://i.pravatar.cc/100?img=3', points: 2100, streak: 30 },
    { rank: 4, userId: 'user004', nickname: '小丽', avatar: 'https://i.pravatar.cc/100?img=4', points: 1890, streak: 25 },
    { rank: 5, userId: 'user005', nickname: '小强', avatar: 'https://i.pravatar.cc/100?img=5', points: 1650, streak: 20 },
  ];
  
  res.json({ success: true, data: leaderboard });
});

// 检查徽章解锁
function checkBadges(progress: UserProgress): any[] {
  const newBadges: any[] = [];
  
  badges.forEach(badge => {
    if (progress.earnedBadges.includes(badge.id)) return;
    
    let earned = false;
    switch (badge.criteria.type) {
      case 'lessons_completed':
        earned = progress.completedLessons.length >= badge.criteria.count;
        break;
      case 'quiz_passed':
        earned = progress.completedQuizzes.length >= badge.criteria.count;
        break;
      case 'streak_days':
        earned = progress.streakDays >= badge.criteria.count;
        break;
      case 'vocabulary_learned':
        earned = progress.vocabularyLearned.length >= badge.criteria.count;
        break;
    }
    
    if (earned) {
      progress.earnedBadges.push(badge.id);
      newBadges.push(badge);
    }
  });
  
  return newBadges;
}

export default router;

// ============== 徽章成就系统 ==============

router.get('/achievements/list', (req: any, res: any) => {
  const badges = [
    { id: 'b1', code: 'FIRST_LESSON', name: '初次学习', description: '完成第一节免费课', icon: '🎯', condition: { type: 'lessons_completed', count: 1 }, unlocked: false },
    { id: 'b2', code: 'FIVE_LESSONS', name: '学习达人', description: '完成5节免费课', icon: '📚', condition: { type: 'lessons_completed', count: 5 }, unlocked: false },
    { id: 'b3', code: 'TEN_LESSONS', name: '学习标兵', description: '完成10节免费课', icon: '🏆', condition: { type: 'lessons_completed', count: 10 }, unlocked: false },
    { id: 'b4', code: 'FIRST_QUIZ', name: '测验新手', description: '完成第一次小测验', icon: '✍️', condition: { type: 'quizzes_completed', count: 1 }, unlocked: false },
    { id: 'b5', code: 'PERFECT_QUIZ', name: '满分达成', description: '小测验获得满分', icon: '💯', condition: { type: 'perfect_quiz', count: 1 }, unlocked: false },
    { id: 'b6', code: 'SEVEN_DAY_STREAK', name: '连续7天', description: '连续学习7天', icon: '🔥', condition: { type: 'streak_days', count: 7 }, unlocked: false },
    { id: 'b7', code: 'THIRTY_DAY_STREAK', name: '坚持不懈', description: '连续学习30天', icon: '⭐', condition: { type: 'streak_days', count: 30 }, unlocked: false },
    { id: 'b8', code: 'A1_MASTER', name: 'A1级别大师', description: '词汇量达到1000', icon: '🌟', condition: { type: 'vocabulary_size', count: 1000 }, unlocked: false },
    { id: 'b9', code: 'A2_MASTER', name: 'A2级别大师', description: '词汇量达到2500', icon: '💎', condition: { type: 'vocabulary_size', count: 2500 }, unlocked: false },
    { id: 'b10', code: 'B1_MASTER', name: 'B1级别大师', description: '词汇量达到3500', icon: '👑', condition: { type: 'vocabulary_size', count: 3500 }, unlocked: false },
  ];
  res.json({ success: true, data: badges });
});
