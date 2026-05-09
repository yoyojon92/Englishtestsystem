import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

/**
 * 备考计划数据结构
 */
interface PrepPlan {
  planId: string;
  childId: string;
  examType: string;
  targetDate: string;
  currentLevel: string;
  currentScore: number;
  targetScore: number;
  phase: 'foundation' | 'practice' | '冲刺' | '模拟';
  milestones: PrepMilestone[];
  weeklyTasks: WeeklyTask[];
  createdAt: string;
  updatedAt: string;
  progressPct: number;
}

interface PrepMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

interface WeeklyTask {
  week: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface Task {
  id: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mock_exam' | 'review';
  title: string;
  description: string;
  targetHours: number;
  completedHours: number;
  completed: boolean;
}

/**
 * 生成备考计划
 */
function generatePrepPlan(
  childId: string,
  examType: string,
  targetDate: string,
  currentLevel: string
): PrepPlan {
  const planId = `PLAN-${examType}-${Date.now()}`;
  const startDate = new Date();
  const target = new Date(targetDate);
  const weeks = Math.ceil((target.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  const milestones = generateMilestones(examType, targetDate, weeks);
  const weeklyTasks = generateWeeklyTasks(examType, weeks, startDate);

  return {
    planId,
    childId,
    examType,
    targetDate,
    currentLevel,
    currentScore: 45,
    targetScore: 60,
    phase: 'foundation',
    milestones,
    weeklyTasks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progressPct: 0,
  };
}

/**
 * 生成里程碑
 */
function generateMilestones(examType: string, targetDate: string, totalWeeks: number): PrepMilestone[] {
  const milestones: PrepMilestone[] = [];
  
  // 基础阶段完成
  milestones.push({
    id: 'm1',
    title: '基础阶段完成',
    description: '完成词汇和语法基础学习',
    targetDate: new Date(Date.now() + totalWeeks * 0.25 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  });

  // 强化阶段完成
  milestones.push({
    id: 'm2',
    title: '强化阶段完成',
    description: '听说读写全面强化训练',
    targetDate: new Date(Date.now() + totalWeeks * 0.5 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  });

  // 冲刺阶段完成
  milestones.push({
    id: 'm3',
    title: '冲刺阶段完成',
    description: '完成全部模拟考试和错题复习',
    targetDate: new Date(Date.now() + totalWeeks * 0.75 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  });

  // 考前准备
  milestones.push({
    id: 'm4',
    title: '考前准备完成',
    description: '确认考试安排，准备证件和文具',
    targetDate: new Date(Date.now() + (totalWeeks - 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  });

  // 考试日
  milestones.push({
    id: 'm5',
    title: `${examType}考试日`,
    description: '全力以赴，祝您通过！',
    targetDate,
    completed: false,
  });

  return milestones;
}

/**
 * 生成每周任务
 */
function generateWeeklyTasks(examType: string, totalWeeks: number, startDate: Date): WeeklyTask[] {
  const weeks: WeeklyTask[] = [];
  
  const taskTemplates = {
    vocabulary: [
      { title: '背诵核心词汇100个', description: '每天20个，周末复习', type: 'vocabulary' as const },
      { title: '复习本周词汇', description: '周六周日集中复习', type: 'vocabulary' as const },
    ],
    grammar: [
      { title: '学习语法知识点', description: '完成语法专项练习', type: 'grammar' as const },
      { title: '语法错题整理', description: '整理本周语法错题', type: 'grammar' as const },
    ],
    listening: [
      { title: '听力训练30分钟', description: '听力和听写练习', type: 'listening' as const },
      { title: '听力模拟题1套', description: '限时完成听力部分', type: 'listening' as const },
    ],
    speaking: [
      { title: '口语跟读练习', description: '跟读模仿标准发音', type: 'speaking' as const },
      { title: '口语话题练习', description: '准备常见口语话题', type: 'speaking' as const },
    ],
    reading: [
      { title: '阅读理解练习', description: '完成3篇阅读理解', type: 'reading' as const },
      { title: '阅读技巧学习', description: '学习略读和扫读技巧', type: 'reading' as const },
    ],
    writing: [
      { title: '写作模板学习', description: '背诵并练习写作模板', type: 'writing' as const },
      { title: '写作练习', description: '完成1-2篇写作练习', type: 'writing' as const },
    ],
    mock_exam: [
      { title: '模拟考试', description: '全真模拟考试', type: 'mock_exam' as const },
    ],
    review: [
      { title: '本周错题复习', description: '复习本周所有错题', type: 'review' as const },
    ],
  };

  for (let week = 1; week <= totalWeeks; week++) {
    const weekStart = new Date(startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const tasks: Task[] = [];
    
    // 根据周数分配任务
    if (week <= totalWeeks * 0.25) {
      // 基础阶段
      tasks.push(
        { ...taskTemplates.vocabulary[0], id: `w${week}-v1`, targetHours: 3, completedHours: 0, completed: false },
        { ...taskTemplates.grammar[0], id: `w${week}-g1`, targetHours: 2, completedHours: 0, completed: false },
        { ...taskTemplates.listening[0], id: `w${week}-l1`, targetHours: 1, completedHours: 0, completed: false },
        { ...taskTemplates.reading[0], id: `w${week}-r1`, targetHours: 1.5, completedHours: 0, completed: false },
      );
    } else if (week <= totalWeeks * 0.5) {
      // 强化阶段
      tasks.push(
        { ...taskTemplates.vocabulary[1], id: `w${week}-v2`, targetHours: 2, completedHours: 0, completed: false },
        { ...taskTemplates.grammar[1], id: `w${week}-g2`, targetHours: 2, completedHours: 0, completed: false },
        { ...taskTemplates.listening[1], id: `w${week}-l2`, targetHours: 2, completedHours: 0, completed: false },
        { ...taskTemplates.speaking[0], id: `w${week}-s1`, targetHours: 2, completedHours: 0, completed: false },
        { ...taskTemplates.reading[1], id: `w${week}-r2`, targetHours: 1.5, completedHours: 0, completed: false },
        { ...taskTemplates.writing[0], id: `w${week}-w1`, targetHours: 2, completedHours: 0, completed: false },
      );
    } else if (week <= totalWeeks * 0.75) {
      // 冲刺阶段
      tasks.push(
        { ...taskTemplates.mock_exam[0], id: `w${week}-m1`, targetHours: 3, completedHours: 0, completed: false },
        { ...taskTemplates.speaking[1], id: `w${week}-s2`, targetHours: 2, completedHours: 0, completed: false },
        { ...taskTemplates.writing[1], id: `w${week}-w2`, targetHours: 2, completedHours: 0, completed: false },
        { ...taskTemplates.review[0], id: `w${week}-rv1`, targetHours: 2, completedHours: 0, completed: false },
      );
    } else {
      // 模拟阶段
      tasks.push(
        { ...taskTemplates.mock_exam[0], id: `w${week}-m2`, targetHours: 3, completedHours: 0, completed: false },
        { ...taskTemplates.review[0], id: `w${week}-rv2`, targetHours: 3, completedHours: 0, completed: false },
        { ...taskTemplates.speaking[1], id: `w${week}-s3`, targetHours: 2, completedHours: 0, completed: false },
      );
    }

    weeks.push({
      week,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      tasks,
      status: 'pending',
    });
  }

  return weeks;
}

/**
 * POST /api/v1/prep-plan/create
 * 创建备考计划
 */
router.post('/create', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { childId, examType, targetDate, currentLevel } = req.body;

    if (!childId || !examType || !targetDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const plan = generatePrepPlan(childId, examType, targetDate, currentLevel || 'A2');

    return res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('Create prep plan error:', error);
    return res.status(500).json({ error: 'Failed to create prep plan' });
  }
});

/**
 * GET /api/v1/prep-plan/:childId
 * 获取备考计划
 */
router.get('/:childId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;
    const { examType } = req.query;

    // 模拟数据
    const mockPlan: PrepPlan = generatePrepPlan(
      childId,
      examType as string || 'KET',
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      'A2'
    );

    // 模拟一些已完成的任务
    mockPlan.milestones.forEach((m, i) => {
      if (i < 1) {
        m.completed = true;
        m.completedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      }
    });

    mockPlan.weeklyTasks.forEach((week, i) => {
      if (i < 2) {
        week.status = 'completed';
        week.tasks.forEach(task => {
          task.completed = true;
          task.completedHours = task.targetHours;
        });
      } else if (i === 2) {
        week.status = 'in_progress';
        week.tasks.forEach((task, ti) => {
          if (ti < 2) {
            task.completed = true;
            task.completedHours = task.targetHours;
          }
        });
      }
    });

    mockPlan.progressPct = 35;

    return res.json({
      success: true,
      data: mockPlan,
    });
  } catch (error: any) {
    console.error('Get prep plan error:', error);
    return res.status(500).json({ error: 'Failed to get prep plan' });
  }
});

/**
 * PUT /api/v1/prep-plan/:planId/task/:taskId
 * 更新任务进度
 */
router.put('/:planId/task/:taskId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { planId, taskId } = req.params;
    const { completed, completedHours } = req.body;

    // 模拟更新
    const task = {
      id: taskId,
      completed,
      completedHours: completedHours || (completed ? 3 : 0),
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * PUT /api/v1/prep-plan/:planId/milestone/:milestoneId
 * 更新里程碑
 */
router.put('/:planId/milestone/:milestoneId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { planId, milestoneId } = req.params;
    const { completed } = req.body;

    const milestone = {
      id: milestoneId,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: milestone,
    });
  } catch (error: any) {
    console.error('Update milestone error:', error);
    return res.status(500).json({ error: 'Failed to update milestone' });
  }
});

/**
 * GET /api/v1/prep-plan/:childId/today
 * 获取今日任务
 */
router.get('/:childId/today', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // 模拟今日任务
    const todayTasks = [
      {
        id: `task-${Date.now()}-1`,
        type: 'vocabulary',
        title: '背诵核心词汇30个',
        description: '重点记忆考试高频词汇',
        targetHours: 1,
        completedHours: 0.5,
        status: 'in_progress',
      },
      {
        id: `task-${Date.now()}-2`,
        type: 'listening',
        title: '听力训练30分钟',
        description: '完成一套听力模拟题',
        targetHours: 1,
        completedHours: 0,
        status: 'pending',
      },
      {
        id: `task-${Date.now()}-3`,
        type: 'reading',
        title: '阅读理解练习',
        description: '完成2篇阅读理解',
        targetHours: 0.5,
        completedHours: 0,
        status: 'pending',
      },
    ];

    const stats = {
      totalTasks: 3,
      completedTasks: 1,
      progressPct: 33,
      totalHours: 2.5,
      completedHours: 0.5,
    };

    return res.json({
      success: true,
      data: {
        date: today,
        tasks: todayTasks,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Get today tasks error:', error);
    return res.status(500).json({ error: 'Failed to get today tasks' });
  }
});

/**
 * GET /api/v1/prep-plan/:childId/progress
 * 获取备考进度统计
 */
router.get('/:childId/progress', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { childId } = req.params;

    // 模拟进度数据
    const progressData = {
      overview: {
        totalDays: 60,
        passedDays: 21,
        remainingDays: 39,
        overallProgress: 35,
        currentPhase: '强化阶段',
      },
      skills: {
        vocabulary: { progress: 40, target: 1500, current: 600, daily: 20 },
        grammar: { progress: 35, target: 100, current: 35, daily: 2 },
        listening: { progress: 30, target: 30, current: 9, daily: 1 },
        speaking: { progress: 25, target: 20, current: 5, daily: 0.5 },
        reading: { progress: 35, target: 40, current: 14, daily: 1 },
        writing: { progress: 30, target: 20, current: 6, daily: 0.5 },
      },
      mockExams: {
        total: 8,
        completed: 2,
        averageScore: 52,
        trend: [45, 52, 58, 55],
        targetScore: 60,
      },
      weakPoints: [
        { skill: '听力', description: '细节信息捕捉不足' },
        { skill: '写作', description: '句式变化较少' },
      ],
      suggestions: [
        '建议每天增加15分钟听力训练',
        '写作可多使用复合句',
        '保持当前学习节奏',
      ],
    };

    return res.json({
      success: true,
      data: progressData,
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    return res.status(500).json({ error: 'Failed to get progress' });
  }
});

/**
 * POST /api/v1/prep-plan/:planId/adjust
 * 调整备考计划
 */
router.post('/:planId/adjust', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { planId } = req.params;
    const { targetDate, addTasks, removeTasks } = req.body;

    // 模拟调整后的计划
    const adjustedPlan = {
      planId,
      targetDate: targetDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      adjustments: {
        targetDateChanged: !!targetDate,
        tasksAdded: addTasks?.length || 0,
        tasksRemoved: removeTasks?.length || 0,
      },
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: adjustedPlan,
    });
  } catch (error: any) {
    console.error('Adjust plan error:', error);
    return res.status(500).json({ error: 'Failed to adjust plan' });
  }
});

export default router;
