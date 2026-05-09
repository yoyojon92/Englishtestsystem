/**
 * 企业微信集成 API
 * 教师端接口
 */

import express from 'express';
import { Router } from 'express';
import * as wecomClient from '../../services/wecom/client';

const router = Router();

// ============== 内存数据存储 ==============

interface Teacher {
  id: string;
  userId: string; // 企业微信 UserID
  name: string;
  phone: string;
  avatar: string;
  bio: string;
  specialties: string[];
  schoolId: string;
  status: 'active' | 'inactive';
  classes: string[];
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
  courseType: string;
  levelRequired: string;
  teacherId: string;
  schoolId: string;
  schedule: { day: string; time: string }[];
  maxStudents: number;
  currentStudents: number;
  students: string[];
}

interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  parentUserId: string;
  parentPhone: string;
  classIds: string[];
  cefrLevel: string;
  vocabularySize: number;
  status: 'active' | 'inactive';
}

interface Message {
  id: string;
  teacherId: string;
  studentId: string;
  parentUserId: string;
  type: 'text' | 'report' | 'notice' | 'reminder';
  content: string;
  attachments?: { type: string; url: string; name: string }[];
  isRead: boolean;
  createdAt: string;
}

// 课后报告存储
interface PostClassReport {
  id: string;
  teacherId: string;
  childId: string;
  classId: string;
  classDate: string;
  content: { summary: string; performance: string; homework: string; suggestions: string };
  aiScores: { overall: number; vocabulary: number; grammar: number; pronunciation: number; fluency: number; interaction: number };
  teacherComment?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  pushedToParent: boolean;
  pushedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParentNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  sendStatus: string;
  sentAt: string;
  deliveryChannel: string[];
}

const postClassReports: PostClassReport[] = [];
const parentNotifications: ParentNotification[] = [];

// 模拟数据
const teachers: Map<string, Teacher> = new Map([
  ['t1', {
    id: 't1',
    userId: 'wecom_user_001',
    name: '张老师',
    phone: '13800138001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: '英语专业八级，10年教学经验，擅长KET/PET培训',
    specialties: ['KET', 'PET', '口语'],
    schoolId: 'school_001',
    status: 'active',
    classes: ['c1', 'c2'],
    createdAt: '2024-01-01',
  }],
  ['t2', {
    id: 't2',
    userId: 'wecom_user_002',
    name: '李老师',
    phone: '13800138002',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'TESOL认证，擅长自然拼读和阅读教学',
    specialties: ['自然拼读', '阅读', '写作'],
    schoolId: 'school_001',
    status: 'active',
    classes: ['c3'],
    createdAt: '2024-01-15',
  }],
]);

const classes: Map<string, Class> = new Map([
  ['c1', {
    id: 'c1',
    name: 'KET冲刺班-A班',
    courseType: 'KET',
    levelRequired: 'A2',
    teacherId: 't1',
    schoolId: 'school_001',
    schedule: [
      { day: '周六', time: '10:00-12:00' },
      { day: '周三', time: '18:00-20:00' },
    ],
    maxStudents: 15,
    currentStudents: 12,
    students: ['s1', 's2', 's3'],
  }],
  ['c2', {
    id: 'c2',
    name: 'PET强化班',
    courseType: 'PET',
    levelRequired: 'B1',
    teacherId: 't1',
    schoolId: 'school_001',
    schedule: [
      { day: '周日', time: '14:00-16:00' },
    ],
    maxStudents: 12,
    currentStudents: 8,
    students: ['s4', 's5'],
  }],
  ['c3', {
    id: 'c3',
    name: '自然拼读启蒙班',
    courseType: 'Phonics',
    levelRequired: 'Pre-A1',
    teacherId: 't2',
    schoolId: 'school_001',
    schedule: [
      { day: '周五', time: '16:00-17:30' },
      { day: '周六', time: '14:00-15:30' },
    ],
    maxStudents: 20,
    currentStudents: 15,
    students: ['s6', 's7', 's8'],
  }],
]);

const students: Map<string, Student> = new Map([
  ['s1', {
    id: 's1',
    name: '王小明',
    age: 10,
    grade: '四年级',
    parentUserId: 'parent_001',
    parentPhone: '13900139001',
    classIds: ['c1'],
    cefrLevel: 'A2',
    vocabularySize: 1500,
    status: 'active',
  }],
  ['s2', {
    id: 's2',
    name: '李小红',
    age: 11,
    grade: '五年级',
    parentUserId: 'parent_002',
    parentPhone: '13900139002',
    classIds: ['c1'],
    cefrLevel: 'A2',
    vocabularySize: 1800,
    status: 'active',
  }],
  ['s3', {
    id: 's3',
    name: '张小宝',
    age: 9,
    grade: '三年级',
    parentUserId: 'parent_003',
    parentPhone: '13900139003',
    classIds: ['c1'],
    cefrLevel: 'A1',
    vocabularySize: 800,
    status: 'active',
  }],
]);

const messages: Map<string, Message> = new Map();

// ============== 路由接口 ==============

/**
 * GET /api/v1/wecom/status
 * 获取企业微信连接状态
 */
router.get('/status', async (req: any, res: any) => {
  try {
    res.json({
      success: true,
      data: {
        connected: true,
        corpId: 'YOUR_CORP_ID',
        agentId: 'YOUR_AGENT_ID',
        features: {
          oauth: true,
          message: true,
          groupMessage: true,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

/**
 * GET /api/v1/wecom/teachers
 * 获取教师列表
 */
router.get('/teachers', (req: any, res: any) => {
  const { schoolId, status } = req.query;
  
  let result = Array.from(teachers.values());
  
  if (schoolId) {
    result = result.filter(t => t.schoolId === schoolId);
  }
  if (status) {
    result = result.filter(t => t.status === status);
  }
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/v1/wecom/teachers/:id
 * 获取教师详情
 */
router.get('/teachers/:id', (req: any, res: any) => {
  const teacher = teachers.get(req.params.id);
  
  if (!teacher) {
    return res.status(404).json({ success: false, error: 'Teacher not found' });
  }
  
  // 获取该教师的学生列表
  const classList = Array.from(classes.values()).filter(c => c.teacherId === req.params.id);
  const studentList = classList.flatMap(c => 
    c.students.map(sid => students.get(sid)).filter(Boolean)
  );
  
  res.json({
    success: true,
    data: {
      ...teacher,
      classList,
      studentCount: studentList.length,
    },
  });
});

/**
 * GET /api/v1/wecom/classes
 * 获取班级列表
 */
router.get('/classes', (req: any, res: any) => {
  const { teacherId, schoolId } = req.query;
  
  let result = Array.from(classes.values());
  
  if (teacherId) {
    result = result.filter(c => c.teacherId === teacherId);
  }
  if (schoolId) {
    result = result.filter(c => c.schoolId === schoolId);
  }
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/v1/wecom/classes/:id
 * 获取班级详情
 */
router.get('/classes/:id', (req: any, res: any) => {
  const cls = classes.get(req.params.id);
  
  if (!cls) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }
  
  // 获取班级学生详情
  const studentList = cls.students.map(sid => students.get(sid)).filter(Boolean);
  const teacher = teachers.get(cls.teacherId);
  
  res.json({
    success: true,
    data: {
      ...cls,
      teacher,
      students: studentList,
    },
  });
});

/**
 * GET /api/v1/wecom/students
 * 获取学生列表
 */
router.get('/students', (req: any, res: any) => {
  const { classId, teacherId, cefrLevel } = req.query;
  
  let result = Array.from(students.values());
  
  if (classId) {
    const cls = classes.get(classId as string);
    if (cls) {
      result = result.filter(s => cls.students.includes(s.id));
    }
  }
  if (teacherId) {
    const teacherClasses = Array.from(classes.values())
      .filter(c => c.teacherId === teacherId)
      .flatMap(c => c.students);
    result = result.filter(s => teacherClasses.includes(s.id));
  }
  if (cefrLevel) {
    result = result.filter(s => s.cefrLevel === cefrLevel);
  }
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/v1/wecom/students/:id
 * 获取学生详情
 */
router.get('/students/:id', (req: any, res: any) => {
  const student = students.get(req.params.id);
  
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  
  // 获取学生所在班级
  const classList = Array.from(classes.values())
    .filter(c => c.students.includes(req.params.id));
  
  res.json({
    success: true,
    data: {
      ...student,
      classes: classList,
    },
  });
});

/**
 * GET /api/v1/wecom/messages
 * 获取消息列表
 */
router.get('/messages', (req: any, res: any) => {
  const { teacherId, studentId, type, page = 1, pageSize = 20 } = req.query;
  
  let result = Array.from(messages.values());
  
  if (teacherId) {
    result = result.filter(m => m.teacherId === teacherId);
  }
  if (studentId) {
    result = result.filter(m => m.studentId === studentId);
  }
  if (type) {
    result = result.filter(m => m.type === type);
  }
  
  // 按时间倒序
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // 分页
  const start = (Number(page) - 1) * Number(pageSize);
  const paginatedResult = result.slice(start, start + Number(pageSize));
  
  res.json({
    success: true,
    data: {
      list: paginatedResult,
      total: result.length,
      page: Number(page),
      pageSize: Number(pageSize),
    },
  });
});

/**
 * POST /api/v1/wecom/messages
 * 发送消息
 */
router.post('/messages', async (req: any, res: any) => {
  const { teacherId, studentId, parentUserId, type, content, attachments } = req.body;
  
  if (!content) {
    return res.status(400).json({ success: false, error: 'Content is required' });
  }
  
  const message: Message = {
    id: `msg_${Date.now()}`,
    teacherId,
    studentId,
    parentUserId,
    type: type || 'text',
    content,
    attachments,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  
  messages.set(message.id, message);
  
  // 如果配置了企业微信，尝试发送
  try {
    if (parentUserId) {
      await wecomClient.sendTextMessage(parentUserId, `[教师消息] ${content}`);
    }
  } catch (error) {
    console.log('Failed to send wecom message:', error);
  }
  
  res.json({
    success: true,
    data: message,
  });
});

/**
 * POST /api/v1/wecom/messages/batch
 * 批量发送消息（群发）
 */
router.post('/messages/batch', async (req: any, res: any) => {
  const { teacherId, classId, type, content, attachments } = req.body;
  
  if (!content || (!classId && !teacherId)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Content and classId or teacherId are required' 
    });
  }
  
  // 获取目标用户
  let targetStudents: Student[] = [];
  
  if (classId) {
    const cls = classes.get(classId);
    if (cls) {
      targetStudents = cls.students.map(sid => students.get(sid)).filter(Boolean) as Student[];
    }
  } else if (teacherId) {
    const teacherClasses = Array.from(classes.values()).filter(c => c.teacherId === teacherId);
    targetStudents = teacherClasses.flatMap(c => 
      c.students.map(sid => students.get(sid)).filter(Boolean)
    ) as Student[];
  }
  
  // 创建消息记录
  const createdMessages: Message[] = [];
  
  for (const student of targetStudents) {
    const message: Message = {
      id: `msg_${Date.now()}_${student.id}`,
      teacherId,
      studentId: student.id,
      parentUserId: student.parentUserId,
      type: type || 'notice',
      content,
      attachments,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    messages.set(message.id, message);
    createdMessages.push(message);
    
    // 发送企业微信消息
    try {
      if (student.parentUserId) {
        await wecomClient.sendTextMessage(student.parentUserId, `[班级通知] ${content}`);
      }
    } catch (error) {
      console.log('Failed to send wecom message to:', student.parentUserId);
    }
  }
  
  res.json({
    success: true,
    data: {
      sentCount: createdMessages.length,
      messages: createdMessages,
    },
  });
});

/**
 * GET /api/v1/wecom/stats
 * 获取统计数据
 */
router.get('/stats', (req: any, res: any) => {
  const { teacherId, schoolId } = req.query;
  
  // 获取班级
  let classList = Array.from(classes.values());
  if (teacherId) {
    classList = classList.filter(c => c.teacherId === teacherId);
  }
  if (schoolId) {
    classList = classList.filter(c => c.schoolId === schoolId);
  }
  
  // 获取学生
  const classIds = classList.map(c => c.id);
  const studentList = Array.from(students.values()).filter(s => 
    s.classIds.some(cid => classIds.includes(cid))
  );
  
  // 计算统计数据
  const stats = {
    teacherCount: teacherId ? 1 : Array.from(teachers.values()).filter(t => 
      (!schoolId || t.schoolId === schoolId) && t.status === 'active'
    ).length,
    classCount: classList.length,
    studentCount: studentList.length,
    avgVocabulary: studentList.length > 0 
      ? Math.round(studentList.reduce((sum, s) => sum + s.vocabularySize, 0) / studentList.length)
      : 0,
    cefrDistribution: {
      PreA1: studentList.filter(s => s.cefrLevel === 'Pre-A1').length,
      A1: studentList.filter(s => s.cefrLevel === 'A1').length,
      A2: studentList.filter(s => s.cefrLevel === 'A2').length,
      B1: studentList.filter(s => s.cefrLevel === 'B1').length,
      B2: studentList.filter(s => s.cefrLevel === 'B2').length,
    },
    upcomingExams: [
      { studentName: '王小明', examType: 'KET', examDate: '2025-02-15' },
      { studentName: '李小红', examType: 'PET', examDate: '2025-02-20' },
    ],
    attentionNeeded: studentList.filter(s => s.vocabularySize < 1000).map(s => ({
      id: s.id,
      name: s.name,
      issue: '词汇量偏低，建议加强词汇训练',
      cefrLevel: s.cefrLevel,
    })),
  };
  
  res.json({
    success: true,
    data: stats,
  });
});

/**
 * POST /api/v1/wecom/report/send
 * 发送课后报告给家长
 */
router.post('/report/send', async (req: any, res: any) => {
  const { studentId, teacherId, reportContent, scores } = req.body;
  
  if (!studentId || !reportContent) {
    return res.status(400).json({ 
      success: false, 
      error: 'studentId and reportContent are required' 
    });
  }
  
  const student = students.get(studentId);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  
  // 创建消息
  const message: Message = {
    id: `msg_${Date.now()}`,
    teacherId,
    studentId,
    parentUserId: student.parentUserId,
    type: 'report',
    content: reportContent,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.set(message.id, message);
  
  // 发送企业微信消息
  let wecomResult = null;
  try {
    if (student.parentUserId) {
      const markdown = `
# 课后评估报告

**学生**: ${student.name}
**班级**: ${Array.from(classes.values()).find(c => c.students.includes(studentId))?.name || 'N/A'}

## 今日表现

${reportContent}

## 评分
${scores ? `
- 流利度: ${scores.fluency || 'N/A'}/100
- 准确度: ${scores.accuracy || 'N/A'}/100
- 词汇: ${scores.vocabulary || 'N/A'}/100
- 发音: ${scores.pronunciation || 'N/A'}/100
` : ''}

---
来自: 张老师
      `.trim();
      
      wecomResult = await wecomClient.sendMarkdownMessage(student.parentUserId, markdown);
    }
  } catch (error) {
    console.log('Failed to send wecom report:', error);
  }
  
  res.json({
    success: true,
    data: {
      message,
      wecomResult,
    },
  });
});

export default router;

// ============== 课后报告管理 ==============

/**
 * GET /api/v1/wecom/post-class-reports
 * 获取课后报告列表
 */
router.get('/post-class-reports', (req: any, res: any) => {
  const { teacherId, childId, classId, startDate, endDate } = req.query;
  let reports = [...postClassReports];
  
  if (teacherId) reports = reports.filter(r => r.teacherId === teacherId);
  if (childId) reports = reports.filter(r => r.childId === childId);
  if (classId) reports = reports.filter(r => r.classId === classId);
  
  res.json({ success: true, data: reports, total: reports.length });
});

/**
 * POST /api/v1/wecom/post-class-reports
 * 创建课后报告
 */
router.post('/post-class-reports', (req: any, res: any) => {
  const { teacherId, childId, classId, classDate, content, aiScores } = req.body;
  
  const report = {
    id: `pcr_${Date.now()}`,
    teacherId,
    childId,
    classId,
    classDate: classDate || new Date().toISOString(),
    content: content || { summary: '', performance: '', homework: '', suggestions: '' },
    aiScores: aiScores || { overall: 0, vocabulary: 0, grammar: 0, pronunciation: 0, fluency: 0, interaction: 0 },
    status: 'pending_review' as const,
    pushedToParent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  postClassReports.push(report);
  
  res.json({ success: true, data: report });
});

/**
 * PUT /api/v1/wecom/post-class-reports/:id/review
 * 审核课后报告并推送给家长
 */
router.put('/post-class-reports/:id/review', (req: any, res: any) => {
  const { id } = req.params;
  const { teacherComment, pushToParent } = req.body;
  
  const report = postClassReports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ success: false, message: '报告不存在' });
  }
  
  report.teacherComment = teacherComment;
  report.status = 'approved';
  report.pushedToParent = pushToParent;
  report.updatedAt = new Date().toISOString();
  
  if (pushToParent) {
    // 推送到家长端
    report.pushedAt = new Date().toISOString();
    parentNotifications.push({
      id: `notif_${Date.now()}`,
      userId: `parent_${report.childId}`,
      type: 'post_class_report',
      title: '课后报告已生成',
      content: `孩子的第${report.classDate}课后报告已发布，请查看`,
      sendStatus: 'sent',
      sentAt: new Date().toISOString(),
      deliveryChannel: ['app', 'wechat'],
    });
  }
  
  res.json({ success: true, data: report });
});

/**
 * GET /api/v1/wecom/post-class-reports/:id
 * 获取课后报告详情
 */
router.get('/post-class-reports/:id', (req: any, res: any) => {
  const { id } = req.params;
  const report = postClassReports.find(r => r.id === id);
  
  if (!report) {
    return res.status(404).json({ success: false, message: '报告不存在' });
  }
  
  res.json({ success: true, data: report });
});
