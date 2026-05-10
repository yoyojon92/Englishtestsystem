/**
 * 推送通知服务
 * 支持：微信服务通知、短信、APP推送、邮件
 */

import axios from 'axios';

interface NotificationPayload {
  userId: string;
  openid?: string;
  phone?: string;
  email?: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  channels: ('wechat' | 'sms' | 'app' | 'email')[];
}

type NotificationType = 
  | 'assessment_result'    // 测评报告已生成
  | 'exam_reminder'         // 考试提醒
  | 'mock_exam_result'      // 模拟考试成绩
  | 'class_schedule'        // 课程安排
  | 'post_class_report'     // 课后报告
  | 'payment_success'       // 支付成功
  | 'exam_ready'           // 考试就绪通知
  | 'learning_progress'     // 学习进度
  | 'system_notification'; // 系统通知

interface WechatTemplateMessage {
  touser: string;
  template_id: string;
  page?: string;
  data: Record<string, { value: string; color?: string }>;
}

interface SmsMessage {
  PhoneNumbers: string;
  TemplateCode: string;
  TemplateParam: Record<string, string>;
}

interface AppPushMessage {
  title: string;
  content: string;
  extras?: Record<string, string>;
}

class NotificationService {
  private wechatAccessToken: string | null = null;
  private wechatTokenExpire: number = 0;

  /**
   * 获取微信 Access Token
   */
  private async getWechatAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.wechatAccessToken && now < this.wechatTokenExpire) {
      return this.wechatAccessToken;
    }

    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('WeChat config not found');
    }

    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    
    try {
      const response = await axios.get(url);
      this.wechatAccessToken = response.data.access_token as string;
      this.wechatTokenExpire = now + ((response.data.expires_in as number) - 200) * 1000;
      return this.wechatAccessToken as string;
    } catch (error) {
      console.error('Failed to get WeChat access token:', error);
      throw new Error('Failed to get WeChat access token');
    }
  }

  /**
   * 获取模板消息配置
   */
  private getTemplateConfig(type: NotificationType): { template_id: string; data_keys: string[] } {
    const templates: Record<NotificationType, { template_id: string; data_keys: string[] }> = {
      assessment_result: {
        template_id: process.env.WECHAT_TEMPLATE_ASSESSMENT || 'ASSESSMENT_RESULT_TEMPLATE_ID',
        data_keys: ['level', 'score', 'date'],
      },
      exam_reminder: {
        template_id: process.env.WECHAT_TEMPLATE_EXAM || 'EXAM_REMINDER_TEMPLATE_ID',
        data_keys: ['exam_name', 'exam_date', 'location', 'tips'],
      },
      mock_exam_result: {
        template_id: process.env.WECHAT_TEMPLATE_MOCK_EXAM || 'MOCK_EXAM_TEMPLATE_ID',
        data_keys: ['exam_name', 'score', 'pass_rate', 'suggestion'],
      },
      class_schedule: {
        template_id: process.env.WECHAT_TEMPLATE_CLASS || 'CLASS_SCHEDULE_TEMPLATE_ID',
        data_keys: ['course_name', 'class_time', 'teacher', 'location'],
      },
      post_class_report: {
        template_id: process.env.WECHAT_TEMPLATE_REPORT || 'POST_CLASS_REPORT_TEMPLATE_ID',
        data_keys: ['course_name', 'date', 'summary', 'score'],
      },
      payment_success: {
        template_id: process.env.WECHAT_TEMPLATE_PAYMENT || 'PAYMENT_SUCCESS_TEMPLATE_ID',
        data_keys: ['order_no', 'amount', 'product_name', 'time'],
      },
      exam_ready: {
        template_id: process.env.WECHAT_TEMPLATE_EXAM_READY || 'EXAM_READY_TEMPLATE_ID',
        data_keys: ['exam_name', 'confidence', 'suggestion', 'action'],
      },
      learning_progress: {
        template_id: process.env.WECHAT_TEMPLATE_PROGRESS || 'LEARNING_PROGRESS_TEMPLATE_ID',
        data_keys: ['progress', 'achievement', 'next_goal'],
      },
      system_notification: {
        template_id: process.env.WECHAT_TEMPLATE_SYSTEM || 'SYSTEM_NOTIFICATION_TEMPLATE_ID',
        data_keys: ['content', 'time'],
      },
    };

    return templates[type] || templates.system_notification;
  }

  /**
   * 发送微信服务通知
   */
  async sendWechatMessage(openid: string, type: NotificationType, data: Record<string, string>): Promise<boolean> {
    try {
      const accessToken = await this.getWechatAccessToken();
      const templateConfig = this.getTemplateConfig(type);

      const message: WechatTemplateMessage = {
        touser: openid,
        template_id: templateConfig.template_id,
        page: data.page || 'pages/index/index',
        data: {},
      };

      // 构建模板数据
      for (const key of templateConfig.data_keys) {
        message.data[key] = {
          value: data[key] || '',
          color: key === 'action' ? '#07C160' : '#333333',
        };
      }

      const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;
      const response = await axios.post(url, message);

      if (response.data.errcode === 0) {
        console.log(`Wechat message sent to ${openid}`);
        return true;
      } else {
        console.error(`Wechat send failed:`, response.data);
        return false;
      }
    } catch (error) {
      console.error('Failed to send wechat message:', error);
      return false;
    }
  }

  /**
   * 发送短信
   */
  async sendSms(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean> {
    // 阿里云短信配置
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
    const signName = process.env.ALIYUN_SMS_SIGN_NAME;

    if (!accessKeyId || !accessKeySecret) {
      console.warn('SMS config not found, skipping SMS');
      return false;
    }

    try {
      // 实际使用时需要使用阿里云 SMS SDK
      // 这里简化处理
      const message: SmsMessage = {
        PhoneNumbers: phone,
        TemplateCode: templateCode,
        TemplateParam: params,
      };

      console.warn(`[Notification] SMS would be sent (not implemented):`, message);
      // 实际调用阿里云API
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * 发送 APP 推送 (极光/个推)
   */
  async sendAppPush(deviceToken: string, title: string, content: string, extras?: Record<string, string>): Promise<boolean> {
    const jiguangAppKey = process.env.JIGUANG_APP_KEY;
    const jiguangMasterSecret = process.env.JIGUANG_MASTER_SECRET;

    if (!jiguangAppKey || !jiguangMasterSecret) {
      console.warn('JPush config not found, skipping app push');
      return false;
    }

    try {
      const message: AppPushMessage = {
        title,
        content,
        extras,
      };

      // 实际使用时需要使用极光 SDK
      console.warn(`[Notification] App push would be sent (not implemented):`, message);
      return true;
    } catch (error) {
      console.error('Failed to send app push:', error);
      return false;
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('SMTP config not found, skipping email');
      return false;
    }

    try {
      // 实际使用时需要使用 nodemailer
      console.warn(`[Notification] Email would be sent (not implemented) to ${to}:`, subject);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * 统一发送通知
   */
  async send(payload: NotificationPayload): Promise<{ success: boolean; results: Record<string, boolean> }> {
    const results: Record<string, boolean> = {};
    let allSuccess = true;

    for (const channel of payload.channels) {
      try {
        switch (channel) {
          case 'wechat':
            if (payload.openid) {
              results.wechat = await this.sendWechatMessage(payload.openid, payload.type, {
                ...payload.data,
                content: payload.content,
              });
            }
            break;

          case 'sms':
            if (payload.phone) {
              results.sms = await this.sendSms(
                payload.phone,
                this.getSmsTemplateCode(payload.type),
                { content: payload.content, ...payload.data }
              );
            }
            break;

          case 'app':
            if (payload.data?.deviceToken) {
              results.app = await this.sendAppPush(
                payload.data.deviceToken,
                payload.title,
                payload.content,
                payload.data
              );
            }
            break;

          case 'email':
            if (payload.email) {
              results.email = await this.sendEmail(
                payload.email,
                payload.title,
                `<h2>${payload.title}</h2><p>${payload.content}</p>`
              );
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to send via ${channel}:`, error);
        results[channel] = false;
        allSuccess = false;
      }
    }

    return { success: allSuccess, results };
  }

  /**
   * 获取短信模板码
   */
  private getSmsTemplateCode(type: NotificationType): string {
    const templates: Record<NotificationType, string> = {
      assessment_result: 'SMS_ASSESSMENT_TEMPLATE',
      exam_reminder: 'SMS_EXAM_REMINDER_TEMPLATE',
      mock_exam_result: 'SMS_MOCK_EXAM_TEMPLATE',
      class_schedule: 'SMS_CLASS_TEMPLATE',
      post_class_report: 'SMS_REPORT_TEMPLATE',
      payment_success: 'SMS_PAYMENT_TEMPLATE',
      exam_ready: 'SMS_EXAM_READY_TEMPLATE',
      learning_progress: 'SMS_PROGRESS_TEMPLATE',
      system_notification: 'SMS_SYSTEM_TEMPLATE',
    };
    return templates[type] || 'SMS_SYSTEM_TEMPLATE';
  }

  /**
   * 批量发送通知
   */
  async sendBatch(payloads: NotificationPayload[]): Promise<{ success: boolean; total: number; sent: number }> {
    let sent = 0;
    
    for (const payload of payloads) {
      const result = await this.send(payload);
      if (result.success) sent++;
    }

    return {
      success: sent === payloads.length,
      total: payloads.length,
      sent,
    };
  }

  /**
   * 发送考试提醒
   */
  async sendExamReminder(userId: string, openid: string, examInfo: {
    examName: string;
    examDate: string;
    location: string;
    tips: string;
  }): Promise<boolean> {
    const result = await this.send({
      userId,
      openid,
      type: 'exam_reminder',
      title: '考试提醒',
      content: `您报名的${examInfo.examName}将于${examInfo.examDate}举行`,
      data: examInfo,
      channels: ['wechat'],
    });
    return result.success;
  }

  /**
   * 发送测评报告通知
   */
  async sendAssessmentResult(userId: string, openid: string, result: {
    level: string;
    score: number;
    date: string;
    reportId: string;
  }): Promise<boolean> {
    const result2 = await this.send({
      userId,
      openid,
      type: 'assessment_result',
      title: '测评报告已生成',
      content: `您的英语能力测评报告已生成，综合评级：${result.level}`,
      data: {
        ...result,
        page: `pages/assessment/report?reportId=${result.reportId}`,
      },
      channels: ['wechat'],
    });
    return result2.success;
  }

  /**
   * 发送课后报告
   */
  async sendPostClassReport(userId: string, openid: string, report: {
    courseName: string;
    date: string;
    summary: string;
    score: number;
    reportId: string;
  }): Promise<boolean> {
    const result = await this.send({
      userId,
      openid,
      type: 'post_class_report',
      title: '课后报告已生成',
      content: `${report.courseName}课后评估报告已生成，点击查看详情`,
      data: {
        ...report,
        page: `pages/report/post-class?reportId=${report.reportId}`,
      },
      channels: ['wechat'],
    });
    return result.success;
  }

  /**
   * 发送考试就绪通知
   */
  async sendExamReadyNotification(userId: string, openid: string, data: {
    examName: string;
    confidence: number;
    suggestion: string;
    action: string;
  }): Promise<boolean> {
    const result = await this.send({
      userId,
      openid,
      type: 'exam_ready',
      title: '考试就绪通知',
      content: `恭喜！您已达到${data.examName}报名条件，通过率预测：${data.confidence}%`,
      data: {
        ...data,
        page: 'pages/exam/register',
      },
      channels: ['wechat', 'sms'],
    });
    return result.success;
  }
}

export default new NotificationService();
