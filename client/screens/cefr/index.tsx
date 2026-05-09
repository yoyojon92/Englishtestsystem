import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getLatestCefrAssessment, getCefrAssessments, type CefrAssessment } from '@/services/cefr';

const cefrColors: Record<string, { bg: string; text: string; border: string }> = {
  'Pre-A1': { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
  'A1': { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' },
  'A2': { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' },
  'B1': { bg: '#F3E5F5', text: '#7B1FA2', border: '#BA68C8' },
  'B2': { bg: '#FFEBEE', text: '#C62828', border: '#E57373' },
};

const cefrDescriptions: Record<string, string> = {
  'Pre-A1': '能够理解并使用最基本的日常用语',
  'A1': '能够理解和使用熟悉的日常表达',
  'A2': '能够进行简单的社交和日常任务',
  'B1': '能够在旅行中处理大多数情况',
  'B2': '能够与英语母语者进行流畅交流',
};

export default function CefrAssessPage() {
  const router = useSafeRouter();
  const [assessment, setAssessment] = useState<CefrAssessment | null>(null);
  const [history, setHistory] = useState<CefrAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const childId = 'child-001'; // 实际应从上下文获取

  const loadData = useCallback(async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        getLatestCefrAssessment(childId),
        getCefrAssessments(childId, 5),
      ]);
      
      if (latestRes.success) {
        setAssessment(latestRes.data);
      }
      if (historyRes.success) {
        setHistory(historyRes.data.assessments);
      }
    } catch (error) {
      console.error('Failed to load CEFR data:', error);
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

  const colors = assessment ? cefrColors[assessment.cefrLevel] || cefrColors['A1'] : cefrColors['A1'];

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 头部 */}
        <View className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-4 pb-8 rounded-b-3xl">
          <Text className="text-white text-lg font-bold">CEFR 英语能力评估</Text>
          <Text className="text-orange-100 text-sm mt-1">科学定级，精准定位学习方向</Text>
        </View>

        {/* 当前等级卡片 */}
        <View className="px-4 -mt-6">
          <View 
            className="bg-white rounded-2xl p-4 shadow-lg"
            style={{ borderLeftWidth: 4, borderLeftColor: colors.border }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-sm">当前等级</Text>
                <Text className="text-3xl font-bold mt-1" style={{ color: colors.text }}>
                  {assessment?.cefrLevel || 'A1'}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {assessment ? cefrDescriptions[assessment.cefrLevel] : ''}
                </Text>
              </View>
              <View className="items-center">
                <View 
                  className="w-20 h-20 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.bg }}
                >
                  <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                    {assessment?.confidencePct || 0}%
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs mt-1">就绪度</Text>
              </View>
            </View>

            {/* 各科技能评分 */}
            <View className="mt-4 grid grid-cols-2 gap-3">
              {assessment?.scores && (
                <>
                  <SkillBar label="阅读" score={assessment.scores.reading} />
                  <SkillBar label="听力" score={assessment.scores.listening} />
                  <SkillBar label="口语" score={assessment.scores.speaking} />
                  <SkillBar label="写作" score={assessment.scores.writing} />
                </>
              )}
            </View>
          </View>
        </View>

        {/* 考试推荐 */}
        {assessment?.examRecommendations && assessment.examRecommendations.length > 0 && (
          <View className="px-4 mt-4">
            <Text className="text-lg font-bold text-gray-800">考试推荐</Text>
            <View className="mt-2 space-y-2">
              {assessment.examRecommendations.map((rec, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-white rounded-xl p-3 flex-row items-center justify-between shadow-sm"
                  onPress={() => router.push('/exams/registration', { examType: rec.examName })}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                      <Text className="text-lg">🎯</Text>
                    </View>
                    <View className="ml-3">
                      <Text className="font-semibold text-gray-800">{rec.examName}</Text>
                      <Text className="text-gray-500 text-sm">{rec.suggestion}</Text>
                    </View>
                  </View>
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-600 text-sm font-semibold">{rec.readiness}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 学习建议 */}
        {assessment?.recommendations && assessment.recommendations.length > 0 && (
          <View className="px-4 mt-4 mb-4">
            <Text className="text-lg font-bold text-gray-800">学习建议</Text>
            <View className="mt-2 space-y-2">
              {assessment.recommendations.map((rec, index) => (
                <View key={index} className="bg-white rounded-xl p-3 shadow-sm flex-row items-start">
                  <Text className="text-orange-500 mr-2">💡</Text>
                  <Text className="text-gray-600 text-sm flex-1">{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 操作按钮 */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            className="bg-orange-500 rounded-xl py-3 items-center shadow-md"
            onPress={() => router.push('/cefr/assessment', { childId })}
          >
            <Text className="text-white font-bold">开始新的评估</Text>
          </TouchableOpacity>
        </View>

        {/* 历史记录 */}
        <View className="px-4 mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-2">评估历史</Text>
          <View className="space-y-2">
            {history.slice(1).map((item, index) => {
              const itemColors = cefrColors[item.cefrLevel] || cefrColors['A1'];
              return (
                <View
                  key={item.assessId}
                  className="bg-white rounded-xl p-3 flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: itemColors.bg }}
                    >
                      <Text className="font-bold" style={{ color: itemColors.text }}>
                        {item.cefrLevel}
                      </Text>
                    </View>
                    <View className="ml-3">
                      <Text className="text-gray-800">{item.cefrLevel}</Text>
                      <Text className="text-gray-400 text-xs">
                        {new Date(item.assessDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-semibold" style={{ color: itemColors.text }}>
                      {item.confidencePct}%
                    </Text>
                    <View className="flex-row items-center">
                      {item.comparedToLast.overall >= 0 ? (
                        <Text className="text-green-500 text-xs">↑{item.comparedToLast.overall}</Text>
                      ) : (
                        <Text className="text-red-500 text-xs">↓{Math.abs(item.comparedToLast.overall)}</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SkillBar({ label, score }: { label: string; score: number }) {
  return (
    <View>
      <View className="flex-row justify-between mb-1">
        <Text className="text-gray-600 text-sm">{label}</Text>
        <Text className="text-gray-800 text-sm font-semibold">{Math.round(score)}</Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-orange-500 rounded-full"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </View>
    </View>
  );
}
