import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getExamList, type ExamCatalog } from '@/utils/examApi';

const examLevelColors: Record<string, { bg: string; text: string }> = {
  'Pre-A1': { bg: '#E8F5E9', text: '#2E7D32' },
  'A1': { bg: '#E3F2FD', text: '#1565C0' },
  'A2': { bg: '#FFF3E0', text: '#E65100' },
  'B1': { bg: '#F3E5F5', text: '#7B1FA2' },
  'B2': { bg: '#FFEBEE', text: '#C62828' },
};

const examLevelIcons: Record<string, string> = {
  'YLE_PRE_A1': '🌟',
  'YLE_A1': '⭐',
  'YLE_A2': '🌙',
  'A2_KEY': '📚',
  'B1_PRE': '🎓',
  'B2_FIRST': '🏆',
};

export default function ExamListScreen() {
  const router = useSafeRouter();
  const [exams, setExams] = useState<ExamCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExams = async () => {
    try {
      const data = await getExamList();
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadExams();
  };

  const handleExamPress = (exam: ExamCatalog) => {
    router.push('/exams/detail', { examId: exam.examId, examName: exam.examName });
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text className="mt-4 text-gray-500">加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-gradient-to-r from-[#6C63FF] to-[#FF6584]">
          <Text className="text-2xl font-bold text-white">剑桥英语考试</Text>
          <Text className="mt-1 text-white/80 text-sm">YLE Starters / Movers / Flyers / KET / PET / FCE</Text>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
          }
        >
          {/* Info Banner */}
          <View className="mx-4 mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">💡</Text>
              <View className="flex-1">
                <Text className="font-semibold text-amber-800">考试价值</Text>
                <Text className="mt-1 text-xs text-amber-700">
                  剑桥英语证书终身有效，全球认可，为留学/升学/就业增添竞争力
                </Text>
              </View>
            </View>
          </View>

          {/* Exam Cards */}
          <View className="px-4 pb-6 mt-2">
            <Text className="text-lg font-bold text-gray-800 mb-4">选择考试级别</Text>
            
            {exams.map((exam) => {
              const colors = examLevelColors[exam.cefrLevel] || { bg: '#F5F5F5', text: '#666' };
              const icon = examLevelIcons[exam.examType] || '📝';
              
              return (
                <TouchableOpacity
                  key={exam.examId}
                  className="bg-white rounded-3xl p-5 mb-4"
                  style={styles.cardShadow}
                  onPress={() => handleExamPress(exam)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    {/* Icon */}
                    <View 
                      className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <Text className="text-3xl">{icon}</Text>
                    </View>
                    
                    {/* Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-bold text-gray-800 text-base">{exam.examName}</Text>
                        <View 
                          className="ml-2 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: colors.bg }}
                        >
                          <Text 
                            className="text-xs font-medium"
                            style={{ color: colors.text }}
                          >
                            {exam.cefrLevel}
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="mt-1 text-sm text-gray-500">{exam.targetAge}</Text>
                      <Text className="mt-1 text-xs text-gray-400">
                        词汇量要求：{exam.recommendedVocab}+
                      </Text>
                    </View>
                    
                    {/* Arrow */}
                    <Text className="text-gray-300 text-lg">›</Text>
                  </View>

                  {/* Description Preview */}
                  <Text 
                    className="mt-3 text-sm text-gray-500"
                    numberOfLines={2}
                  >
                    {exam.description}
                  </Text>

                  {/* Exam Structure Preview */}
                  <View className="mt-3 flex-row items-center">
                    <View className="flex-row flex-wrap flex-1">
                      {exam.examStructure.components.map((comp: any, idx: number) => (
                        <View 
                          key={idx}
                          className="mr-2 mb-1 px-2 py-1 rounded-full bg-gray-100"
                        >
                          <Text className="text-xs text-gray-600">
                            {comp.name} ({comp.duration}min)
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* CTA */}
            <TouchableOpacity 
              className="mt-2 p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF]"
              onPress={() => router.push('/exams/mock')}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-lg mr-2">📝</Text>
                <Text className="text-white font-bold">免费模拟测试</Text>
              </View>
              <Text className="mt-1 text-center text-white/80 text-xs">
                5分钟快速诊断，了解孩子当前水平
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
