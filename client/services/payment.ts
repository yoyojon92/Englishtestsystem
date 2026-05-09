// 支付服务
export interface PaymentResult {
  success: boolean;
  orderNo?: string;
  message?: string;
}

export const createPayment = async (amount: number, description: string): Promise<PaymentResult> => {
  return { success: false, message: '支付功能开发中' };
};
