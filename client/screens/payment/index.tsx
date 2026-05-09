import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import {
  createPaymentOrder,
  pollOrderStatus,
  requestWechatPay,
  CreatePaymentParams,
} from '@/services/payment';

type OrderType = 'assessment' | 'course' | 'exam_registration' | 'crash_course' | 'vip';

interface ProductInfo {
  type: OrderType;
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  relatedId?: string;
}

const PRODUCT_MAP: Record<string, ProductInfo> = {
  assessment: {
    type: 'assessment',
    name: '英语能力测评',
    description: 'AI智能评估 · CEFR定级 · 专业报告',
    originalPrice: 59.9,
    price: 59.9,
  },
  ket_crash: {
    type: 'crash_course',
    name: 'KET冲刺包',
    description: '8次全真模拟 + 专项训练 + 技巧课',
    originalPrice: 199,
    price: 199,
  },
  pet_crash: {
    type: 'crash_course',
    name: 'PET冲刺包',
    description: '8次全真模拟 + 专项训练 + 技巧课',
    originalPrice: 249,
    price: 249,
  },
  basic_registration: {
    type: 'exam_registration',
    name: '基础代报名服务',
    description: '信息填写 + 提交 + 跟踪',
    originalPrice: 99,
    price: 99,
  },
  vip_registration: {
    type: 'exam_registration',
    name: 'VIP代报名服务',
    description: '全方位服务 + 准考证提醒 + 考点指引',
    originalPrice: 199,
    price: 199,
  },
  vip_member: {
    type: 'vip',
    name: '年度VIP会员',
    description: '免费模拟考 + 优先预约 + 专属优惠',
    originalPrice: 999,
    price: 699,
  },
};

export default function PaymentPage() {
  const router = useSafeRouter();
  const { productId } = useSafeSearchParams<{ productId?: string }>();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // 获取产品信息
  const product = productId ? PRODUCT_MAP[productId] || PRODUCT_MAP.assessment : PRODUCT_MAP.assessment;
  const discount = product.originalPrice - product.price;

  // 创建订单
  const handleCreateOrder = async () => {
    if (!token) {
      Alert.alert('提示', '请先登录');
      router.push('/auth');
      return;
    }

    setLoading(true);
    try {
      const params: CreatePaymentParams = {
        orderType: product.type,
        relatedId: product.relatedId,
        amount: product.originalPrice,
        discountAmount: discount,
        description: `${product.name} - ${product.description}`,
      };

      const response = await createPaymentOrder(params, token);

      if (response.success) {
        setOrderNo(response.data.orderNo);
        setExpiresAt(new Date(response.data.expiresAt));
        
        // 如果有微信支付参数，调起支付
        if (response.data.wechatPay) {
          await handleWechatPay(response.data.wechatPay);
        }
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 调起微信支付
  const handleWechatPay = async (wechatPayParams: NonNullable<CreatePaymentParams>) => {
    setPaying(true);
    try {
      const result = await requestWechatPay(wechatPayParams as any);

      if (result.errMsg === 'requestPayment:ok') {
        // 支付成功，跳转到成功页面
        router.replace({
          pathname: '/payment/success',
          params: { orderNo },
        });
      } else if (result.errMsg === 'not-in-wechat-miniprogram') {
        // 非小程序环境，显示订单信息引导用户去小程序支付
        Alert.alert(
          '请在微信中完成支付',
          `订单号：${orderNo}\n\n金额：¥${product.price}`,
          [
            { text: '取消', style: 'cancel' },
            { text: '刷新状态', onPress: () => handleRefreshStatus() },
          ]
        );
      } else {
        // 用户取消或其他错误
        console.log('Payment failed:', result);
      }
    } catch (error) {
      console.error('Wechat pay error:', error);
    } finally {
      setPaying(false);
    }
  };

  // 轮询订单状态
  const handleRefreshStatus = async () => {
    if (!orderNo || !token) return;

    setLoading(true);
    try {
      const order = await pollOrderStatus(orderNo, token, (status) => {
        console.log('Order status:', status);
      });

      if (order.status === 'paid') {
        router.replace({
          pathname: '/payment/success',
          params: { orderNo },
        });
      }
    } catch (error: any) {
      Alert.alert('提示', error.message || '订单状态查询失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算剩余时间
  const getRemainingTime = () => {
    if (!expiresAt) return '';
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return '已过期';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* 产品信息 */}
        <View style={styles.productCard}>
          <View style={styles.productIcon}>
            <Text style={styles.iconText}>{product.type === 'assessment' ? '📊' : product.type === 'vip' ? '👑' : '📚'}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDesc}>{product.description}</Text>
          </View>
        </View>

        {/* 价格信息 */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>原价</Text>
            <Text style={styles.originalPrice}>¥{product.originalPrice.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>优惠</Text>
              <Text style={styles.discount}>-¥{discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>应付金额</Text>
            <Text style={styles.totalPrice}>¥{product.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* 订单信息 */}
        {orderNo && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>订单信息</Text>
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>订单号</Text>
                <Text style={styles.infoValue}>{orderNo}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>有效期至</Text>
                <Text style={styles.infoValue}>{expiresAt?.toLocaleString()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>剩余时间</Text>
                <Text style={styles.countdown}>{getRemainingTime()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 支付方式 */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>支付方式</Text>
          <TouchableOpacity style={styles.paymentOption} activeOpacity={0.7}>
            <View style={styles.paymentLeft}>
              <Text style={styles.wechatIcon}>💬</Text>
              <Text style={styles.paymentName}>微信支付</Text>
            </View>
            <View style={styles.selected}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 注意事项 */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>注意事项</Text>
          <Text style={styles.noticeText}>• 支付成功后，订单将自动生效</Text>
          <Text style={styles.noticeText}>• 如需退款，请在支付后7天内联系客服</Text>
          <Text style={styles.noticeText}>• 考试报名服务费不含考试报名费</Text>
        </View>
      </ScrollView>

      {/* 底部支付按钮 */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>实付</Text>
          <Text style={styles.footerAmount}>¥{product.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, (loading || paying) && styles.payButtonDisabled]}
          onPress={handleCreateOrder}
          disabled={loading || paying}
          activeOpacity={0.8}
        >
          {loading || paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              {orderNo ? '刷新状态' : '立即支付'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  productIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
    color: '#666',
  },
  priceSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 14,
    color: '#ff6b35',
  },
  totalRow: {
    marginBottom: 0,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff6b35',
  },
  orderSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderInfo: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  countdown: {
    fontSize: 14,
    color: '#ff6b35',
    fontWeight: '600',
  },
  paymentSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wechatIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 16,
    color: '#333',
  },
  selected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#07c160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noticeSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 100,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 13,
    color: '#999',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerPrice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  footerAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff6b35',
  },
  payButton: {
    backgroundColor: '#07c160',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 140,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
