import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getExamPlans, createExamPlan, type ExamPrepPlan, type ExamCatalog } from '@/utils/examApi';
import { useAuth } from '@/contexts/AuthContext';

const examTypeNames: Record<string, string> = {
  'YLE_PRE_A1': 'Pre-A1 Starters',
  'YLE_A1': 'A1 Movers',
  'YLE_A2': 'A2 Flyers',
  'A2_KEY': 'A2 Key (KET)',
  'B1_PRE': 'B1 Preliminary (PET)',
  'B2_FIRST': 'B2 First (FCE)'
};

export default function ExamPlansScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<(ExamPrepPlan & { exam?: ExamCatalog })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlans = async () => {
    if (!user?.currentChild?.childId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getExamPlans(user.currentChild.childId);
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [user?.currentChild?.childId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPlans();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return '#2E7D32';
    if (pct >= 50) return '#FF9800';
    return '#C62828';
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 text-lg">‹</Text>
            </TouchableOpacity>
            <Text className="ml-3 text-lg font-bold text-gray-800">备考计划</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
          }
        >
          <View className="p-4">
            {/* Quick Start */}
            <View className="bg-gradient-to-r from-[#6C63FF] to-[#FF6584] rounded-2xl p-5 mb-4">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">📅</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">制定备考计划</Text>
                  <Text className="text-white/80 text-sm mt-1">
                    AI智能规划，科学的备考路径
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="mt-4 bg-white rounded-xl p-3 items-center"
                onPress={() => router.push('/exams')}
              >
                <Text className="text-[#6C63FF] font-bold">选择考试级别</Text>
              </TouchableOpacity>
            </View>

            {/* Plans List */}
            <Text className="text-base font-bold text-gray-800 mb-3">我的备考计划</Text>
            
            {plans.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-4xl mb-3">📋</Text>
                <Text className="text-gray-500">暂无备考计划</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  选择考试后自动生成备考计划
                </Text>
              </View>
            ) : (
              plans.map((plan) => {
                const daysUntil = getDaysUntil(plan.targetDate);
                const progressColor = getProgressColor(plan.progressPct);
                
                return (
                  <View key={plan.planId} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 items-center justify-center mr-3">
                          <Text className="text-lg">🎯</Text>
                        </View>
                        <View>
                          <Text className="font-bold text-gray-800">
                            {examTypeNames[plan.examType] || plan.examType}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            目标日期：{formatDate(plan.targetDate)}
                          </Text>
                        </View>
                      </View>
                      <View className="px-3 py-1 rounded-full bg-amber-50">
                        <Text className="text-xs font-medium text-amber-600">
                          {daysUntil > 0 ? `${daysUntil}天后` : '已过期'}
                        </Text>
                      </View>
                    </View>

                    {/* Progress */}
                    <View className="mb-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-sm text-gray-500">计划进度</Text>
                        <Text className="text-sm font-medium" style={{ color: progressColor }}>
                          {plan.progressPct}%
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full">
                        <View 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${plan.progressPct}%`,
                            backgroundColor: progressColor
                          }}
                        />
                      </View>
                    </View>

                    {/* Plan Items Preview */}
                    <View className="bg-gray-50 rounded-xl p-3">
                      <Text className="text-sm text-gray-500 mb-2">本周任务</Text>
                      {plan.planItems.slice(0, 2).map((item, idx) => (
                        <View key={idx} className="mb-1">
                          <Text className="text-sm text-gray-700">
                            第{item.week}周：{item.tasks[0] || '按计划进行'}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Actions */}
                    <View className="flex-row mt-3">
                      <TouchableOpacity
                        className="flex-1 p-3 rounded-xl bg-[#6C63FF] mr-2 items-center"
                        onPress={() => router.push('/exams/mock')}
                      >
                        <Text className="text-white font-medium text-sm">开始学习</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 p-3 rounded-xl bg-gray-100 ml-2 items-center"
                      >
                        <Text className="text-gray-600 font-medium text-sm">查看详情</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Tips */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-start">
                <Text className="text-xl mr-2">💡</Text>
                <View className="flex-1">
                  <Text className="font-medium text-blue-800">备考建议</Text>
                  <Text className="text-sm text-blue-700 mt-1">
                    • 建议每周完成1-2套模拟题{'\n'}
                    • 重点突破薄弱题型{'\n'}
                    • 考前一周进入冲刺阶段
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
