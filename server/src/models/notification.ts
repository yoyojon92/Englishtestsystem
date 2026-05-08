/**
 * 消息通知数据模型
 * Notification Models for Parent/Teacher/Student Communication
 */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>; // 附加数据（报告ID、课程ID等）
  status: NotificationStatus;
  deliveryChannel: DeliveryChannel[];
  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationTemplate {
  id: string;
  code: string; // 模板编码
  name: string; // 模板名称
  type: NotificationType;
  title: string;
  content: string; // 支持变量占位符 {childName}, {courseName}, {date}
  channels: DeliveryChannel[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSchedule {
  id: string;
  templateId: string;
  triggerType: TriggerType;
  triggerConfig: Record<string, any>; // 触发条件配置
  targetUsers: string[]; // 用户ID列表
  targetRoles?: UserRole[]; // 或按角色发送
  scheduledAt: Date | null;
  status: ScheduleStatus;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
}

export interface MessageConversation {
  id: string;
  type: ConversationType;
  participants: string[]; // 用户ID列表
  lastMessage: Message | null;
  unreadCount: Record<string, number>; // 每个用户的未读数
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: UserRole;
  senderName: string;
  content: string;
  messageType: MessageType;
  attachments?: Attachment[];
  status: MessageStatus;
  readBy: string[];
  createdAt: Date;
}

export interface Attachment {
  type: 'image' | 'file' | 'report' | 'audio';
  url: string;
  name?: string;
  size?: number;
}

// 枚举类型
export type NotificationType =
  | 'assessment_complete'    // 测评完成
  | 'report_generated'       // 报告生成
  | 'class_reminder'         // 上课提醒
  | 'class_complete'        // 下课通知
  | 'post_class_report'      // 课后报告
  | 'exam_reminder'          // 考试提醒
  | 'exam_result'           // 考试成绩
  | 'payment_success'       // 支付成功
  | 'exam_ready'           // 考试就绪通知
  | 'system'               // 系统通知
  | 'teacher_message'      // 教师消息
  | 'marketing';           // 营销通知

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export type DeliveryChannel = 'in_app' | 'wechat' | 'sms' | 'email';

export type TriggerType =
  | 'immediate'           // 立即发送
  | 'scheduled'           // 定时发送
  | 'class_end'           // 下课后触发
  | 'exam_registered'     // 报名后触发
  | 'assessment_complete' // 测评完成后触发
  | 'daily_digest'        // 每日摘要
  | 'weekly_report';      // 每周报告

export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | 'school_admin';

export type ConversationType = 'teacher_parent' | 'system_user' | 'group';

export type MessageType = 'text' | 'image' | 'file' | 'report' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// 通知发送配置
export interface NotificationConfig {
  // 短信配置（阿里云/腾讯云）
  sms: {
    enabled: boolean;
    provider: 'aliyun' | 'tencent';
    signName: string;
    templateCodes: Record<NotificationType, string>;
  };
  // 微信模板消息配置
  wechat: {
    enabled: boolean;
    templates: Record<NotificationType, string>;
  };
  // 邮件配置
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    sender: string;
  };
}

// 消息统计
export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  byChannel: Record<DeliveryChannel, { sent: number; delivered: number; read: number }>;
  byType: Record<NotificationType, number>;
  failedRate: number;
  avgDeliveryTime: number; // 秒
}

// 内存存储
export const notifications: Notification[] = [];
export const templates: NotificationTemplate[] = [];
export const schedules: NotificationSchedule[] = [];
export const conversations: MessageConversation[] = [];
export const messages: Message[] = [];

// 初始化默认模板
export function initDefaultTemplates() {
  const defaultTemplates: NotificationTemplate[] = [
    {
      id: 'tpl_assessment_complete',
      code: 'ASSESSMENT_COMPLETE',
      name: '测评完成通知',
      type: 'assessment_complete',
      title: '测评报告已生成',
      content: '{childName}的英语能力测评报告已生成，CEFR等级为{cefrLevel}，词汇量约{vocabularySize}词。点击查看详细报告。',
      channels: ['in_app', 'wechat'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tpl_class_reminder',
      code: 'CLASS_REMINDER',
      name: '上课提醒',
      type: 'class_reminder',
      title: '课程提醒',
      content: '{childName}的{courseName}课程将于{classTime}开始，请提前做好准备。',
      channels: ['in_app', 'wechat'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tpl_post_class',
      code: 'POST_CLASS_REPORT',
      name: '课后报告',
      type: 'post_class_report',
      title: '课后评估报告已生成',
      content: '{childName}今日在{courseName}的表现已生成评估报告。本节课重点：{focusPoints}。建议课后练习：{homework}。',
      channels: ['in_app', 'wechat', 'sms'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tpl_exam_reminder',
      code: 'EXAM_REMINDER',
      name: '考试提醒',
      type: 'exam_reminder',
      title: '考试倒计时提醒',
      content: '{childName}报名的{examName}将于{examDate}开考，还有{daysLeft}天。请提醒孩子做好备考准备。',
      channels: ['in_app', 'wechat'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tpl_exam_result',
      code: 'EXAM_RESULT',
      name: '考试成绩通知',
      type: 'exam_result',
      title: '考试成绩已发布',
      content: '恭喜{childName}！在{examName}考试中取得{grade}成绩（{score}分），已达到目标等级。点击查看详细成绩单。',
      channels: ['in_app', 'wechat'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tpl_exam_ready',
      code: 'EXAM_READY',
      name: '考试就绪通知',
      type: 'exam_ready',
      title: '孩子已达到考试就绪水平',
      content: '根据近期学习数据，{childName}已达到{cefrLevel}水平，建议报名参加{examName}考试。预计通过率{passRate}%。',
      channels: ['in_app', 'wechat'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tpl_teacher_message',
      code: 'TEACHER_MESSAGE',
      name: '教师消息',
      type: 'teacher_message',
      title: '来自{teacherName}的消息',
      content: '{message}',
      channels: ['in_app', 'wechat'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  templates.push(...defaultTemplates);
}

// 初始化
initDefaultTemplates();
