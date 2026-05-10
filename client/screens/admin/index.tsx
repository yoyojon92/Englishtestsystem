import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getAdminStats, type AdminStats } from '@/services/admin';

const API = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// Tab类型
type TabType = 'overview' | 'channels' | 'questions';

export default function AdminDashboard() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 加载统计数据
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 刷新数据
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  // 页面返回时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // 渲染概览卡片
  const renderOverviewCards = () => (
    <View className="flex-row flex-wrap gap-3 mb-4">
      <TouchableOpacity className="flex-1 bg-blue-500 rounded-2xl p-4 min-w-[45%]">
        <Text className="text-white text-3xl font-bold">{stats?.totalTests || 0}</Text>
        <Text className="text-blue-100 mt-1">测试总数</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-green-500 rounded-2xl p-4 min-w-[45%]">
        <Text className="text-white text-3xl font-bold">{stats?.totalSubmissions || 0}</Text>
        <Text className="text-green-100 mt-1">提交报告</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-purple-500 rounded-2xl p-4 min-w-[45%]">
        <Text className="text-white text-3xl font-bold">{stats?.questionCount || 0}</Text>
        <Text className="text-purple-100 mt-1">题库题目</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-orange-500 rounded-2xl p-4 min-w-[45%]">
        <Text className="text-white text-3xl font-bold">{stats?.avgCompletionRate || 0}%</Text>
        <Text className="text-orange-100 mt-1">完成率</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染增强统计卡片
  const renderEnhancedStats = () => (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text className="text-lg font-bold mb-4">CEFR 等级分布</Text>
      <View className="flex-row gap-2 mb-4">
        {Object.entries(stats?.cefrDistribution || {}).map(([level, count]) => (
          <View key={level} className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2 items-center">
            <Text className="text-xl font-bold text-blue-700">{count}</Text>
            <Text className="text-xs text-blue-600">{level}</Text>
          </View>
        ))}
      </View>
      
      {/* 渠道排行 */}
      <Text className="text-base font-bold mb-2">渠道效果排行</Text>
      {(stats?.channelStats || []).slice(0, 5).map((ch, i) => (
        <View key={i} className="flex-row items-center py-2 border-b border-gray-50">
          <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-amber-600' : 'bg-gray-200'}`}>
            <Text className={`text-xs font-bold ${i < 3 ? 'text-white' : 'text-gray-600'}`}>{i + 1}</Text>
          </View>
          <Text className="flex-1 text-sm">{ch.source}</Text>
          <Text className="text-xs text-gray-500 w-16 text-right">{ch.clicks}点击</Text>
          <Text className="text-xs text-gray-500 w-16 text-right">{ch.starts}开始</Text>
          <Text className="text-xs font-medium text-green-600 w-14 text-right">{ch.conversion}%</Text>
        </View>
      ))}
    </View>
  );
	
  // 渲染Tab内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">📈 每日趋势</Text>
            <View className="flex-row gap-1">
              {(stats?.dailyStats || []).map((day, i) => (
                <View key={i} className="flex-1 items-center">
                  <View className="w-8 bg-blue-500 rounded-t-lg" style={{ height: Math.max(20, day.submissions * 5) }} />
                  <Text className="text-xs text-gray-500 mt-1">{day.date.slice(5)}</Text>
                  <Text className="text-xs text-blue-600">{day.submissions}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'questions':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">📚 题库概览</Text>
            <View className="flex-row flex-wrap gap-3 mb-4">
              <View className="flex-1 bg-blue-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-blue-600">{stats?.questionCount || 0}</Text>
                <Text className="text-blue-800">总题数</Text>
              </View>
              <View className="flex-1 bg-green-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-green-600">47</Text>
                <Text className="text-green-800">KET题目</Text>
              </View>
              <View className="flex-1 bg-purple-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-purple-600">18</Text>
                <Text className="text-purple-800">PET题目</Text>
              </View>
              <View className="flex-1 bg-orange-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-orange-600">4</Text>
                <Text className="text-orange-800">考试类型</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-500">题库包含 KET/PET 阅读、听力、写作真题</Text>
          </View>
        );

      case 'channels':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">📢 渠道统计</Text>
            <View className="flex-row bg-gray-50 rounded-xl p-3 mb-3">
              <Text className="flex-1 font-medium">渠道</Text>
              <Text className="flex-1 text-center">点击</Text>
              <Text className="flex-1 text-center">开始</Text>
              <Text className="flex-1 text-center">完成</Text>
            </View>
            {(stats?.channelStats || []).map((channel, i) => (
              <View key={i} className="flex-row p-3 border-b border-gray-50">
                <Text className="flex-1 font-medium">{channel.source}</Text>
                <Text className="flex-1 text-center">{channel.clicks}</Text>
                <Text className="flex-1 text-center">{channel.starts}</Text>
                <Text className="flex-1 text-center text-green-600">{channel.completes}</Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-blue-600 pt-12 pb-6 px-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">管理后台</Text>
            <TouchableOpacity>
              <Text className="text-white">退出</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-4">
          {/* Overview Cards */}
          {renderOverviewCards()}

          {/* Enhanced Stats - 渠道转化、付费转化、活跃度 */}
          {renderEnhancedStats()}

          {/* Tab Navigation */}
          <View className="flex-row bg-white rounded-2xl p-1 mb-4">
            {[
              { key: 'overview', label: '概览' },
              { key: 'questions', label: '题库' },
              { key: 'channels', label: '渠道' },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as TabType)}
                className={`flex-1 py-2 rounded-xl ${activeTab === tab.key ? 'bg-blue-500' : ''}`}
              >
                <Text className={`text-center ${activeTab === tab.key ? 'text-white' : 'text-gray-500'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </View>
      </ScrollView>
    </Screen>
  );
}
