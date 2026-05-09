import { Router } from 'express';

const router = Router();

// ============== 学员能力画像数据 ==============

// 学员画像概览
const profilesOverview = {
  c1: {
    childId: 'c1',
    childName: '张小明',
    age: 9,
    currentLevel: 'A1',
    vocabularySize: 850,
    cefrLevel: 'A1',
    overallScore: 78,
    strengths: ['listening', 'pronunciation'],
    weaknesses: ['writing', 'grammar'],
    lastUpdated: new Date().toISOString(),
  },
  c2: {
    childId: 'c2',
    childName: '李小红',
    age: 10,
    currentLevel: 'A2',
    vocabularySize: 1200,
    cefrLevel: 'A2',
    overallScore: 82,
    strengths: ['reading', 'vocabulary'],
    weaknesses: ['speaking', 'listening'],
    lastUpdated: new Date().toISOString(),
  },
};

// 能力雷达图数据
const radarData = {
  c1: {
    childId: 'c1',
    dimensions: [
      { dimension: '听力', score: 85, maxScore: 100 },
      { dimension: '口语', score: 72, maxScore: 100 },
      { dimension: '阅读', score: 78, maxScore: 100 },
      { dimension: '写作', score: 65, maxScore: 100 },
      { dimension: '词汇', score: 82, maxScore: 100 },
      { dimension: '语法', score: 68, maxScore: 100 },
    ],
    overallLevel: 'A1',
    trend: 'up', // up, down, stable
  },
  c2: {
    childId: 'c2',
    dimensions: [
      { dimension: '听力', score: 70, maxScore: 100 },
      { dimension: '口语', score: 68, maxScore: 100 },
      { dimension: '阅读', score: 88, maxScore: 100 },
      { dimension: '写作', score: 75, maxScore: 100 },
      { dimension: '词汇', score: 90, maxScore: 100 },
      { dimension: '语法', score: 80, maxScore: 100 },
    ],
    overallLevel: 'A2',
    trend: 'up',
  },
};

// 听说读写趋势数据
const skillTrends = {
  c1: {
    childId: 'c1',
    months: ['9月', '10月', '11月', '12月', '1月', '2月'],
    listening: [70, 72, 75, 78, 82, 85],
    speaking: [60, 62, 65, 68, 70, 72],
    reading: [65, 68, 70, 73, 76, 78],
    writing: [55, 58, 60, 62, 64, 65],
    vocabulary: [500, 580, 650, 720, 790, 850],
    grammar: [50, 55, 58, 62, 65, 68],
  },
  c2: {
    childId: 'c2',
    months: ['9月', '10月', '11月', '12月', '1月', '2月'],
    listening: [65, 66, 68, 68, 69, 70],
    speaking: [58, 60, 62, 64, 66, 68],
    reading: [75, 78, 80, 82, 85, 88],
    writing: [65, 68, 70, 72, 74, 75],
    vocabulary: [800, 880, 950, 1020, 1100, 1200],
    grammar: [68, 72, 75, 77, 79, 80],
  },
};

// 词汇地图数据
const vocabularyMap = {
  c1: {
    childId: 'c1',
    totalWords: 850,
    masteredWords: 680,
    learningWords: 120,
    newWords: 50,
    categories: [
      { category: '日常用语', total: 200, mastered: 180, level: 'excellent' },
      { category: '食物饮料', total: 150, mastered: 130, level: 'good' },
      { category: '动物世界', total: 100, mastered: 85, level: 'good' },
      { category: '颜色数字', total: 80, mastered: 75, level: 'excellent' },
      { category: '家庭成员', total: 50, mastered: 45, level: 'excellent' },
      { category: '学校生活', total: 120, mastered: 80, level: 'normal' },
      { category: '天气季节', total: 60, mastered: 40, level: 'normal' },
      { category: '兴趣爱好', total: 90, mastered: 45, level: 'weak' },
    ],
  },
};

// 发音档案
const pronunciationProfile = {
  c1: {
    childId: 'c1',
    overallScore: 82,
    phonemeAccuracy: 85,
    intonation: 78,
    fluency: 80,
    stress: 75,
    commonMistakes: [
      { sound: 'th', correct: 'think', mistake: 'tink', frequency: 'high' },
      { sound: 'r/l', correct: 'rabbit', mistake: 'labbit', frequency: 'medium' },
      { sound: 'v', correct: 'very', mistake: 'wery', frequency: 'low' },
    ],
    recentPractice: [
      { date: '2024-02-01', words: 15, accuracy: 80 },
      { date: '2024-02-03', words: 20, accuracy: 82 },
      { date: '2024-02-05', words: 18, accuracy: 85 },
    ],
  },
};

// 学习习惯分析
const learningHabits = {
  c1: {
    childId: 'c1',
    weeklyStudyTime: 4.5, // 小时
    preferredTime: 'after_dinner',
    studyStreak: 15, // 天
    longestStreak: 21,
    preferredContent: ['videos', 'songs', 'games'],
    engagement: {
      daily: 85, // 百分比
      weekly: 90,
      monthly: 88,
    },
    strengths: [
      '学习积极主动',
      '喜欢跟读练习',
      '对新单词充满好奇',
    ],
    improvements: [
      '建议增加写作练习时间',
      '语法学习需要加强',
      '可以尝试更多阅读材料',
    ],
    weeklyPattern: {
      monday: 0.5,
      tuesday: 0.8,
      wednesday: 0.5,
      thursday: 0.6,
      friday: 0.4,
      saturday: 1.2,
      sunday: 0.5,
    },
  },
};

// 学习路径
const learningPaths = {
  c1: {
    childId: 'c1',
    currentLevel: 'A1',
    targetLevel: 'A2',
    targetDate: '2024-08-01',
    milestones: [
      { id: 'm1', name: 'A1 词汇巩固', progress: 85, status: 'in_progress' },
      { id: 'm2', name: '基础语法掌握', progress: 60, status: 'in_progress' },
      { id: 'm3', name: '简单句写作', progress: 40, status: 'pending' },
      { id: 'm4', name: 'A2 词汇入门', progress: 0, status: 'pending' },
      { id: 'm5', name: 'A2 听说训练', progress: 0, status: 'pending' },
    ],
    recommendedCourses: [
      { id: 'course1', name: 'A1 语法精讲', reason: '语法基础需要加强', priority: 1 },
      { id: 'course2', name: '看图写作入门', reason: '提升写作能力', priority: 2 },
      { id: 'course3', name: 'A2 词汇速记', reason: '为 A2 打基础', priority: 3 },
    ],
    estimatedWeeksToTarget: 12,
  },
};

// ============== API 路由 ==============

/**
 * GET /api/v1/student-profile/:childId
 * 获取学员画像概览
 */
router.get('/:childId', (req: any, res: any) => {
  const { childId } = req.params;
  const profile = profilesOverview[childId as keyof typeof profilesOverview];
  
  if (!profile) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({ success: true, data: profile });
});

/**
 * GET /api/v1/student-profile/:childId/radar
 * 获取能力雷达图数据
 */
router.get('/:childId/radar', (req: any, res: any) => {
  const { childId } = req.params;
  const radar = radarData[childId as keyof typeof radarData];
  
  if (!radar) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({ success: true, data: radar });
});

/**
 * GET /api/v1/student-profile/:childId/trends
 * 获取听说读写趋势数据
 */
router.get('/:childId/trends', (req: any, res: any) => {
  const { childId } = req.params;
  const trends = skillTrends[childId as keyof typeof skillTrends];
  
  if (!trends) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({ success: true, data: trends });
});

/**
 * GET /api/v1/student-profile/:childId/vocabulary
 * 获取词汇地图数据
 */
router.get('/:childId/vocabulary', (req: any, res: any) => {
  const { childId } = req.params;
  const vocab = vocabularyMap[childId as keyof typeof vocabularyMap];
  
  if (!vocab) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({ success: true, data: vocab });
});

/**
 * GET /api/v1/student-profile/:childId/pronunciation
 * 获取发音档案
 */
router.get('/:childId/pronunciation', (req: any, res: any) => {
  const { childId } = req.params;
  const pron = pronunciationProfile[childId as keyof typeof pronunciationProfile];
  
  if (!pron) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({ success: true, data: pron });
});

/**
 * GET /api/v1/student-profile/:childId/habits
 * 获取学习习惯分析
 */
router.get('/:childId/habits', (req: any, res: any) => {
  const { childId } = req.params;
  const habits = learningHabits[childId as keyof typeof learningHabits];
  
  if (!habits) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({ success: true, data: habits });
});

/**
 * GET /api/v1/student-profile/:childId/path
 * 获取学习路径规划
 */
router.get('/:childId/path', (req: any, res: any) => {
  const { childId } = req.params;
  const path = learningPaths[childId as keyof typeof learningPaths];
  
  if (!path) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({ success: true, data: path });
});

/**
 * GET /api/v1/student-profile/:childId/full
 * 获取完整学员画像
 */
router.get('/:childId/full', (req: any, res: any) => {
  const { childId } = req.params;
  
  const overview = profilesOverview[childId as keyof typeof profilesOverview];
  const radar = radarData[childId as keyof typeof radarData];
  const trends = skillTrends[childId as keyof typeof skillTrends];
  const vocab = vocabularyMap[childId as keyof typeof vocabularyMap];
  const pron = pronunciationProfile[childId as keyof typeof pronunciationProfile];
  const habits = learningHabits[childId as keyof typeof learningHabits];
  const path = learningPaths[childId as keyof typeof learningPaths];
  
  if (!overview) {
    return res.status(404).json({ success: false, message: '学员不存在' });
  }
  
  res.json({
    success: true,
    data: {
      overview,
      radar,
      trends,
      vocabulary: vocab,
      pronunciation: pron,
      habits,
      learningPath: path,
    },
  });
});

export default router;
