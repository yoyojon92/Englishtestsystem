import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { TouchableOpacity } from 'react-native';

export default function PaymentSuccessPage() {
  const router = useSafeRouter();
  const { orderNo } = useSafeSearchParams<{ orderNo?: string }>();

  return (
    <Screen>
      <View style={styles.container}>
        {/* 成功图标 */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* 成功提示 */}
        <Text style={styles.title}>支付成功</Text>
        <Text style={styles.subtitle}>感谢您的购买</Text>

        {/* 订单信息 */}
        {orderNo && (
          <View style={styles.orderCard}>
            <Text style={styles.orderLabel}>订单号</Text>
            <Text style={styles.orderNo}>{orderNo}</Text>
          </View>
        )}

        {/* 温馨提示 */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>温馨提示</Text>
          <Text style={styles.noticeText}>
            {getNoticeText()}
          </Text>
        </View>

        {/* 操作按钮 */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>返回首页</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/payment/orders')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>查看订单</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

function getNoticeText(): string {
  // 根据订单类型返回不同的提示
  return '您可以开始使用我们的服务了。如有任何问题，请联系客服。';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 60,
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#07c160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  orderNo: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
  },
  noticeCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#07c160',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
