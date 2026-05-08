/**
 * 考试冲刺包订单页面
 * 展示用户购买的冲刺包及使用情况
 */
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { examApi } from '@/utils/examApi';

interface CrashCourseOrder {
  orderId: string;
  examType: string;
  examName: string;
  packageType: string;
  amount: number;
  paidAt: string;
  mockExamQuota: number;
  remainingQuota: number;
  validUntil: string;
  status: string;
}

export default function ExamOrdersScreen() {
  const router = useSafeRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CrashCourseOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('all');

  // 加载订单数据
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await examApi.getCrashCourseOrders();
      setOrders(data);
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 筛选订单
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return order.remainingQuota > 0 && new Date(order.validUntil) > new Date();
    }
    if (activeTab === 'expired') {
      return order.remainingQuota === 0 || new Date(order.validUntil) <= new Date();
    }
    return true;
  });

  // 渲染订单卡片
  const renderOrderCard = (order: CrashCourseOrder) => {
    const isExpired = order.remainingQuota === 0 || new Date(order.validUntil) <= new Date();
    
    return (
      <TouchableOpacity 
        key={order.orderId} 
        style={styles.orderCard}
        onPress={() => router.push('/exams/mock', { packageType: order.packageType })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.examBadge}>
            <Text style={styles.examBadgeText}>{order.examType}</Text>
          </View>
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>已过期</Text>
            </View>
          )}
        </View>

        <Text style={styles.orderTitle}>{order.examName} 冲刺包</Text>
        <Text style={styles.packageType}>
          {order.packageType === 'ket' ? 'KET冲刺包' : 
           order.packageType === 'pet' ? 'PET冲刺包' : '通用冲刺包'}
        </Text>

        <View style={styles.orderStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{order.remainingQuota}</Text>
            <Text style={styles.statLabel}>剩余次数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{order.mockExamQuota}</Text>
            <Text style={styles.statLabel}>总次数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{order.mockExamQuota - order.remainingQuota}</Text>
            <Text style={styles.statLabel}>已使用</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.validUntil}>
            有效期至: {new Date(order.validUntil).toLocaleDateString()}
          </Text>
          {!isExpired && (
            <TouchableOpacity 
              style={styles.useButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/exams/mock');
              }}
            >
              <Text style={styles.useButtonText}>立即使用</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染使用进度
  const renderUsageProgress = () => {
    const totalQuota = orders.reduce((sum, o) => sum + o.mockExamQuota, 0);
    const usedQuota = orders.reduce((sum, o) => sum + (o.mockExamQuota - o.remainingQuota), 0);
    const progress = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;

    return (
      <View style={styles.usageCard}>
        <Text style={styles.usageTitle}>冲刺包使用情况</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
        </View>
        <View style={styles.usageStats}>
          <Text style={styles.usageStat}>已使用 {usedQuota} 次</Text>
          <Text style={styles.usageStat}>剩余 {totalQuota - usedQuota} 次</Text>
        </View>
      </View>
    );
  };

  // 渲染空状态
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>暂无冲刺包</Text>
      <Text style={styles.emptyDesc}>购买冲刺包可享受多次全真模拟考试</Text>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => router.push('/exams')}
      >
        <Text style={styles.buyButtonText}>购买冲刺包</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen title="我的订单" showBack onBack={() => router.back()}>
      <View style={styles.container}>
        {/* Tab切换 */}
        <View style={styles.tabContainer}>
          {(['all', 'active', 'expired'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'all' ? '全部' : tab === 'active' ? '可用' : '已用完'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onRefresh={loadOrders}
          >
            {/* 使用情况概览 */}
            {orders.length > 0 && renderUsageProgress()}

            {/* 订单列表 */}
            {filteredOrders.length > 0 ? (
              <View style={styles.orderList}>
                {filteredOrders.map(renderOrderCard)}
              </View>
            ) : (
              renderEmpty()
            )}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  } as ViewStyle,
  tabContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center' as const,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF0E8',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: '600' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  scrollView: {
    flex: 1,
  },
  usageCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  usageTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#333333',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FF6B35',
    width: 40,
    textAlign: 'right' as const,
  },
  usageStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  usageStat: {
    fontSize: 12,
    color: '#999999',
  },
  orderList: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  examBadge: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examBadgeText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600' as const,
  },
  expiredBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadgeText: {
    fontSize: 12,
    color: '#999999',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333333',
    marginBottom: 4,
  },
  packageType: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 12,
  },
  orderStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FF6B35',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#999999',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F0F0F0',
  },
  orderFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  validUntil: {
    fontSize: 12,
    color: '#999999',
  },
  useButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  useButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  emptyContainer: {
    alignItems: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333333',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  buyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buyButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
};
