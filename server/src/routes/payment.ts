import express, { type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { wechatPayService } from '../services/payment/wechatPay';
import { verifyToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

/**
 * 生成订单号
 */
const generateOrderNo = (type: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const typeCode = type.substring(0, 3).toUpperCase();
  return `${typeCode}${timestamp}${random}`;
};

/**
 * POST /api/v1/payment/create
 * 创建支付订单
 */
router.post('/create', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { orderType, relatedId, amount, discountAmount = 0, description } = req.body;

    if (!orderType || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 校验订单类型
    const validTypes = ['assessment', 'course', 'exam_registration', 'crash_course', 'vip'];
    if (!validTypes.includes(orderType)) {
      return res.status(400).json({ error: 'Invalid order type' });
    }

    const orderNo = generateOrderNo(orderType);
    const actualAmount = Math.max(0, amount - discountAmount);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期

    // 创建支付订单
    const result = await query(
      `INSERT INTO payment_orders 
       (order_no, user_id, order_type, related_id, amount, discount_amount, actual_amount, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
       RETURNING *`,
      [orderNo, userId, orderType, relatedId, amount, discountAmount, actualAmount, expiresAt]
    );

    const order = result.rows[0];

    // 调用微信支付统一下单
    try {
      const payResult = await wechatPayService.unifiedOrder({
        outTradeNo: orderNo,
        totalFee: actualAmount,
        description: description || `订单支付：${orderType}`,
        openid: req.body.openid, // 小程序支付需要
      });

      // 更新订单支付信息
      await query(
        `UPDATE payment_orders SET wechat_pay_id = $1, wechat_pay_url = $2 WHERE order_id = $3`,
        [payResult.prepayId, payResult.codeUrl, order.order_id]
      );

      // 生成JSAPI调起参数
      const appPayParams = wechatPayService.generateAppPayParams(payResult.prepayId);

      return res.json({
        success: true,
        data: {
          orderId: order.order_id,
          orderNo: orderNo,
          amount: actualAmount,
          expiresAt,
          wechatPay: {
            ...appPayParams,
            prepayId: payResult.prepayId,
          },
        },
      });
    } catch (payError: any) {
      console.error('Wechat Pay error:', payError);
      // 即使微信支付失败，也返回订单信息（可用于其他支付方式）
      return res.json({
        success: true,
        data: {
          orderId: order.order_id,
          orderNo: orderNo,
          amount: actualAmount,
          expiresAt,
          wechatPay: null,
          message: 'Order created, Wechat Pay temporarily unavailable',
        },
      });
    }
  } catch (error: any) {
    console.error('Create payment order error:', error);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/**
 * POST /api/v1/payment/notify
 * 微信支付回调通知
 */
router.post('/notify', async (req, res: Response) => {
  try {
    const params = req.body;
    const sendXml = (xml: string) => {
      res.set('Content-Type', 'text/xml');
      return res.send(xml);
    };

    if (params.return_code !== 'SUCCESS') {
      return sendXml('<xml><return_code><![CDATA[FAIL]]></return_code></xml>');
    }

    // 验证签名
    if (!wechatPayService.verifyCallback(params)) {
      console.error('Invalid payment callback signature');
      return sendXml('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>');
    }

    const { out_trade_no, transaction_id, total_fee, cash_fee } = params;

    // 查询订单
    const orderResult = await query(
      'SELECT * FROM payment_orders WHERE order_no = $1',
      [out_trade_no]
    );

    if (orderResult.rows.length === 0) {
      return sendXml('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>');
    }

    const order = orderResult.rows[0];

    // 检查订单状态
    if (order.status === 'paid') {
      return sendXml('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
    }

    // 检查金额
    const paidAmount = parseInt(total_fee) / 100;
    if (paidAmount !== parseFloat(order.actual_amount)) {
      console.error('Amount mismatch:', { expected: order.actual_amount, actual: paidAmount });
      return sendXml('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[金额不匹配]]></return_msg></xml>');
    }

    // 更新订单状态
    await query(
      `UPDATE payment_orders 
       SET status = 'paid', payment_time = CURRENT_TIMESTAMP, payment_method = 'wechat', updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $1`,
      [order.order_id]
    );

    // 根据订单类型处理后续业务
    await handleOrderPaid(order);

    return sendXml('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
  } catch (error) {
    console.error('Payment notify error:', error);
    return (res as any).sendXml('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[系统错误]]></return_msg></xml>');
  }
});

/**
 * 处理订单支付成功后的业务逻辑
 */
async function handleOrderPaid(order: any) {
  switch (order.order_type) {
    case 'assessment':
      // 测评订单：标记为已支付，等待用户完成测评
      await query(
        `UPDATE assessment_orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE order_id = $1`,
        [order.related_id]
      );
      // 发送通知
      await createNotification(order.user_id, 'assessment_paid', '测评订单已支付', '您可以开始进行英语能力测评了', { orderId: order.related_id });
      break;

    case 'course':
      // 课程订单：创建课程报名记录
      const courseResult = await query('SELECT * FROM courses WHERE course_id = $1', [order.related_id]);
      if (courseResult.rows.length > 0) {
        const course = courseResult.rows[0];
        await query(
          `INSERT INTO course_enrollments (user_id, child_id, course_id, status)
           VALUES ($1, $2, $3, 'active')`,
          [order.user_id, course.child_id || order.related_id, order.related_id]
        );
        await query(
          `UPDATE courses SET status = 'published' WHERE course_id = $1`,
          [order.related_id]
        );
      }
      await createNotification(order.user_id, 'course_paid', '课程报名成功', '您已成功报名课程，开始学习吧', { courseId: order.related_id });
      break;

    case 'exam_registration':
      // 考试报名订单：更新报名状态
      await query(
        `UPDATE exam_registrations SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP WHERE registration_id = $1`,
        [order.related_id]
      );
      await createNotification(order.user_id, 'exam_registered', '考试报名已提交', '您的考试报名已提交，请等待审核', { registrationId: order.related_id });
      break;

    case 'crash_course':
      // 冲刺包订单：激活冲刺包
      await query(
        `UPDATE crash_course_orders 
         SET status = 'active', paid_at = CURRENT_TIMESTAMP 
         WHERE order_id = $1`,
        [order.related_id]
      );
      await createNotification(order.user_id, 'crash_course_activated', '冲刺包已激活', '您可以开始使用冲刺包进行模拟考试', { orderId: order.related_id });
      break;

    case 'vip':
      // VIP订单：开通VIP会员
      const vipExpireDate = new Date();
      vipExpireDate.setFullYear(vipExpireDate.getFullYear() + 1);
      await query(
        `INSERT INTO vip_members (user_id, vip_type, expire_date, status)
         VALUES ($1, 'annual', $2, 'active')
         ON CONFLICT (user_id) DO UPDATE SET vip_type = 'annual', expire_date = $2, status = 'active', updated_at = CURRENT_TIMESTAMP`,
        [order.user_id, vipExpireDate]
      );
      await createNotification(order.user_id, 'vip_activated', 'VIP会员已开通', '恭喜您成为年度VIP会员', {});
      break;
  }
}

/**
 * 创建通知
 */
async function createNotification(userId: string, type: string, title: string, content: string, data: any) {
  await query(
    `INSERT INTO notifications (user_id, type, title, content, data)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, title, content, JSON.stringify(data)]
  );
}

/**
 * GET /api/v1/payment/query/:orderNo
 * 查询订单状态
 */
router.get('/query/:orderNo', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { orderNo } = req.params;
    const userId = req.userId;

    const result = await query(
      'SELECT * FROM payment_orders WHERE order_no = $1 AND user_id = $2',
      [orderNo, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Query order error:', error);
    return res.status(500).json({ error: 'Failed to query order' });
  }
});

/**
 * GET /api/v1/payment/list
 * 获取用户支付订单列表
 */
router.get('/list', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { page = 1, pageSize = 10, status } = req.query;

    let sql = 'SELECT * FROM payment_orders WHERE user_id = $1';
    const params: any[] = [userId];

    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(pageSize as string), (parseInt(page as string) - 1) * parseInt(pageSize as string));

    const result = await query(sql, params);

    // 获取总数
    let countSql = 'SELECT COUNT(*) FROM payment_orders WHERE user_id = $1';
    const countParams = [userId];
    if (status) {
      countSql += ' AND status = $2';
      countParams.push(status);
    }
    const countResult = await query(countSql, countParams);

    return res.json({
      success: true,
      data: {
        list: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    return res.status(500).json({ error: 'Failed to list orders' });
  }
});

/**
 * POST /api/v1/payment/refund
 * 申请退款
 */
router.post('/refund', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { orderId, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    // 查询订单
    const orderResult = await query(
      'SELECT * FROM payment_orders WHERE order_id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // 检查订单状态
    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Only paid orders can be refunded' });
    }

    // 检查退款条件（这里简化处理，实际需要根据业务规则判断）
    if (order.order_type === 'exam_registration' && order.status === 'submitted') {
      return res.status(400).json({ error: 'Exam registration cannot be refunded after submission' });
    }

    // 调用微信退款
    const refundSuccess = await wechatPayService.refund(
      order.order_no,
      parseFloat(order.actual_amount),
      parseFloat(order.actual_amount)
    );

    if (refundSuccess) {
      // 更新订单状态
      await query(
        `UPDATE payment_orders SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE order_id = $1`,
        [orderId]
      );

      // 记录退款
      await query(
        `INSERT INTO refund_records (order_id, amount, reason, status, created_at)
         VALUES ($1, $2, $3, 'completed', CURRENT_TIMESTAMP)`,
        [orderId, order.actual_amount, reason || '用户申请退款']
      );

      return res.json({ success: true, message: 'Refund successful' });
    } else {
      return res.status(500).json({ error: 'Refund failed' });
    }
  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({ error: 'Failed to process refund' });
  }
});

/**
 * POST /api/v1/payment/cancel/:orderId
 * 取消订单
 */
router.post('/cancel/:orderId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const result = await query(
      `UPDATE payment_orders 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING *`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // 关闭微信订单
    await wechatPayService.closeOrder(result.rows[0].order_no);

    return res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
