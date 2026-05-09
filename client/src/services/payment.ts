/**
 * 支付服务
 * 服务端文件：server/src/routes/payment.ts
 * 接口：POST /api/v1/payment/create - 创建支付订单
 * 接口：GET /api/v1/payment/query/:orderNo - 查询订单状态
 * 接口：GET /api/v1/payment/list - 获取支付订单列表
 * 接口：POST /api/v1/payment/refund - 申请退款
 * 接口：POST /api/v1/payment/cancel/:orderId - 取消订单
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export interface CreatePaymentParams {
  orderType: 'assessment' | 'course' | 'exam_registration' | 'crash_course' | 'vip';
  relatedId?: string;
  amount: number;
  discountAmount?: number;
  description?: string;
  openid?: string;
}

export interface PaymentOrder {
  order_id: string;
  order_no: string;
  user_id: string;
  order_type: string;
  related_id: string;
  amount: number;
  discount_amount: number;
  actual_amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled' | 'expired';
  payment_method?: string;
  payment_time?: string;
  wechat_pay_id?: string;
  expires_at: string;
  created_at: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  data: {
    orderId: string;
    orderNo: string;
    amount: number;
    expiresAt: string;
    wechatPay?: {
      appId: string;
      timeStamp: string;
      nonceStr: string;
      package: string;
      signType: string;
      paySign: string;
      prepayId: string;
    } | null;
  };
}

/**
 * 创建支付订单
 */
export const createPaymentOrder = async (params: CreatePaymentParams, token: string): Promise<CreatePaymentResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error('创建支付订单失败');
  }
  
  return response.json();
};

/**
 * 查询订单状态
 */
export const queryPaymentOrder = async (orderNo: string, token: string): Promise<{ success: boolean; data: PaymentOrder }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payment/query/${orderNo}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('查询订单失败');
  }
  
  return response.json();
};

/**
 * 获取支付订单列表
 */
export const getPaymentOrders = async (
  token: string,
  options?: { page?: number; pageSize?: number; status?: string }
): Promise<{ success: boolean; data: { list: PaymentOrder[]; total: number; page: number; pageSize: number } }> => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
  if (options?.status) params.append('status', options.status);
  
  const response = await fetch(`${API_BASE_URL}/api/v1/payment/list?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('获取订单列表失败');
  }
  
  return response.json();
};

/**
 * 申请退款
 */
export const applyRefund = async (orderId: string, reason?: string, token: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payment/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, reason }),
  });
  
  if (!response.ok) {
    throw new Error('申请退款失败');
  }
  
  return response.json();
};

/**
 * 取消订单
 */
export const cancelPaymentOrder = async (orderId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payment/cancel/${orderId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('取消订单失败');
  }
  
  return response.json();
};

/**
 * 微信小程序调起支付
 * 注意：此函数仅在微信小程序环境中有效
 */
export const requestWechatPay = async (wechatPayParams: CreatePaymentResponse['data']['wechatPay']): Promise<{ errMsg: string; errCode?: number }> => {
  if (!wechatPayParams) {
    return { errMsg: '支付参数无效' };
  }

  // 在微信小程序中调用支付
  if (typeof wx !== 'undefined' && wx.requestPayment) {
    return new Promise((resolve) => {
      wx.requestPayment({
        ...wechatPayParams,
        success: (res: any) => {
          resolve({ errMsg: res.errMsg || 'requestPayment:ok' });
        },
        fail: (err: any) => {
          resolve({ errMsg: err.errMsg || 'requestPayment:fail', errCode: err.errCode });
        },
      });
    });
  }

  // 在 Expo APP 中使用应用内微信支付（需要微信开放平台App支付能力）
  // 这里返回参数，实际调起由原生模块处理
  return { errMsg: 'not-in-wechat-miniprogram' };
};

/**
 * 轮询订单状态
 */
export const pollOrderStatus = async (
  orderNo: string,
  token: string,
  onStatusChange?: (status: string) => void,
  maxAttempts: number = 60,
  intervalMs: number = 3000
): Promise<PaymentOrder> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const result = await queryPaymentOrder(orderNo, token);
        const order = result.data;

        if (onStatusChange) {
          onStatusChange(order.status);
        }

        if (order.status === 'paid') {
          resolve(order);
          return;
        }

        if (order.status === 'cancelled' || order.status === 'expired') {
          reject(new Error('订单已失效'));
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('支付超时'));
          return;
        }

        setTimeout(checkStatus, intervalMs);
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(error);
          return;
        }
        setTimeout(checkStatus, intervalMs);
      }
    };

    checkStatus();
  });
};

export default {
  createPaymentOrder,
  queryPaymentOrder,
  getPaymentOrders,
  applyRefund,
  cancelPaymentOrder,
  requestWechatPay,
  pollOrderStatus,
};
