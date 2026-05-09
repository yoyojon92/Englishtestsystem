/**
 * 教学数据看板
 * Teaching Data Dashboard
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Screen from '@/components/Screen';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
const { width } = Dimensions.get('window');

interface DashboardData {
  totalStudents: number;
  avgProgress: number;
  passRate: number;
  monthlyClasses: number;
  weeklyTrend: { day: string; value: number }[];
  classDistribution: { level: string; count: number; percentage: number }[];
  topWeakPoints: { topic: string; count: number }[];
  upcomingExams: { studentName: string; examType: string; date: string }[];
}

export default function TeacherStatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  const fetchStats = useCallback(async () => {
    try {
      const token = 'demo-teacher-token';
      const response = await fetch(
        `${API_BASE_URL}/api/v1/wecom/teacher/stats?range=${timeRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.code === 0) {
        setData(result.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  const statCards = [
    { label: '学员总数', value: data?.totalStudents || 0, icon: 'users', color: '#6C63FF' },
    { label: '平均进步', value: `${data?.avgProgress || 0}%`, icon: 'arrow-up', color: '#10B981' },
    { label: '模拟通过率', value: `${data?.passRate || 0}%`, icon: 'trophy', color: '#F59E0B' },
    { label: '本月课时', value: data?.monthlyClasses || 0, icon: 'chalkboard-teacher', color: '#EF4444' },
  ];

  const maxValue = Math.max(...(data?.weeklyTrend.map(t => t.value) || [1]));

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>教学数据看板</Text>
          <View style={styles.timeRangeSelector}>
            {(['week', 'month', 'quarter'] as const).map(range => (
              <Text
                key={range}
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
                onPress={() => setTimeRange(range)}
              >
                {range === 'week' ? '本周' : range === 'month' ? '本月' : '本季度'}
              </Text>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <FontAwesome6 name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习趋势</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {data?.weeklyTrend.map((item, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(item.value / maxValue) * 100}%`,
                          backgroundColor: index === data.weeklyTrend.length - 1 ? '#6C63FF' : '#D1D5DB',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Class Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>班级分布</Text>
          <View style={styles.distributionCard}>
            {data?.classDistribution.map((item, index) => (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionHeader}>
                  <Text style={styles.distributionLabel}>{item.level}</Text>
                  <Text style={styles.distributionCount}>{item.count}人</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%`, backgroundColor: ['#6C63FF', '#10B981', '#F59E0B', '#EF4444'][index % 4] },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Weak Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>高频薄弱项</Text>
          <View style={styles.weakPointsCard}>
            {data?.topWeakPoints.map((item, index) => (
              <View key={index} style={styles.weakPointItem}>
                <View style={styles.weakPointRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.weakPointText}>{item.topic}</Text>
                <View style={styles.weakPointBadge}>
                  <Text style={styles.weakPointBadgeText}>{item.count}人</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Exams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>近期考试提醒</Text>
          <View style={styles.examsCard}>
            {data?.upcomingExams.map((item, index) => (
              <View key={index} style={styles.examItem}>
                <View style={styles.examIcon}>
                  <FontAwesome6 name="calendar-alt" size={18} color="#EF4444" />
                </View>
                <View style={styles.examInfo}>
                  <Text style={styles.examStudent}>{item.studentName}</Text>
                  <Text style={styles.examDetail}>{item.examType}</Text>
                </View>
                <Text style={styles.examDate}>{item.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Warning Students */}
        <View style={styles.section}>
          <View style={styles.warningHeader}>
            <FontAwesome6 name="exclamation-triangle" size={18} color="#F59E0B" />
            <Text style={styles.warningTitle}>需关注学员</Text>
          </View>
          <View style={styles.warningCard}>
            <View style={styles.warningItem}>
              <View style={styles.warningAvatar}>
                <Text style={styles.warningAvatarText}>张</Text>
              </View>
              <View style={styles.warningInfo}>
                <Text style={styles.warningName}>张小明</Text>
                <Text style={styles.warningReason}>连续两次成绩下降</Text>
              </View>
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>预警</Text>
              </View>
            </View>
            <View style={styles.warningItem}>
              <View style={styles.warningAvatar}>
                <Text style={styles.warningAvatarText}>李</Text>
              </View>
              <View style={styles.warningInfo}>
                <Text style={styles.warningName}>李小红</Text>
                <Text style={styles.warningReason}>模拟考未达标</Text>
              </View>
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>关注</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
  },
  timeRangeText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    color: '#6B7280',
    borderRadius: 6,
  },
  timeRangeTextActive: {
    backgroundColor: '#6C63FF',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: '2%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    width: '60%',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  distributionItem: {
    marginBottom: 12,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  distributionLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  distributionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  weakPointsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weakPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weakPointRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  weakPointText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  weakPointBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  weakPointBadgeText: {
    fontSize: 12,
    color: '#EF4444',
  },
  examsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  examIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  examInfo: {
    flex: 1,
  },
  examStudent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  examDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  examDate: {
    fontSize: 12,
    color: '#EF4444',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  warningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  warningAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  warningAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  warningInfo: {
    flex: 1,
  },
  warningName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  warningReason: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  warningBadgeText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});
