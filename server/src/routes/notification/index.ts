/**
 * 消息通知 API 路由
 * Parent/Teacher Notification System
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  notifications,
  templates,
  conversations,
  messages,
  type Notification,
  type NotificationTemplate,
  type NotificationType,
  type Message,
  type MessageConversation,
  type DeliveryChannel,
  type NotificationStats,
} from '../../models/notification';

const router = Router();

// ==================== 通知相关 ====================

/**
 * GET /api/v1/notifications
 * 获取用户通知列表
 */
router.get('/', (req: any, res: any) => {
  const { userId, type, status, page = 1, pageSize = 20 } = req.query;
  
  let filtered = notifications.filter(n => n.userId === userId || !userId);
  
  if (type) {
    filtered = filtered.filter(n => n.type === type);
  }
  if (status) {
    filtered = filtered.filter(n => n.status === status);
  }
  
  // 按时间倒序
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // 分页
  const start = (Number(page) - 1) * Number(pageSize);
  const end = start + Number(pageSize);
  const list = filtered.slice(start, end);
  
  res.json({
    success: true,
    data: {
      list,
      total: filtered.length,
      page: Number(page),
      pageSize: Number(pageSize),
    },
  });
});

/**
 * POST /api/v1/notifications
 * 发送通知
 */
router.post('/', (req: any, res: any) => {
  const { userId, type, title, content, data, channels = ['in_app'] } = req.body;
  
  if (!userId || !type || !title || !content) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  const notification: Notification = {
    id: uuidv4(),
    userId,
    type,
    title,
    content,
    data,
    status: 'pending',
    deliveryChannel: channels,
    sentAt: null,
    readAt: null,
    createdAt: new Date(),
  };
  
  // 模拟发送
  setTimeout(() => {
    notification.status = 'sent';
    notification.sentAt = new Date();
  }, 100);
  
  notifications.push(notification);
  
  res.json({ success: true, data: notification });
});

/**
 * POST /api/v1/notifications/batch
 * 批量发送通知
 */
router.post('/batch', (req: any, res: any) => {
  const { userIds, type, title, content, data, channels = ['in_app'] } = req.body;
  
  if (!userIds || !Array.isArray(userIds) || !title || !content) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  const results: Notification[] = [];
  
  userIds.forEach((userId: string) => {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      type: type || 'system',
      title,
      content,
      data,
      status: 'sent',
      deliveryChannel: channels,
      sentAt: new Date(),
      readAt: null,
      createdAt: new Date(),
    };
    notifications.push(notification);
    results.push(notification);
  });
  
  res.json({ success: true, data: { sent: results.length, notifications: results } });
});

/**
 * PUT /api/v1/notifications/:id/read
 * 标记通知已读
 */
router.put('/:id/read', (req: any, res: any) => {
  const notification = notifications.find(n => n.id === req.params.id);
  
  if (!notification) {
    return res.status(404).json({ success: false, message: '通知不存在' });
  }
  
  notification.status = 'read';
  notification.readAt = new Date();
  
  res.json({ success: true, data: notification });
});

/**
 * PUT /api/v1/notifications/read-all
 * 标记所有通知已读
 */
router.put('/read-all', (req: any, res: any) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: '缺少用户ID' });
  }
  
  const userNotifications = notifications.filter(n => n.userId === userId && n.status !== 'read');
  userNotifications.forEach(n => {
    n.status = 'read';
    n.readAt = new Date();
  });
  
  res.json({ success: true, data: { readCount: userNotifications.length } });
});

/**
 * DELETE /api/v1/notifications/:id
 * 删除通知
 */
router.delete('/:id', (req: any, res: any) => {
  const index = notifications.findIndex(n => n.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: '通知不存在' });
  }
  
  notifications.splice(index, 1);
  
  res.json({ success: true, message: '删除成功' });
});

/**
 * GET /api/v1/notifications/unread-count
 * 获取未读通知数量
 */
router.get('/stats/unread', (req: any, res: any) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: '缺少用户ID' });
  }
  
  const unreadCount = notifications.filter(
    n => n.userId === userId && n.status !== 'read' && n.status !== 'failed'
  ).length;
  
  res.json({ success: true, data: { unreadCount } });
});

/**
 * GET /api/v1/notifications/stats
 * 获取通知统计
 */
router.get('/stats/summary', (req: any, res: any) => {
  const { userId } = req.query;
  
  const targetNotifications = userId 
    ? notifications.filter(n => n.userId === userId)
    : notifications;
  
  const stats: NotificationStats = {
    totalSent: targetNotifications.filter(n => n.status === 'sent' || n.status === 'read').length,
    totalDelivered: targetNotifications.filter(n => n.status === 'delivered' || n.status === 'read').length,
    totalRead: targetNotifications.filter(n => n.status === 'read').length,
    byChannel: {
      in_app: { sent: 0, delivered: 0, read: 0 },
      wechat: { sent: 0, delivered: 0, read: 0 },
      sms: { sent: 0, delivered: 0, read: 0 },
      email: { sent: 0, delivered: 0, read: 0 },
    },
    byType: {
      assessment_complete: 0,
      report_generated: 0,
      class_reminder: 0,
      class_complete: 0,
      post_class_report: 0,
      exam_reminder: 0,
      exam_result: 0,
      payment_success: 0,
      exam_ready: 0,
      system: 0,
      teacher_message: 0,
      marketing: 0,
    },
    failedRate: targetNotifications.length > 0 
      ? targetNotifications.filter(n => n.status === 'failed').length / targetNotifications.length 
      : 0,
    avgDeliveryTime: 2.5, // 秒
  };
  
  // 按渠道统计
  targetNotifications.forEach(n => {
    n.deliveryChannel.forEach(channel => {
      if (n.status === 'sent' || n.status === 'read') stats.byChannel[channel].sent++;
      if (n.status === 'delivered' || n.status === 'read') stats.byChannel[channel].delivered++;
      if (n.status === 'read') stats.byChannel[channel].read++;
    });
    stats.byType[n.type]++;
  });
  
  res.json({ success: true, data: stats });
});

// ==================== 模板相关 ====================

/**
 * GET /api/v1/notifications/templates
 * 获取通知模板列表
 */
router.get('/templates/list', (req: any, res: any) => {
  const { type, isActive } = req.query;
  
  let filtered = [...templates];
  
  if (type) {
    filtered = filtered.filter(t => t.type === type);
  }
  if (isActive !== undefined) {
    filtered = filtered.filter(t => t.isActive === (isActive === 'true'));
  }
  
  res.json({ success: true, data: filtered });
});

/**
 * GET /api/v1/notifications/templates/:id
 * 获取模板详情
 */
router.get('/templates/:id', (req: any, res: any) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ success: false, message: '模板不存在' });
  }
  
  res.json({ success: true, data: template });
});

/**
 * POST /api/v1/notifications/templates
 * 创建通知模板
 */
router.post('/templates', (req: any, res: any) => {
  const { code, name, type, title, content, channels } = req.body;
  
  if (!code || !name || !type || !title || !content) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  // 检查编码唯一性
  if (templates.some(t => t.code === code)) {
    return res.status(400).json({ success: false, message: '模板编码已存在' });
  }
  
  const template: NotificationTemplate = {
    id: uuidv4(),
    code,
    name,
    type,
    title,
    content,
    channels: channels || ['in_app'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  templates.push(template);
  
  res.json({ success: true, data: template });
});

/**
 * PUT /api/v1/notifications/templates/:id
 * 更新模板
 */
router.put('/templates/:id', (req: any, res: any) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ success: false, message: '模板不存在' });
  }
  
  const { name, title, content, channels, isActive } = req.body;
  
  if (name) template.name = name;
  if (title) template.title = title;
  if (content) template.content = content;
  if (channels) template.channels = channels;
  if (isActive !== undefined) template.isActive = isActive;
  template.updatedAt = new Date();
  
  res.json({ success: true, data: template });
});

/**
 * POST /api/v1/notifications/templates/:id/send
 * 使用模板发送通知
 */
router.post('/templates/:id/send', (req: any, res: any) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ success: false, message: '模板不存在' });
  }
  
  const { userId, variables } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: '缺少用户ID' });
  }
  
  // 替换变量
  let content = template.content;
  let title = template.title;
  
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      content = content.replace(regex, String(value));
      title = title.replace(regex, String(value));
    });
  }
  
  const notification: Notification = {
    id: uuidv4(),
    userId,
    type: template.type,
    title,
    content,
    data: variables,
    status: 'sent',
    deliveryChannel: template.channels,
    sentAt: new Date(),
    readAt: null,
    createdAt: new Date(),
  };
  
  notifications.push(notification);
  
  res.json({ success: true, data: notification });
});

// ==================== 对话消息相关 ====================

/**
 * GET /api/v1/notifications/conversations
 * 获取用户对话列表
 */
router.get('/conversations', (req: any, res: any) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: '缺少用户ID' });
  }
  
  const userConversations = conversations.filter(c => c.participants.includes(userId));
  
  res.json({ success: true, data: userConversations });
});

/**
 * GET /api/v1/notifications/:id
 * 获取通知详情
 */
router.get('/:id', (req: any, res: any) => {
  const notification = notifications.find(n => n.id === req.params.id);
  
  if (!notification) {
    return res.status(404).json({ success: false, message: '通知不存在' });
  }
  
  res.json({ success: true, data: notification });
});

/**
 * GET /api/v1/notifications/conversations/:id/messages
 * 获取对话消息列表
 */
router.get('/conversations/:id/messages', (req: any, res: any) => {
  const { page = 1, pageSize = 50 } = req.query;
  
  const conversationMessages = messages
    .filter(m => m.conversationId === req.params.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const start = (Number(page) - 1) * Number(pageSize);
  const end = start + Number(pageSize);
  
  res.json({
    success: true,
    data: {
      list: conversationMessages.slice(start, end),
      total: conversationMessages.length,
      page: Number(page),
      pageSize: Number(pageSize),
    },
  });
});

/**
 * POST /api/v1/notifications/conversations
 * 创建或获取对话
 */
router.post('/conversations', (req: any, res: any) => {
  const { participants, type = 'teacher_parent' } = req.body;
  
  if (!participants || participants.length < 2) {
    return res.status(400).json({ success: false, message: '参与者至少需要2个' });
  }
  
  // 检查是否已存在相同参与者的对话
  const existing = conversations.find(c => {
    const sameParticipants = c.participants.length === participants.length &&
      participants.every((p: string) => c.participants.includes(p));
    return sameParticipants && c.type === type;
  });
  
  if (existing) {
    return res.json({ success: true, data: existing });
  }
  
  const conversation: MessageConversation = {
    id: uuidv4(),
    type,
    participants,
    lastMessage: null,
    unreadCount: Object.fromEntries(participants.map((p: string) => [p, 0])),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  conversations.push(conversation);
  
  res.json({ success: true, data: conversation });
});

/**
 * POST /api/v1/notifications/messages
 * 发送消息
 */
router.post('/messages', (req: any, res: any) => {
  const { conversationId, senderId, senderType, senderName, content, messageType = 'text', attachments } = req.body;
  
  if (!conversationId || !senderId || !senderName || !content) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ success: false, message: '对话不存在' });
  }
  
  const message: Message = {
    id: uuidv4(),
    conversationId,
    senderId,
    senderType,
    senderName,
    content,
    messageType,
    attachments,
    status: 'sent',
    readBy: [senderId],
    createdAt: new Date(),
  };
  
  messages.push(message);
  
  // 更新对话
  conversation.lastMessage = message;
  conversation.updatedAt = new Date();
  
  // 更新未读数
  conversation.participants.forEach(p => {
    if (p !== senderId) {
      conversation.unreadCount[p] = (conversation.unreadCount[p] || 0) + 1;
    }
  });
  
  res.json({ success: true, data: message });
});

/**
 * PUT /api/v1/notifications/conversations/:id/read
 * 标记对话已读
 */
router.put('/conversations/:id/read', (req: any, res: any) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: '缺少用户ID' });
  }
  
  const conversation = conversations.find(c => c.id === req.params.id);
  if (!conversation) {
    return res.status(404).json({ success: false, message: '对话不存在' });
  }
  
  // 标记消息已读
  messages.forEach(m => {
    if (m.conversationId === req.params.id && !m.readBy.includes(userId)) {
      m.readBy.push(userId);
      m.status = 'read';
    }
  });
  
  // 重置未读数
  conversation.unreadCount[userId] = 0;
  
  res.json({ success: true, message: '已标记已读' });
});

export default router;
