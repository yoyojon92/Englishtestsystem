/**
 * L5: 学习规划页面
 * 展示月度学习计划、周任务、教材推荐
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Screen } from '@/components/Screen';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface LearningPlan {
  student_id: string;
  plan_period: string;
  monthly_goals: string[];
  weekly_schedule: {
    [week: string]: {
      system_tasks: { task: string; count: number; due: string }[];
      offline_class: { topic: string; homework: string };
    };
  };
  recommended_materials: {
    material: string;
    reason: string;
    priority: number;
    type: string;
  }[];
  assessment_schedule: { date: string; type: string; scope: string }[];
  parent_report: {
    summary: string;
    homework_suggestions: string[];
    parent_meeting: string;
  };
  ability_info: {
    current_cefr: { overall: string; listening: string; reading: string; writing: string; speaking: string };
    target_cefr: string;
    estimated_months_to_target: number;
    weak_points: { area: string; specific: string; mastery: number; priority: string }[];
  };
}

interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  type: string;
  skill: string;
  due_date: string;
  status: string;
}

export default function LearningPlanScreen() {
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'week' | 'materials'>('overview');

  const loadData = async () => {
    try {
      // 加载月度计划
      const planRes = await fetch(`${API_BASE}/api/v1/learning-plan/S001`);
      const planData = await planRes.json();
      if (planData.success) {
        setPlan(planData.data);
      }

      // 加载本周任务
      const tasksRes = await fetch(`${API_BASE}/api/v1/learning-plan/S001/this-week`);
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        setWeeklyTasks(tasksData.data.tasks);
      }
    } catch (error) {
      console.error('Failed to load learning plan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getSkillIcon = (skill: string) => {
    const icons: Record<string, string> = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🗣️',
      grammar: '📝',
      practice: '🎯',
    };
    return icons[skill] || '📚';
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-gray-500">加载学习计划...</Text>
        </View>
      </Screen>
    );
  }

  if (!plan) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">暂无学习计划</Text>
          <TouchableOpacity className="mt-4 bg-blue-500 px-6 py-2 rounded-full" onPress={loadData}>
            <Text className="text-white">重新加载</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 顶部信息卡 */}
        <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 m-4 rounded-2xl">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-semibold">
              {plan.plan_period} 月学习计划
            </Text>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-sm">
                {plan.ability_info.current_cefr.overall} → {plan.ability_info.target_cefr}
              </Text>
            </View>
          </View>
          <Text className="text-white/80 text-sm">
            预计 {plan.ability_info.estimated_months_to_target} 个月达到目标
          </Text>
        </View>

        {/* Tab 切换 */}
        <View className="flex-row mx-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['overview', 'week', 'materials'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-lg ${activeTab === tab ? 'bg-white dark:bg-gray-700' : ''}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-center font-medium ${
                activeTab === tab ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
              }`}>
                {tab === 'overview' ? '总览' : tab === 'week' ? '本周任务' : '教材推荐'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 总览 Tab */}
        {activeTab === 'overview' && (
          <View className="px-4 pb-4">
            {/* 月度目标 */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📌 本月目标
              </Text>
              {plan.monthly_goals.map((goal, idx) => (
                <View key={idx} className="flex-row items-center mb-2">
                  <View className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
                  <Text className="text-gray-700 dark:text-gray-300 flex-1">{goal}</Text>
                </View>
              ))}
            </View>

            {/* 能力雷达 */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📊 当前能力
              </Text>
              <View className="flex-row justify-around">
                {Object.entries(plan.ability_info.current_cefr).map(([skill, level]) => (
                  <View key={skill} className="items-center">
                    <View className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full items-center justify-center mb-1">
                      <Text className="text-xl">{getSkillIcon(skill)}</Text>
                    </View>
                    <Text className="text-xs text-gray-500 capitalize">{skill}</Text>
                    <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">{level}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 薄弱项 */}
            {plan.ability_info.weak_points.length > 0 && (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🎯 需要加强
                </Text>
                {plan.ability_info.weak_points.map((wp, idx) => (
                  <View key={idx} className="flex-row items-center mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mr-3">
                      <Text className="text-sm">🎯</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 dark:text-white font-medium">
                        {wp.area} - {wp.specific}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${wp.mastery * 100}%` }}
                          />
                        </View>
                        <Text className="ml-2 text-xs text-gray-500">{Math.round(wp.mastery * 100)}%</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 评估安排 */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📅 评估安排
              </Text>
              {plan.assessment_schedule.map((a, idx) => (
                <View key={idx} className="flex-row items-center mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
                    <Text className="text-white text-sm">{a.date.slice(8, 10)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium">{a.scope}</Text>
                    <Text className="text-xs text-gray-500">{a.type === 'mini_test' ? '小测' : '综合评估'}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 家长报告 */}
            <View className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 mb-4">
              <Text className="text-white font-semibold mb-2">📱 家长报告</Text>
              <Text className="text-white/90 text-sm mb-3">{plan.parent_report.summary}</Text>
              <View className="border-t border-white/20 pt-3">
                <Text className="text-white/80 text-xs mb-2">📝 家庭作业建议：</Text>
                {plan.parent_report.homework_suggestions.map((s, idx) => (
                  <Text key={idx} className="text-white/80 text-sm ml-2">• {s}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 本周任务 Tab */}
        {activeTab === 'week' && (
          <View className="px-4 pb-4">
            {/* 周计划总览 */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📆 本周学习任务
              </Text>
              {Object.entries(plan.weekly_schedule).map(([week, data]) => (
                <View key={week} className="mb-4">
                  <Text className="text-gray-500 text-sm mb-2">{week}</Text>
                  {data.system_tasks.map((task, idx) => (
                    <View key={idx} className="flex-row items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
                        <Text className="text-sm">📚</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white">{task.task}</Text>
                        <Text className="text-xs text-gray-500">完成 {task.count} 道 · {task.due}</Text>
                      </View>
                    </View>
                  ))}
                  {data.offline_class && (
                    <View className="flex-row items-center mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center mr-3">
                        <Text className="text-white text-sm">👨‍🏫</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-purple-700 dark:text-purple-300 font-medium">
                          线下课: {data.offline_class.topic}
                        </Text>
                        <Text className="text-xs text-purple-500">作业: {data.offline_class.homework}</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* 任务清单 */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ✅ 待完成任务
              </Text>
              {weeklyTasks.map((task) => (
                <TouchableOpacity 
                  key={task.id}
                  className="flex-row items-center mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <View 
                    className="w-6 h-6 rounded-full border-2 mr-3 items-center justify-center"
                    style={{ borderColor: getTaskStatusColor(task.status) }}
                  >
                    {task.status === 'completed' && (
                      <Text className="text-green-500 text-xs">✓</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium">{task.title}</Text>
                    <Text className="text-xs text-gray-500">{task.description}</Text>
                  </View>
                  <View className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    <Text className="text-xs text-gray-500">{task.due_date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 教材推荐 Tab */}
        {activeTab === 'materials' && (
          <View className="px-4 pb-4">
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📚 推荐学习材料
              </Text>
              {plan.recommended_materials.map((mat, idx) => (
                <View key={idx} className="flex-row items-start mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <View className="w-10 h-10 rounded-xl bg-blue-500 items-center justify-center mr-3">
                    <Text className="text-white font-bold">{mat.priority}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium">{mat.material}</Text>
                    <Text className="text-sm text-gray-500 mt-1">{mat.reason}</Text>
                    <View className="flex-row mt-2">
                      <View className={`px-2 py-0.5 rounded text-xs ${
                        mat.type === 'textbook' ? 'bg-purple-100 text-purple-600' :
                        mat.type === 'exam_paper' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {mat.type === 'textbook' ? '教材' : mat.type === 'exam_paper' ? '真题' : '词汇'}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* 快速链接 */}
            <TouchableOpacity 
              className="bg-blue-500 rounded-2xl p-4 mt-4 items-center"
              onPress={() => {
                // 跳转到 KET 练习
              }}
            >
              <Text className="text-white font-semibold">📝 开始 KET 练习</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
}
