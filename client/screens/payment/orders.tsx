import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { getPaymentOrders, PaymentOrder, applyRefund, cancelPaymentOrder } from '@/services/payment';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: '#ff9500' },
  paid: { label: '已支付', color: '#07c160' },
  refunded: { label: '已退款', color: '#8e8e93' },
  cancelled: { label: '已取消', color: '#8e8e93' },
  expired: { label: '已过期', color: '#8e8e93' },
};

const ORDER_TYPE_MAP: Record<string, string> = {
  assessment: '英语能力测评',
  course: '课程报名',
  exam_registration: '考试代报名',
  crash_course: '冲刺包',
  vip: 'VIP会员',
};

export default function PaymentOrdersPage() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    const currentToken = tokenRef.current;
    if (!currentToken) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getPaymentOrders(currentToken, {
        page: pageNum,
        pageSize: 10,
      });

      if (response.success) {
        if (refresh || pageNum === 1) {
          setOrders(response.data.list);
        } else {
          setOrders(prev => [...prev, ...response.data.list]);
        }
        setHasMore(response.data.list.length === 10);
        setPage(pageNum);
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '获取订单失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1, true);
  }, [fetchOrders]);

  const handleRefresh = () => {
    fetchOrders(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchOrders(page + 1);
    }
  };

  const handleCancel = async (order: PaymentOrder) => {
    Alert.alert(
      '取消订单',
      '确定要取消此订单吗？',
      [
        { text: '否', style: 'cancel' },
        {
          text: '是',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelPaymentOrder(order.order_id, tokenRef.current);
              fetchOrders(1, true);
              Alert.alert('成功', '订单已取消');
            } catch (error: any) {
              Alert.alert('错误', error.message || '取消失败');
            }
          },
        },
      ]
    );
  };

  const handleRefund = (order: PaymentOrder) => {
    Alert.prompt(
      '申请退款',
      '请输入退款原因（选填）',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '提交',
          onPress: async (reason) => {
            try {
              await applyRefund(order.order_id, reason, tokenRef.current);
              fetchOrders(1, true);
              Alert.alert('成功', '退款申请已提交');
            } catch (error: any) {
              Alert.alert('错误', error.message || '申请失败');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderOrderItem = ({ item }: { item: PaymentOrder }) => {
    const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.pending;
    const typeName = ORDER_TYPE_MAP[item.order_type] || item.order_type;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderType}>{typeName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderNo}>订单号：{item.order_no}</Text>
          <Text style={styles.orderTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderAmount}>¥{parseFloat(item.actual_amount).toFixed(2)}</Text>

          <View style={styles.orderActions}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(item)}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => router.push({ pathname: '/payment', params: { orderNo: item.order_no } })}
                >
                  <Text style={styles.payButtonText}>去支付</Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === 'paid' && (
              <TouchableOpacity
                style={styles.refundButton}
                onPress={() => handleRefund(item)}
              >
                <Text style={styles.refundButtonText}>申请退款</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>暂无订单</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.shopButtonText}>去逛逛</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.order_id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          loading && orders.length > 0 ? (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderNo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  orderTime: {
    fontSize: 13,
    color: '#999',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff6b35',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#07c160',
  },
  payButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  refundButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  refundButtonText: {
    fontSize: 14,
    color: '#ff9500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#07c160',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
});
