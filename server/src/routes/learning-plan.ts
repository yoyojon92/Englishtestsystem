/**
 * L5: 学习规划引擎 API
 * 基于学员画像生成月度学习计划、周计划、教材推荐
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

/**
 * 获取当前月份
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 获取下周日期范围
 */
function getWeekDates(weekOffset: number = 0): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return { start: monday, end: sunday };
}

/**
 * CEFR 等级顺序
 */
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * 预估达到目标等级所需月数
 */
function estimateMonthsToTarget(current: string, target: string): number {
  const currentIdx = CEFR_ORDER.indexOf(current);
  const targetIdx = CEFR_ORDER.indexOf(target);
  const gap = targetIdx - currentIdx;
  return Math.max(1, gap * 3); // 每跨越一个等级约3个月
}

/**
 * 根据弱项生成月度目标
 */
function generateMonthlyGoals(weakPoints: any[]): string[] {
  const goals: string[] = [];
  
  if (!weakPoints || weakPoints.length === 0) {
    goals.push('巩固英语基础能力');
    goals.push('每天听读练习15分钟');
    goals.push('完成阶段性测评');
    return goals;
  }
  
  weakPoints.slice(0, 3).forEach((wp: any) => {
    if (wp.area === 'writing') {
      goals.push(`提升写作能力：${wp.specific}`);
    } else if (wp.area === 'listening') {
      goals.push(`强化听力理解：每天听力练习15分钟`);
    } else if (wp.area === 'reading') {
      goals.push(`提升阅读技巧：${wp.specific}`);
    } else if (wp.area === 'speaking') {
      goals.push(`改善口语表达：${wp.specific}`);
    }
  });
  
  goals.push('坚持每日单词复习');
  goals.push('完成月度综合测评');
  
  return goals;
}

/**
 * 生成周计划
 */
function generateWeeklySchedule(weakPoints: any[], currentLevel: string): any {
  const weekNames = ['第一周', '第二周', '第三周', '第四周'];
  const schedule: any = {};
  
  const baseTasks = [
    { task: 'KET Reading Part 1 练习', count: 10, due: '周三' },
    { task: '听力理解训练', count: 5, due: '周四' },
  ];
  
  if (weakPoints && weakPoints.length > 0) {
    const topWeak = weakPoints[0];
    if (topWeak.area === 'writing') {
      baseTasks.push({ task: '写作专项训练', count: 3, due: '周五' });
    }
  }
  
  weekNames.forEach((week, idx) => {
    schedule[week] = {
      system_tasks: baseTasks.map(t => ({
        ...t,
        task: idx === 0 ? t.task : `${t.task}（复习）`,
      })),
      offline_class: {
        topic: `CEFR ${currentLevel} 能力提升 - ${['基础语法', '阅读技巧', '写作训练', '综合测试'][idx]}`,
        homework: `完成练习册 Unit ${idx + 1}`,
      },
    };
  });
  
  return schedule;
}

/**
 * 推荐教材
 */
function generateRecommendedMaterials(weakPoints: any[], targetLevel: string): any[] {
  const materials: any[] = [];
  
  // 基于目标等级推荐 Prepare 教材
  const prepareLevel = targetLevel === 'A2' ? 'Level 2' : targetLevel === 'B1' ? 'Level 3' : 'Level 2';
  
  materials.push({
    material: `Prepare ${prepareLevel}`,
    reason: '官方配套教材，系统学习',
    priority: 1,
    type: 'textbook',
  });
  
  // 基于弱项推荐
  if (weakPoints && weakPoints.length > 0) {
    weakPoints.slice(0, 2).forEach((wp: any, idx: number) => {
      materials.push({
        material: `KET 真题集 Chapter ${idx + 1}`,
        reason: `针对性提升 ${wp.area} 能力`,
        priority: idx + 2,
        type: 'exam_paper',
      });
    });
  }
  
  return materials;
}

/**
 * 评估安排
 */
function generateAssessmentSchedule(): any[] {
  const now = new Date();
  const assessments = [];
  
  // 下周小测
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  assessments.push({
    date: nextWeek.toISOString().split('T')[0],
    type: 'mini_test',
    scope: '周知识点检测',
  });
  
  // 月末综合测试
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  assessments.push({
    date: monthEnd.toISOString().split('T')[0],
    type: 'full_diagnosis',
    scope: '月度综合能力评估',
  });
  
  return assessments;
}

/**
 * 生成家长报告摘要
 */
function generateParentReport(weakPoints: any[], targetLevel: string, monthsToTarget: number): any {
  const weakSummary = weakPoints && weakPoints.length > 0 
    ? weakPoints.slice(0, 2).map((w: any) => `${w.area}（${w.specific}）`).join('、')
    : '暂无明显弱项';
  
  return {
    summary: `本月重点关注提升 ${weakSummary}，预计 ${monthsToTarget} 个月后达到 ${targetLevel} 水平`,
    homework_suggestions: [
      '每天朗读英语15分钟',
      '周末完成一套阅读理解',
      '养成背单词的习惯',
    ],
    parent_meeting: '建议每月与班主任进行一次学习进度沟通',
  };
}

// ============================================
// API 端点
// ============================================

/**
 * 生成学习计划
 * POST /api/v1/learning-plan/generate
 * 
 * Body: {
 *   student_id: string,
 *   current_cefr: { overall, listening, reading, writing, speaking },
 *   target_cefr: string,
 *   weak_points: [{ area, specific, mastery, priority }]
 * }
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      student_id,
      current_cefr = { overall: 'A2' },
      target_cefr = 'B1',
      weak_points = [],
    } = req.body;
    
    if (!student_id) {
      res.status(400).json({ error: 'student_id is required' });
      return;
    }
    
    const currentLevel = current_cefr.overall || 'A2';
    const monthsToTarget = estimateMonthsToTarget(currentLevel, target_cefr);
    
    const plan = {
      student_id,
      plan_period: getCurrentMonth(),
      generated_at: new Date().toISOString(),
      
      // 月度目标
      monthly_goals: generateMonthlyGoals(weak_points),
      
      // 周计划
      weekly_schedule: generateWeeklySchedule(weak_points, currentLevel),
      
      // 教材推荐
      recommended_materials: generateRecommendedMaterials(weak_points, target_cefr),
      
      // 评估安排
      assessment_schedule: generateAssessmentSchedule(),
      
      // 家长报告
      parent_report: generateParentReport(weak_points, target_cefr, monthsToTarget),
      
      // 能力信息
      ability_info: {
        current_cefr: current_cefr,
        target_cefr,
        estimated_months_to_target: monthsToTarget,
        weak_points: weak_points.slice(0, 3),
      },
    };
    
    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error generating learning plan:', error);
    res.status(500).json({ error: 'Failed to generate learning plan' });
  }
});

/**
 * 获取学习计划
 * GET /api/v1/learning-plan/:studentId
 */
router.get('/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { period } = req.query;
    
    // 模拟数据（实际应从数据库查询）
    const mockPlan = {
      student_id: studentId,
      plan_period: period || getCurrentMonth(),
      generated_at: new Date().toISOString(),
      monthly_goals: [
        '掌握一般过去时用法',
        '听力练习每天15分钟',
        '阅读理解正确率达到70%',
      ],
      weekly_schedule: {
        '第一周': {
          system_tasks: [
            { task: 'KET Reading Part 1 练习', count: 10, due: '周三' },
            { task: '听力理解训练', count: 5, due: '周四' },
            { task: '语法专项-时态', count: 8, due: '周五' },
          ],
          offline_class: {
            topic: 'CEFR A2 能力提升 - 基础语法',
            homework: '完成练习册 Unit 1',
          },
        },
        '第二周': {
          system_tasks: [
            { task: 'KET Reading Part 2 练习', count: 10, due: '周三' },
            { task: '听力场景练习', count: 5, due: '周四' },
            { task: '写作句型训练', count: 3, due: '周五' },
          ],
          offline_class: {
            topic: 'CEFR A2 能力提升 - 阅读技巧',
            homework: '完成练习册 Unit 2',
          },
        },
        '第三周': {
          system_tasks: [
            { task: 'KET Reading Part 3 练习', count: 10, due: '周三' },
            { task: '听力精听训练', count: 5, due: '周四' },
            { task: '写作段落构建', count: 3, due: '周五' },
          ],
          offline_class: {
            topic: 'CEFR A2 能力提升 - 写作训练',
            homework: '完成练习册 Unit 3',
          },
        },
        '第四周': {
          system_tasks: [
            { task: 'KET 综合模拟测试', count: 1, due: '周三' },
            { task: '错题复习整理', count: 20, due: '周四' },
          ],
          offline_class: {
            topic: 'CEFR A2 能力提升 - 综合测试',
            homework: '完成练习册 Unit 4',
          },
        },
      },
      recommended_materials: [
        {
          material: 'Prepare Level 2',
          reason: '官方配套教材，系统学习A2内容',
          priority: 1,
          type: 'textbook',
        },
        {
          material: 'KET 真题集 Chapter 1',
          reason: '针对性提升阅读理解能力',
          priority: 2,
          type: 'exam_paper',
        },
        {
          material: '剑桥少儿英语词汇',
          reason: '扩充核心词汇量',
          priority: 3,
          type: 'vocabulary',
        },
      ],
      assessment_schedule: [
        {
          date: '2026-05-17',
          type: 'mini_test',
          scope: '时态专项检测',
        },
        {
          date: '2026-05-31',
          type: 'full_diagnosis',
          scope: '月度综合能力评估',
        },
      ],
      parent_report: {
        summary: '本月重点提升阅读理解能力和语法基础，预计6个月后达到PET(B1)水平',
        homework_suggestions: [
          '每天朗读英语15分钟',
          '周末完成一套阅读理解',
          '养成背单词的习惯',
        ],
        parent_meeting: '建议每月与班主任进行一次学习进度沟通',
      },
      ability_info: {
        current_cefr: {
          overall: 'A2',
          listening: 'A2',
          reading: 'B1',
          writing: 'A1',
          speaking: 'A2',
        },
        target_cefr: 'B1',
        estimated_months_to_target: 6,
        weak_points: [
          { area: 'writing', specific: '时态混用', mastery: 0.35, priority: 'high' },
          { area: 'listening', specific: '连读弱读', mastery: 0.55, priority: 'medium' },
        ],
      },
    };
    
    res.json({
      success: true,
      data: mockPlan,
    });
  } catch (error) {
    console.error('Error fetching learning plan:', error);
    res.status(500).json({ error: 'Failed to fetch learning plan' });
  }
});

/**
 * 获取本周任务
 * GET /api/v1/learning-plan/:studentId/this-week
 */
router.get('/:studentId/this-week', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const weekDates = getWeekDates();
    
    // 模拟本周任务
    const thisWeekTasks = {
      student_id: studentId,
      week_start: weekDates.start.toISOString().split('T')[0],
      week_end: weekDates.end.toISOString().split('T')[0],
      tasks: [
        {
          id: 'task_1',
          title: 'KET Reading Part 1 练习',
          description: '完成10道通知匹配题',
          type: 'practice',
          skill: 'reading',
          due_date: '周三',
          status: 'pending',
        },
        {
          id: 'task_2',
          title: '听力理解训练',
          description: '5段日常对话精听',
          type: 'practice',
          skill: 'listening',
          due_date: '周四',
          status: 'pending',
        },
        {
          id: 'task_3',
          title: '语法专项-时态',
          description: '一般过去时用法练习',
          type: 'grammar',
          skill: 'writing',
          due_date: '周五',
          status: 'pending',
        },
      ],
      offline_class: {
        topic: 'CEFR A2 能力提升 - 基础语法',
        homework: '完成练习册 Unit 1',
        date: weekDates.start.toISOString().split('T')[0],
      },
    };
    
    res.json({
      success: true,
      data: thisWeekTasks,
    });
  } catch (error) {
    console.error('Error fetching weekly tasks:', error);
    res.status(500).json({ error: 'Failed to fetch weekly tasks' });
  }
});

/**
 * 获取教材列表
 * GET /api/v1/learning-plan/materials
 */
router.get('/materials/list', async (req: Request, res: Response) => {
  try {
    const { level } = req.query;
    
    const materials = [
      {
        id: 'prep_level_2',
        name: 'Prepare Level 2 (A2)',
        type: 'textbook',
        level: 'A2',
        units: [
          { unit: 1, title: 'Home and Family', topics: ['家庭成员', '日常活动'] },
          { unit: 2, title: 'School and Learning', topics: ['学校生活', '学习用品'] },
          { unit: 3, title: 'Food and Drink', topics: ['食物词汇', '饮食习惯'] },
          { unit: 4, title: 'Shopping and Money', topics: ['购物表达', '价格优惠'] },
          { unit: 5, title: 'Free Time and Hobbies', topics: ['兴趣爱好', '周末活动'] },
          { unit: 6, title: 'Travel and Transport', topics: ['交通方式', '旅行用语'] },
        ],
      },
      {
        id: 'prep_level_3',
        name: 'Prepare Level 3 (B1)',
        type: 'textbook',
        level: 'B1',
        units: [
          { unit: 1, title: 'Identity and Relationships', topics: ['人物描述', '人际关系'] },
          { unit: 2, title: 'Education and Learning', topics: ['学习经历', '教育制度'] },
          { unit: 3, title: 'Food and Lifestyle', topics: ['生活方式', '饮食习惯'] },
        ],
      },
      {
        id: 'ket_exam_papers',
        name: 'KET 真题集',
        type: 'exam_paper',
        level: 'A2',
        parts: [
          { part: 1, title: 'Reading Part 1 - Notice Matching', question_count: 5 },
          { part: 2, title: 'Reading Part 2 - Message Matching', question_count: 5 },
          { part: 3, title: 'Reading Part 3 - Multiple Choice', question_count: 5 },
          { part: 4, title: 'Reading Part 4 - Cloze', question_count: 6 },
          { part: 5, title: 'Reading Part 5 - Open Cloze', question_count: 6 },
        ],
      },
      {
        id: 'vocab_basics',
        name: '剑桥少儿英语词汇',
        type: 'vocabulary',
        level: 'A2',
        chapters: [
          { chapter: 1, title: 'Numbers and Time', word_count: 50 },
          { chapter: 2, title: 'Colors and Shapes', word_count: 40 },
          { chapter: 3, title: 'Animals and Nature', word_count: 60 },
        ],
      },
    ];
    
    // 按级别筛选
    const filtered = level 
      ? materials.filter(m => m.level === level)
      : materials;
    
    res.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

export default router;
