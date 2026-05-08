// 免费课程数据模型

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // 秒
  thumbnailUrl: string;
  order: number;
  lessonType: 'video' | 'exercise' | 'quiz';
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'worksheet' | 'audio';
  }[];
}

export interface Exercise {
  id: string;
  type: 'listen' | 'speak' | 'read' | 'write' | 'choice' | 'match';
  content: string;
  question?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
  passingScore: number; // 百分比
  timeLimit?: number; // 秒
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'lessons_completed' | 'quiz_passed' | 'streak_days' | 'vocabulary_learned';
    count: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// 内存数据存储
export const lessons: Lesson[] = [
  // Pre-A1 入门课程
  {
    id: 'pre-a1-1',
    title: '认识字母 A-E',
    description: '学习字母 A, B, C, D, E 的发音和书写',
    videoUrl: 'https://example.com/videos/pre-a1-1.mp4',
    duration: 300,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    order: 1,
    lessonType: 'video',
    resources: [
      { title: '字母练习册', url: '#', type: 'pdf' },
    ],
  },
  {
    id: 'pre-a1-2',
    title: '认识字母 F-J',
    description: '学习字母 F, G, H, I, J 的发音和书写',
    videoUrl: 'https://example.com/videos/pre-a1-2.mp4',
    duration: 300,
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    order: 2,
    lessonType: 'video',
  },
  {
    id: 'pre-a1-3',
    title: '简单问候语',
    description: '学习 Hello, Hi, Good morning 等问候语',
    videoUrl: 'https://example.com/videos/pre-a1-3.mp4',
    duration: 240,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    order: 3,
    lessonType: 'video',
  },
  // A1 基础课程
  {
    id: 'a1-1',
    title: '数字 1-10',
    description: '学习数字 one, two, three...',
    videoUrl: 'https://example.com/videos/a1-1.mp4',
    duration: 360,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    order: 1,
    lessonType: 'video',
  },
  {
    id: 'a1-2',
    title: '家庭成员',
    description: '学习 father, mother, brother 等家庭词汇',
    videoUrl: 'https://example.com/videos/a1-2.mp4',
    duration: 420,
    thumbnailUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400',
    order: 2,
    lessonType: 'video',
  },
  {
    id: 'a1-3',
    title: '颜色和形状',
    description: '学习 red, blue, circle, square 等',
    videoUrl: 'https://example.com/videos/a1-3.mp4',
    duration: 380,
    thumbnailUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400',
    order: 3,
    lessonType: 'video',
  },
  // A2 进阶课程
  {
    id: 'a2-1',
    title: '日常活动',
    description: '学习描述日常活动的动词和短语',
    videoUrl: 'https://example.com/videos/a2-1.mp4',
    duration: 480,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400',
    order: 1,
    lessonType: 'video',
  },
  {
    id: 'a2-2',
    title: '现在进行时',
    description: '学习 be + doing 结构',
    videoUrl: 'https://example.com/videos/a2-2.mp4',
    duration: 540,
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    order: 2,
    lessonType: 'video',
  },
  // 技能专项课程
  {
    id: 'skill-phonics-1',
    title: '自然拼读入门',
    description: '学习字母与发音的对应关系',
    videoUrl: 'https://example.com/videos/phonics-1.mp4',
    duration: 600,
    thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
    order: 1,
    lessonType: 'video',
  },
  {
    id: 'skill-reading-1',
    title: '阅读技巧 - 看图猜词',
    description: '通过图片理解单词含义',
    videoUrl: 'https://example.com/videos/reading-1.mp4',
    duration: 450,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    order: 1,
    lessonType: 'video',
  },
];

export const exercises: Exercise[] = [
  {
    id: 'ex-1',
    type: 'choice',
    content: 'What color is the sky?',
    question: '天空是什么颜色？',
    options: ['Red', 'Blue', 'Green', 'Yellow'],
    correctAnswer: 'Blue',
    explanation: 'The sky is usually blue in the daytime.',
    points: 10,
  },
  {
    id: 'ex-2',
    type: 'choice',
    content: 'How many fingers do you have?',
    question: '你有几根手指？',
    options: ['5', '10', '15', '20'],
    correctAnswer: '10',
    explanation: 'A person has 10 fingers - 5 on each hand.',
    points: 10,
  },
  {
    id: 'ex-3',
    type: 'listen',
    content: 'Listen and choose the correct word.',
    options: ['cat', 'dog', 'bird', 'fish'],
    correctAnswer: 'cat',
    points: 15,
  },
  {
    id: 'ex-4',
    type: 'match',
    content: 'Match the words with pictures.',
    options: ['apple', 'banana', 'orange', 'grape'],
    correctAnswer: ['apple', 'banana', 'orange', 'grape'],
    points: 20,
  },
];

export const quizzes: Quiz[] = [
  {
    id: 'quiz-pre-a1-1',
    title: 'Pre-A1 测试 1',
    questions: [
      {
        question: 'What letter makes the sound /æ/ as in "apple"?',
        options: ['A', 'E', 'I', 'O'],
        correctAnswer: 0,
        explanation: 'The letter A makes the /æ/ sound.',
      },
      {
        question: 'How do you say "你好" in English?',
        options: ['Goodbye', 'Hello', 'Thank you', 'Sorry'],
        correctAnswer: 1,
        explanation: 'Hello is the greeting in English.',
      },
      {
        question: 'Which number is "three"?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 2,
        explanation: 'Three is the number 3.',
      },
    ],
    passingScore: 60,
    timeLimit: 180,
  },
  {
    id: 'quiz-a1-1',
    title: 'A1 级别测试 1',
    questions: [
      {
        question: 'What is the plural of "child"?',
        options: ['childs', 'childrens', 'children', 'childes'],
        correctAnswer: 2,
        explanation: 'Children is the plural form of child.',
      },
      {
        question: 'Choose the correct sentence:',
        options: [
          'I am happy.',
          'I is happy.',
          'I are happy.',
          'I be happy.',
        ],
        correctAnswer: 0,
        explanation: 'I + am is the correct form.',
      },
    ],
    passingScore: 70,
    timeLimit: 240,
  },
];

export const badges: Badge[] = [
  {
    id: 'badge-first-lesson',
    name: '初学者',
    description: '完成第一课',
    icon: '🎯',
    criteria: { type: 'lessons_completed', count: 1 },
    rarity: 'common',
  },
  {
    id: 'badge-five-lessons',
    name: '学习达人',
    description: '完成5节课',
    icon: '📚',
    criteria: { type: 'lessons_completed', count: 5 },
    rarity: 'rare',
  },
  {
    id: 'badge-ten-lessons',
    name: '学习之星',
    description: '完成10节课',
    icon: '⭐',
    criteria: { type: 'lessons_completed', count: 10 },
    rarity: 'epic',
  },
  {
    id: 'badge-quiz-master',
    name: '测验大师',
    description: '通过5次测验',
    icon: '🏆',
    criteria: { type: 'quiz_passed', count: 5 },
    rarity: 'rare',
  },
  {
    id: 'badge-streak-3',
    name: '连续3天',
    description: '连续学习3天',
    icon: '🔥',
    criteria: { type: 'streak_days', count: 3 },
    rarity: 'common',
  },
  {
    id: 'badge-streak-7',
    name: '一周坚持',
    description: '连续学习7天',
    icon: '💪',
    criteria: { type: 'streak_days', count: 7 },
    rarity: 'rare',
  },
  {
    id: 'badge-streak-30',
    name: '月度学习',
    description: '连续学习30天',
    icon: '👑',
    criteria: { type: 'streak_days', count: 30 },
    rarity: 'legendary',
  },
  {
    id: 'badge-vocab-50',
    name: '词汇积累',
    description: '学习50个新单词',
    icon: '📝',
    criteria: { type: 'vocabulary_learned', count: 50 },
    rarity: 'epic',
  },
];

// 用户学习进度
export interface UserProgress {
  userId: string;
  childId?: string;
  completedLessons: string[];
  completedQuizzes: string[];
  earnedBadges: string[];
  streakDays: number;
  lastStudyDate: string;
  totalPoints: number;
  vocabularyLearned: string[];
}

// 内存存储
export const userProgress: Map<string, UserProgress> = new Map();
