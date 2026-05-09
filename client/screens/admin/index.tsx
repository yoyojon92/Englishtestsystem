import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const API = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// Tab类型
type TabType = 'users' | 'questions' | 'channels' | 'orders' | 'settings';

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  totalOrders: number;
  totalRevenue: number;
  channelStats: { source: string; clicks: number; starts: number; completes: number; pays: number }[];
  recentOrders: { id: string; user: string; type: string; amount: number; status: string; createdAt: string }[];
  dailyStats: { date: string; users: number; tests: number; revenue: number }[];
}

export default function AdminDashboard() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载统计数据
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: 调用真实API
      // const response = await fetch(`${API}/api/v1/admin/stats`);
      // const data = await response.json();
      
      // Mock数据
      setStats({
        totalUsers: 1256,
        totalQuestions: 450,
        totalOrders: 328,
        totalRevenue: 45680,
        channelStats: [
          { source: 'wechat', clicks: 5234, starts: 892, completes: 456, pays: 89 },
          { source: 'mini_program', clicks: 3456, starts: 678, completes: 345, pays: 67 },
          { source: 'xhs', clicks: 2345, starts: 345, completes: 178, pays: 23 },
          { source: 'douyin', clicks: 1567, starts: 234, completes: 123, pays: 12 },
        ],
        recentOrders: [
          { id: 'ORD001', user: '张三', type: '完整报告', amount: 99, status: '已完成', createdAt: '2024-01-15 10:30' },
          { id: 'ORD002', user: '李四', type: '线下体验课', amount: 0, status: '待确认', createdAt: '2024-01-15 09:45' },
          { id: 'ORD003', user: '王五', type: '完整报告', amount: 99, status: '已完成', createdAt: '2024-01-14 18:20' },
          { id: 'ORD004', user: '赵六', type: '在线课程', amount: 299, status: '已完成', createdAt: '2024-01-14 15:00' },
        ],
        dailyStats: [
          { date: '01-15', users: 45, tests: 23, revenue: 198 },
          { date: '01-14', users: 52, tests: 31, revenue: 398 },
          { date: '01-13', users: 38, tests: 18, revenue: 99 },
          { date: '01-12', users: 41, tests: 25, revenue: 198 },
          { date: '01-11', users: 55, tests: 28, revenue: 496 },
        ],
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        <Text className="text-white text-3xl font-bold">{stats?.totalUsers || 0}</Text>
        <Text className="text-blue-100 mt-1">注册用户</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-green-500 rounded-2xl p-4 min-w-[45%]">
        <Text className="text-white text-3xl font-bold">{stats?.totalQuestions || 0}</Text>
        <Text className="text-green-100 mt-1">题库题目</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-purple-500 rounded-2xl p-4 min-w-[45%]">
        <Text className="text-white text-3xl font-bold">{stats?.totalOrders || 0}</Text>
        <Text className="text-purple-100 mt-1">订单总数</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-orange-500 rounded-2xl p-4 min-w-[45%]">
        <Text className="text-white text-3xl font-bold">¥{stats?.totalRevenue || 0}</Text>
        <Text className="text-orange-100 mt-1">总收入</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染增强统计卡片
  const renderEnhancedStats = () => (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text className="text-lg font-bold mb-4">📊 转化分析</Text>
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
          <Text className="text-blue-600 text-xs">渠道转化率</Text>
          <Text className="text-2xl font-bold text-blue-700">12.5%</Text>
          <Text className="text-blue-500 text-xs">点击→注册</Text>
        </View>
        <View className="flex-1 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
          <Text className="text-green-600 text-xs">付费转化率</Text>
          <Text className="text-2xl font-bold text-green-700">8.3%</Text>
          <Text className="text-green-500 text-xs">测试→购买</Text>
        </View>
      </View>
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
          <Text className="text-purple-600 text-xs">日活用户</Text>
          <Text className="text-2xl font-bold text-purple-700">45</Text>
          <Text className="text-purple-500 text-xs">今日活跃</Text>
        </View>
        <View className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3">
          <Text className="text-orange-600 text-xs">续费率</Text>
          <Text className="text-2xl font-bold text-orange-700">78%</Text>
          <Text className="text-orange-500 text-xs">本月续费</Text>
        </View>
      </View>
      
      {/* 渠道排行 */}
      <Text className="text-base font-bold mb-2">渠道效果排行</Text>
      {[
        { name: '微信朋友圈', clicks: 1250, users: 156, rate: '12.5%' },
        { name: '小红书', clicks: 890, users: 98, rate: '11.0%' },
        { name: '抖音', clicks: 650, users: 52, rate: '8.0%' },
        { name: '社群推广', clicks: 420, users: 38, rate: '9.0%' },
      ].map((ch, i) => (
        <View key={i} className="flex-row items-center py-2 border-b border-gray-50">
          <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-amber-600' : 'bg-gray-200'}`}>
            <Text className={`text-xs font-bold ${i < 3 ? 'text-white' : 'text-gray-600'}`}>{i + 1}</Text>
          </View>
          <Text className="flex-1 text-sm">{ch.name}</Text>
          <Text className="text-xs text-gray-500 w-16 text-right">{ch.clicks}点击</Text>
          <Text className="text-xs text-gray-500 w-16 text-right">{ch.users}注册</Text>
          <Text className="text-xs font-medium text-green-600 w-14 text-right">{ch.rate}</Text>
        </View>
      ))}
    </View>
  );
	
  // 渲染Tab内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">用户管理</Text>
            <View className="flex-row gap-2 mb-4">
              <TextInput 
                placeholder="搜索用户..." 
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2"
              />
              <TouchableOpacity className="bg-blue-500 px-4 rounded-xl justify-center">
                <Text className="text-white">搜索</Text>
              </TouchableOpacity>
            </View>
            <View className="border-t border-gray-100 pt-4">
              <View className="flex-row bg-gray-50 rounded-xl p-3 mb-2">
                <Text className="flex-1 font-medium">用户</Text>
                <Text className="flex-1 text-center">类型</Text>
                <Text className="flex-1 text-center">CEFR</Text>
                <Text className="w-20 text-center">操作</Text>
              </View>
              {[
                { name: '张三', type: '家长', cefr: 'A2' },
                { name: '李四', type: '家长', cefr: 'B1' },
                { name: '王五', type: '教师', cefr: '-' },
              ].map((user, i) => (
                <View key={i} className="flex-row p-3 border-b border-gray-50">
                  <Text className="flex-1">{user.name}</Text>
                  <Text className="flex-1 text-center">{user.type}</Text>
                  <Text className="flex-1 text-center">{user.cefr}</Text>
                  <TouchableOpacity className="w-20 items-center">
                    <Text className="text-blue-500">查看</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        );

      case 'questions':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">题库管理</Text>
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity className="flex-1 bg-green-500 rounded-xl py-3">
                <Text className="text-white text-center font-medium">导入题目</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-gray-100 rounded-xl py-3">
                <Text className="text-gray-700 text-center font-medium">导出数据</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-1 bg-blue-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-blue-600">150</Text>
                <Text className="text-blue-800">KET题目</Text>
              </View>
              <View className="flex-1 bg-purple-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-purple-600">120</Text>
                <Text className="text-purple-800">PET题目</Text>
              </View>
              <View className="flex-1 bg-green-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-green-600">180</Text>
                <Text className="text-green-800">其他题目</Text>
              </View>
              <View className="flex-1 bg-orange-50 rounded-xl p-3 min-w-[45%]">
                <Text className="text-2xl font-bold text-orange-600">450</Text>
                <Text className="text-orange-800">总题数</Text>
              </View>
            </View>
          </View>
        );

      case 'channels':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">渠道统计</Text>
            <View className="flex-row bg-gray-50 rounded-xl p-3 mb-3">
              <Text className="flex-1 font-medium">渠道</Text>
              <Text className="flex-1 text-center">点击</Text>
              <Text className="flex-1 text-center">开始</Text>
              <Text className="flex-1 text-center">完成</Text>
              <Text className="flex-1 text-center">付费</Text>
              <Text className="flex-1 text-center">转化率</Text>
            </View>
            {stats?.channelStats.map((channel, i) => {
              const rate = channel.clicks > 0 ? ((channel.pays / channel.clicks) * 100).toFixed(2) : '0.00';
              return (
                <View key={i} className="flex-row p-3 border-b border-gray-50">
                  <Text className="flex-1 font-medium">{channel.source}</Text>
                  <Text className="flex-1 text-center">{channel.clicks}</Text>
                  <Text className="flex-1 text-center">{channel.starts}</Text>
                  <Text className="flex-1 text-center">{channel.completes}</Text>
                  <Text className="flex-1 text-center text-green-600">{channel.pays}</Text>
                  <Text className="flex-1 text-center text-blue-600">{rate}%</Text>
                </View>
              );
            })}
            <TouchableOpacity className="mt-4 bg-blue-500 rounded-xl py-3">
              <Text className="text-white text-center font-medium">生成新分享链接</Text>
            </TouchableOpacity>
          </View>
        );

      case 'orders':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">订单管理</Text>
            <View className="flex-row bg-gray-50 rounded-xl p-3 mb-3">
              <Text className="w-20 font-medium">订单号</Text>
              <Text className="flex-1 text-center">用户</Text>
              <Text className="flex-1 text-center">类型</Text>
              <Text className="w-20 text-center">金额</Text>
              <Text className="flex-1 text-center">状态</Text>
            </View>
            {stats?.recentOrders.map((order, i) => (
              <View key={i} className="flex-row p-3 border-b border-gray-50 items-center">
                <Text className="w-20 text-xs text-gray-500">{order.id}</Text>
                <Text className="flex-1 text-center">{order.user}</Text>
                <Text className="flex-1 text-center">{order.type}</Text>
                <Text className="w-20 text-center">¥{order.amount}</Text>
                <Text className={`flex-1 text-center ${order.status === '已完成' ? 'text-green-600' : 'text-orange-600'}`}>
                  {order.status}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'settings':
        return (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">系统设置</Text>
            
            <View className="mb-4">
              <Text className="font-medium mb-2">考试类型配置</Text>
              <View className="flex-row gap-2">
                {['KET', 'PET', 'FCE'].map(type => (
                  <TouchableOpacity key={type} className="px-4 py-2 bg-blue-100 rounded-full">
                    <Text className="text-blue-600">{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="font-medium mb-2">难度配置</Text>
              <View className="flex-row gap-2">
                {['easy', 'medium', 'hard'].map(level => (
                  <TouchableOpacity key={level} className="px-4 py-2 bg-gray-100 rounded-full">
                    <Text className="text-gray-600">{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="font-medium mb-2">通知模板</Text>
              <TextInput 
                multiline 
                numberOfLines={4}
                placeholder="编辑通知模板..."
                className="border border-gray-200 rounded-xl p-3 h-24"
              />
            </View>

            <TouchableOpacity className="bg-blue-500 rounded-xl py-3">
              <Text className="text-white text-center font-medium">保存设置</Text>
            </TouchableOpacity>
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
              { key: 'users', label: '用户' },
              { key: 'questions', label: '题库' },
              { key: 'channels', label: '渠道' },
              { key: 'orders', label: '订单' },
              { key: 'settings', label: '设置' },
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
