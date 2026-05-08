import express from 'express';
import { courses, enrollments, generateId } from '../models/index.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

interface AuthRequest extends Record<string, any> {
  userId?: string;
  userRole?: string;
}

const { Router, Response } = express;
const router = Router();

// Sample courses data
const sampleCourses: Omit<typeof courses[0], 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: '剑桥少儿英语预备级',
    description: '专为3-6岁儿童设计的英语启蒙课程，通过游戏、歌曲、动画激发学习兴趣，建立英语好感度。',
    cambridgeLevel: 'Pre-A1',
    targetAge: '3-6岁',
    duration: 48,
    lessons: 96,
    price: 2999,
    originalPrice: 3999,
    coverImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    tags: ['英语启蒙', '趣味学习', '剑桥认证'],
    features: [
      '外教趣味课堂',
      '英文绘本阅读',
      '自然拼读入门',
      '节日主题活动'
    ],
    syllabus: [
      { week: 1, title: 'Hello World', topics: ['Greetings', 'Colors', 'Numbers 1-5'], objectives: ['学会打招呼', '认识基础颜色', '学习1-5数字'] },
      { week: 2, title: 'My Family', topics: ['Family members', 'This is...', 'I love...'], objectives: ['介绍家庭成员', '使用This is句型', '表达情感'] },
      { week: 3, title: 'Animals', topics: ['Farm animals', 'Wild animals', 'Pet animals'], objectives: ['认识动物名称', '模仿动物叫声', '动物相关词汇'] },
      { week: 4, title: 'Food & Drinks', topics: ['Fruits', 'Vegetables', 'Drinks'], objectives: ['食物相关词汇', '表达喜好', '简单对话'] }
    ],
    status: 'active',
    enrollmentCount: 156,
    rating: 4.9
  },
  {
    title: '剑桥少儿英语一级 (Starters)',
    description: '对应剑桥少儿英语Starters考试，涵盖听说读写四项基础技能，为后续学习打下坚实基础。',
    cambridgeLevel: 'A1',
    targetAge: '6-9岁',
    duration: 52,
    lessons: 104,
    price: 3999,
    originalPrice: 4999,
    coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    tags: ['Starters备考', '系统学习', '考试认证'],
    features: [
      'Starters真题训练',
      '听说读写全覆盖',
      '阶段性测评',
      '个性化学习报告'
    ],
    syllabus: [
      { week: 1, title: 'Getting Started', topics: ['Alphabet', 'Phonics basics', 'Simple words'], objectives: ['掌握字母发音', '基础自然拼读', '高频词汇'] },
      { week: 2, title: 'At School', topics: ['Classroom items', 'School subjects', 'Teachers'], objectives: ['学校场景词汇', '学科名称', '校园对话'] },
      { week: 3, title: 'Daily Routines', topics: ['Morning routine', 'Activities', 'Time expressions'], objectives: ['日常作息', '时间表达', '第三人称'] },
      { week: 4, title: 'My Town', topics: ['Places', 'Directions', 'Asking the way'], objectives: ['地点词汇', '问路指路', '方位介词'] }
    ],
    status: 'active',
    enrollmentCount: 289,
    rating: 4.8
  },
  {
    title: '剑桥少儿英语二级 (Movers)',
    description: '对应剑桥少儿英语Movers考试，提升语言运用能力，培养阅读理解和简单写作技能。',
    cambridgeLevel: 'A2',
    targetAge: '8-11岁',
    duration: 52,
    lessons: 104,
    price: 4599,
    originalPrice: 5599,
    coverImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    tags: ['Movers备考', '能力提升', '证书认证'],
    features: [
      'Movers全真模拟',
      '阅读技巧训练',
      '写作模板学习',
      '口语实战演练'
    ],
    syllabus: [
      { week: 1, title: 'Review & Expand', topics: ['Grammar review', 'Vocabulary building', 'Study skills'], objectives: ['语法巩固', '词汇扩充', '学习方法'] },
      { week: 2, title: 'The Natural World', topics: ['Animals & habitats', 'Weather', 'Seasons'], objectives: ['自然词汇', '天气描述', '季节表达'] },
      { week: 3, title: 'People & Places', topics: ['Countries', 'Cultures', 'Traditions'], objectives: ['国家文化', '文化差异', '传统节日'] },
      { week: 4, title: 'Stories & Imagination', topics: ['Storytelling', 'Creative writing', 'Drama'], objectives: ['故事创作', '创意写作', '戏剧表演'] }
    ],
    status: 'active',
    enrollmentCount: 198,
    rating: 4.7
  },
  {
    title: '剑桥英语KET备考冲刺班',
    description: '针对KET考试的系统备考课程，涵盖官方指定话题，训练四大技能，熟悉考试题型。',
    cambridgeLevel: 'A2',
    targetAge: '10-14岁',
    duration: 36,
    lessons: 72,
    price: 5999,
    originalPrice: 7999,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    tags: ['KET备考', '考前冲刺', '官方真题'],
    features: [
      'KET官方真题',
      '写作精批精改',
      '口语实战模拟',
      '高频词汇速记'
    ],
    syllabus: [
      { week: 1, title: 'KET Overview', topics: ['Exam format', 'Part types', 'Strategy'], objectives: ['了解考试结构', '各题型分析', '应试策略'] },
      { week: 2, title: 'Reading Part 1-3', topics: ['Notices', 'Messages', 'Articles'], objectives: ['阅读技巧', '信息定位', '主旨理解'] },
      { week: 3, title: 'Writing Part 6-7', topics: ['Email writing', 'Story writing', 'Templates'], objectives: ['邮件写作', '故事写作', '模板运用'] },
      { week: 4, title: 'Speaking Practice', topics: ['Interview', 'Picture task', 'Conversation'], objectives: ['口语模板', '图片描述', '互动对话'] }
    ],
    status: 'active',
    enrollmentCount: 145,
    rating: 4.9
  },
  {
    title: '剑桥英语PET精讲班',
    description: '系统学习B1级别英语，对应PET考试要求，全面提升听说读写四项核心技能。',
    cambridgeLevel: 'B1',
    targetAge: '12-15岁',
    duration: 48,
    lessons: 96,
    price: 7999,
    originalPrice: 9999,
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    tags: ['PET备考', 'B1级别', '综合提升'],
    features: [
      'PET核心语法',
      '长篇文章阅读',
      '议论文写作',
      '流利口语表达'
    ],
    syllabus: [
      { week: 1, title: 'PET Introduction', topics: ['Exam structure', 'B1 level expectations', 'Study plan'], objectives: ['PET全面了解', 'B1水平目标', '学习规划'] },
      { week: 2, title: 'Reading Part 1-5', topics: ['Multiple choice', 'Gapped text', 'Reading for detail'], objectives: ['阅读技巧', '完形填空', '细节理解'] },
      { week: 3, title: 'Writing Part 1-3', topics: ['Email/Letter', 'Story', 'Essay'], objectives: ['应用文写作', '记叙文', '议论文入门'] },
      { week: 4, title: 'Use of English', topics: ['Word formation', 'Key structures', 'Common errors'], objectives: ['词形转换', '核心句型', '常见错误'] }
    ],
    status: 'active',
    enrollmentCount: 98,
    rating: 4.8
  },
  {
    title: '剑桥英语FCE冲刺班',
    description: '针对FCE考试的高强度冲刺课程，涵盖C1级别核心内容，助力取得优异成绩。',
    cambridgeLevel: 'B2',
    targetAge: '14-18岁',
    duration: 60,
    lessons: 120,
    price: 12999,
    originalPrice: 15999,
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    tags: ['FCE备考', 'B2级别', '留学预科'],
    features: [
      'FCE全科精讲',
      '高阶语法解析',
      '学术写作训练',
      '深度阅读理解'
    ],
    syllabus: [
      { week: 1, title: 'FCE Overview', topics: ['Exam components', 'Scoring', 'Preparation'], objectives: ['FCE考试解析', '评分标准', '备考方案'] },
      { week: 2, title: 'Advanced Reading', topics: ['Long texts', 'Complex structures', 'Critical thinking'], objectives: ['长篇阅读', '复杂结构', '批判思维'] },
      { week: 3, title: 'Academic Writing', topics: ['Essay structure', 'Argumentation', 'Research skills'], objectives: ['论文结构', '论证方法', '调研能力'] },
      { week: 4, title: 'Speaking Excellence', topics: ['Presentation', 'Discussion', 'Grammar accuracy'], objectives: ['演讲技巧', '讨论策略', '语法精度'] }
    ],
    status: 'active',
    enrollmentCount: 56,
    rating: 4.9
  }
];

// Initialize sample courses
sampleCourses.forEach(c => {
  courses.push({
    ...c,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Get all courses (public)
router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { level, age, tag, search, sort } = req.query;
    
    let filteredCourses = [...courses];
    
    // Filters
    if (level) {
      filteredCourses = filteredCourses.filter(c => c.cambridgeLevel === level);
    }
    if (age) {
      filteredCourses = filteredCourses.filter(c => c.targetAge.includes(age as string));
    }
    if (tag) {
      filteredCourses = filteredCourses.filter(c => c.tags.includes(tag as string));
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredCourses = filteredCourses.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    if (sort === 'popular') {
      filteredCourses.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    } else if (sort === 'rating') {
      filteredCourses.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'price_asc') {
      filteredCourses.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filteredCourses.sort((a, b) => b.price - a.price);
    } else {
      // Default: active first, then by rating
      filteredCourses.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return b.rating - a.rating;
      });
    }
    
    res.json({ courses: filteredCourses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get course detail
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = courses.find(c => c.id === id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if user is enrolled
    let isEnrolled = false;
    let enrollment = null;
    
    if (req.userId) {
      enrollment = enrollments.find(e => 
        e.courseId === id && 
        e.userId === req.userId && 
        e.status === 'active'
      );
      isEnrolled = !!enrollment;
    }
    
    res.json({ course, isEnrolled, enrollment });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// Get course syllabus
router.get('/:id/syllabus', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = courses.find(c => c.id === id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ syllabus: course.syllabus });
  } catch (error) {
    console.error('Get syllabus error:', error);
    res.status(500).json({ error: 'Failed to get syllabus' });
  }
});

// Enroll in course
router.post('/:id/enroll', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = courses.find(c => c.id === id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (course.status !== 'active') {
      return res.status(400).json({ error: 'Course is not available' });
    }
    
    // Check if already enrolled
    const existingEnrollment = enrollments.find(e => 
      e.courseId === id && 
      e.userId === req.userId && 
      e.status === 'active'
    );
    
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    const enrollment: typeof enrollments[0] = {
      id: generateId(),
      userId: req.userId!,
      courseId: id,
      status: 'active',
      progress: 0,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    enrollments.push(enrollment);
    
    // Update course enrollment count
    course.enrollmentCount++;
    
    res.status(201).json({ 
      message: 'Enrollment successful',
      enrollment 
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Get user's enrollments
router.get('/my/enrollments', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userEnrollments = enrollments
      .filter(e => e.userId === req.userId && e.status === 'active')
      .map(e => ({
        ...e,
        course: courses.find(c => c.id === e.courseId)
      }));
    
    res.json({ enrollments: userEnrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to get enrollments' });
  }
});

// Get related courses
router.get('/:id/related', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = courses.find(c => c.id === id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Find related courses (same level or next level)
    const relatedCourses = courses
      .filter(c => 
        c.id !== id && 
        c.status === 'active' &&
        (c.cambridgeLevel === course.cambridgeLevel ||
         getNextLevel(course.cambridgeLevel) === c.cambridgeLevel)
      )
      .slice(0, 4);
    
    res.json({ courses: relatedCourses });
  } catch (error) {
    console.error('Get related courses error:', error);
    res.status(500).json({ error: 'Failed to get related courses' });
  }
});

function getNextLevel(current: string): string {
  const levels: Record<string, string> = {
    'Pre-A1': 'A1',
    'A1': 'A2',
    'A2': 'B1',
    'B1': 'B2',
    'B2': 'C1'
  };
  return levels[current] || current;
}

export default router;
