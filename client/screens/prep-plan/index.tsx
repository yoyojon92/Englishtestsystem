import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getPrepPlan, getTodayTasks, getPrepProgress, type PrepPlan, type TodayTasks, type PrepProgress } from '@/services/prepPlan';

export default function PrepPlanPage() {
  const router = useSafeRouter();
  const [plan, setPlan] = useState<PrepPlan | null>(null);
  const [todayTasks, setTodayTasks] = useState<TodayTasks | null>(null);
  const [progress, setProgress] = useState<PrepProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'plan'>('today');

  const childId = 'child-001'; // 实际应从上下文获取

  const loadData = useCallback(async () => {
    try {
      const [planRes, todayRes, progressRes] = await Promise.all([
        getPrepPlan(childId, 'KET'),
        getTodayTasks(childId),
        getPrepProgress(childId),
      ]);
      
      if (planRes.success) setPlan(planRes.data);
      if (todayRes.success) setTodayTasks(todayRes.data);
      if (progressRes.success) setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to load prep plan:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [childId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className="mt-4 text-gray-500">加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 头部 */}
        <View className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pt-4 pb-6 rounded-b-3xl">
          <Text className="text-white text-lg font-bold">
            {plan?.examType || 'KET'} 备考计划
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-blue-100 text-sm">
              目标日期：{plan?.targetDate ? new Date(plan.targetDate).toLocaleDateString() : '-'}
            </Text>
          </View>
          
          {/* 进度概览 */}
          <View className="mt-4 bg-white/20 rounded-xl p-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white/80 text-sm">总进度</Text>
                <Text className="text-white text-2xl font-bold">{plan?.progressPct || 0}%</Text>
              </View>
              <View className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                <View
                  className="h-full bg-white rounded-full"
                  style={{ width: `${plan?.progressPct || 0}%` }}
                />
              </View>
            </View>
            <View className="flex-row mt-3 justify-between">
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{progress?.overview.passedDays || 0}</Text>
                <Text className="text-white/70 text-xs">已过天数</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{progress?.overview.remainingDays || 0}</Text>
                <Text className="text-white/70 text-xs">剩余天数</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{progress?.overview.currentPhase || '-'}</Text>
                <Text className="text-white/70 text-xs">当前阶段</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tab切换 */}
        <View className="px-4 -mt-2">
          <View className="bg-white rounded-xl flex-row shadow-sm overflow-hidden">
            <TouchableOpacity
              className={`flex-1 py-2.5 items-center ${activeTab === 'today' ? 'bg-orange-500' : ''}`}
              onPress={() => setActiveTab('today')}
            >
              <Text className={`font-semibold ${activeTab === 'today' ? 'text-white' : 'text-gray-600'}`}>
                今日任务
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 items-center ${activeTab === 'plan' ? 'bg-orange-500' : ''}`}
              onPress={() => setActiveTab('plan')}
            >
              <Text className={`font-semibold ${activeTab === 'plan' ? 'text-white' : 'text-gray-600'}`}>
                备考计划
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 今日任务 */}
        {activeTab === 'today' && todayTasks && (
          <View className="px-4 mt-4">
            {/* 今日统计 */}
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row justify-between items-center">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-800">{todayTasks.stats.completedTasks}</Text>
                  <Text className="text-gray-500 text-sm">已完成</Text>
                </View>
                <View className="w-px h-10 bg-gray-200" />
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-800">{todayTasks.stats.totalTasks}</Text>
                  <Text className="text-gray-500 text-sm">总任务</Text>
                </View>
                <View className="w-px h-10 bg-gray-200" />
                <View className="items-center">
                  <Text className="text-2xl font-bold text-orange-500">{todayTasks.stats.progressPct}%</Text>
                  <Text className="text-gray-500 text-sm">进度</Text>
                </View>
              </View>
              <View className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                  style={{ width: `${todayTasks.stats.progressPct}%` }}
                />
              </View>
            </View>

            {/* 任务列表 */}
            <View className="mt-4 space-y-2">
              {todayTasks.tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex-row items-center"
                  onPress={() => {/* 完成任务 */}}
                >
                  <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {task.status === 'completed' && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {task.title}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">{task.description}</Text>
                  </View>
                  <View className="items-end">
                    <View className={`px-2 py-0.5 rounded-full ${
                      task.type === 'vocabulary' ? 'bg-blue-100' :
                      task.type === 'listening' ? 'bg-purple-100' :
                      task.type === 'reading' ? 'bg-green-100' :
                      task.type === 'speaking' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        task.type === 'vocabulary' ? 'text-blue-600' :
                        task.type === 'listening' ? 'text-purple-600' :
                        task.type === 'reading' ? 'text-green-600' :
                        task.type === 'speaking' ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {task.type === 'vocabulary' ? '词汇' :
                         task.type === 'listening' ? '听力' :
                         task.type === 'reading' ? '阅读' :
                         task.type === 'speaking' ? '口语' :
                         task.type}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs mt-1">
                      {task.completedHours}/{task.targetHours}h
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 备考计划 */}
        {activeTab === 'plan' && plan && (
          <View className="px-4 mt-4">
            {/* 里程碑 */}
            <Text className="text-lg font-bold text-gray-800 mb-2">学习里程碑</Text>
            <View className="space-y-3">
              {plan.milestones.map((milestone, index) => (
                <View key={milestone.id} className="flex-row items-start">
                  <View className="items-center">
                    <View className={`w-6 h-6 rounded-full items-center justify-center ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      {milestone.completed ? (
                        <Text className="text-white text-xs">✓</Text>
                      ) : (
                        <Text className="text-gray-400 text-xs">{index + 1}</Text>
                      )}
                    </View>
                    {index < plan.milestones.length - 1 && (
                      <View className={`w-0.5 h-8 ${milestone.completed ? 'bg-green-300' : 'bg-gray-200'}`} />
                    )}
                  </View>
                  <View className="ml-3 pb-4">
                    <Text className={`font-semibold ${milestone.completed ? 'text-green-600' : 'text-gray-800'}`}>
                      {milestone.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">{milestone.description}</Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      目标：{new Date(milestone.targetDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 薄弱项 */}
            {progress?.weakPoints && progress.weakPoints.length > 0 && (
              <>
                <Text className="text-lg font-bold text-gray-800 mt-6 mb-2">需要加强</Text>
                <View className="space-y-2">
                  {progress.weakPoints.map((point, index) => (
                    <View key={index} className="bg-red-50 rounded-xl p-3 flex-row items-center">
                      <Text className="text-red-400 mr-2">⚠️</Text>
                      <View>
                        <Text className="text-red-600 font-semibold">{point.skill}</Text>
                        <Text className="text-red-400 text-sm">{point.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* 建议 */}
            {progress?.suggestions && progress.suggestions.length > 0 && (
              <>
                <Text className="text-lg font-bold text-gray-800 mt-6 mb-2">学习建议</Text>
                <View className="space-y-2">
                  {progress.suggestions.map((suggestion, index) => (
                    <View key={index} className="bg-white rounded-xl p-3 shadow-sm flex-row items-start">
                      <Text className="text-orange-400 mr-2">💡</Text>
                      <Text className="text-gray-600 text-sm flex-1">{suggestion}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex-row">
        <TouchableOpacity
          className="flex-1 bg-orange-500 rounded-xl py-3 items-center mr-2"
          onPress={() => router.push('/mock-exam', { examType: plan?.examType })}
        >
          <Text className="text-white font-bold">开始模拟考</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-blue-500 rounded-xl py-3 items-center ml-2"
          onPress={() => router.push('/cefr', { childId })}
        >
          <Text className="text-white font-bold">能力评估</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
