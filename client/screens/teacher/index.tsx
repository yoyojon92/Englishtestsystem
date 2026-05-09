/**
 * 教师工作台 - 企业微信集成
 * Teacher Workbench - WeCom Integration
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Screen from '@/components/Screen';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface DashboardData {
  todayClasses: number;
  totalStudents: number;
  pendingReports: number;
  unreadMessages: number;
  upcomingExams: number;
  weekStats: {
    date: string;
    classCount: number;
    avgScore: number;
  }[];
}

export default function TeacherDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const token = 'demo-teacher-token'; // 实际应从auth获取
      const response = await fetch(`${API_BASE_URL}/api/v1/wecom/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.code === 0) {
        setData(result.data);
      }
    } catch (error) {
      console.error('获取教师工作台数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const quickActions = [
    { icon: 'users', label: '我的学生', color: '#4F46E5', route: '/teacher/students' },
    { icon: 'file-alt', label: '课后报告', color: '#10B981', route: '/teacher/reports' },
    { icon: 'calendar', label: '课程表', color: '#F59E0B', route: '/teacher/schedule' },
    { icon: 'chart-bar', label: '数据看板', color: '#EF4444', route: '/teacher/stats' },
  ];

  const renderQuickAction = (action: typeof quickActions[0], index: number) => (
    <TouchableOpacity key={index} style={styles.quickActionCard} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
        <FontAwesome6 name={action.icon as any} size={24} color={action.color} />
      </View>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>您好，老师</Text>
            <Text style={styles.subtitle}>今天有以下任务待处理</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <FontAwesome6 name="user-circle" size={40} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <FontAwesome6 name="chalkboard-teacher" size={28} color="#4F46E5" />
            <Text style={styles.statValue}>{data?.todayClasses || 0}</Text>
            <Text style={styles.statLabel}>今日课程</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome6 name="users" size={28} color="#10B981" />
            <Text style={styles.statValue}>{data?.totalStudents || 0}</Text>
            <Text style={styles.statLabel}>我的学生</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome6 name="file-medical" size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{data?.pendingReports || 0}</Text>
            <Text style={styles.statLabel}>待写报告</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome6 name="bell" size={28} color="#EF4444" />
            <Text style={styles.statValue}>{data?.unreadMessages || 0}</Text>
            <Text style={styles.statLabel}>未读消息</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快捷功能</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日课程</Text>
          <View style={styles.classCard}>
            <View style={styles.classTime}>
              <Text style={styles.classTimeText}>09:00</Text>
              <Text style={styles.classDuration}>60分钟</Text>
            </View>
            <View style={styles.classInfo}>
              <Text style={styles.className}>KET 冲刺班 A组</Text>
              <Text style={styles.classDetail}>剑桥少儿英语 · 8人</Text>
              <View style={styles.classTags}>
                <View style={[styles.tag, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={[styles.tagText, { color: '#4F46E5' }]}>模拟考</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.classAction}>
              <FontAwesome6 name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <View style={styles.classCard}>
            <View style={styles.classTime}>
              <Text style={styles.classTimeText}>14:00</Text>
              <Text style={styles.classDuration}>60分钟</Text>
            </View>
            <View style={styles.classInfo}>
              <Text style={styles.className}>PET 强化班 B组</Text>
              <Text style={styles.classDetail}>剑桥英语中级 · 6人</Text>
              <View style={styles.classTags}>
                <View style={[styles.tag, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.tagText, { color: '#D97706' }]}>口语练习</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.classAction}>
              <FontAwesome6 name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Exams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>近期考试</Text>
          <View style={styles.examAlert}>
            <View style={styles.examIcon}>
              <FontAwesome6 name="exclamation-circle" size={24} color="#EF4444" />
            </View>
            <View style={styles.examContent}>
              <Text style={styles.examTitle}>KET 模拟考试</Text>
              <Text style={styles.examSubtitle}>3名学员即将参加 · 3天后</Text>
            </View>
            <TouchableOpacity style={styles.examAction}>
              <FontAwesome6 name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>家长咨询</Text>
          <View style={styles.messageCard}>
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>李</Text>
            </View>
            <View style={styles.messageContent}>
              <Text style={styles.messageName}>李妈妈</Text>
              <Text style={styles.messageText}>老师，请问孩子最近口语进步如何？</Text>
            </View>
            <Text style={styles.messageTime}>刚刚</Text>
          </View>
          <View style={styles.messageCard}>
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>王</Text>
            </View>
            <View style={styles.messageContent}>
              <Text style={styles.messageName}>王爸爸</Text>
              <Text style={styles.messageText}>谢谢老师的课后反馈，孩子很有收获！</Text>
            </View>
            <Text style={styles.messageTime}>1小时前</Text>
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
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  avatarButton: {
    padding: 4,
  },
  statsContainer: {
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
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionCard: {
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
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  classTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  classTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  classDuration: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  classDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  classTags: {
    flexDirection: 'row',
    marginTop: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  classAction: {
    padding: 8,
  },
  examAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
  },
  examIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  examContent: {
    flex: 1,
  },
  examTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  examSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  examAction: {
    padding: 8,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
  },
  messageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  messageText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 40,
  },
});
