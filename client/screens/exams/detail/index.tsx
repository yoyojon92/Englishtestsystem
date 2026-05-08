import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { getExamDetail, type ExamCatalog } from '@/utils/examApi';

const examLevelColors: Record<string, { bg: string; text: string }> = {
  'Pre-A1': { bg: '#E8F5E9', text: '#2E7D32' },
  'A1': { bg: '#E3F2FD', text: '#1565C0' },
  'A2': { bg: '#FFF3E0', text: '#E65100' },
  'B1': { bg: '#F3E5F5', text: '#7B1FA2' },
  'B2': { bg: '#FFEBEE', text: '#C62828' },
};

export default function ExamDetailScreen() {
  const router = useSafeRouter();
  const { examId, examName } = useSafeSearchParams<{ examId: string; examName: string }>();
  const [exam, setExam] = useState<ExamCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExamDetail = async () => {
      try {
        const data = await getExamDetail(examId);
        setExam(data);
      } catch (error) {
        console.error('Failed to load exam detail:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (examId) {
      loadExamDetail();
    }
  }, [examId]);

  if (loading || !exam) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  const colors = examLevelColors[exam.cefrLevel] || { bg: '#F5F5F5', text: '#666' };

  return (
    <Screen>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 pt-4 pb-8 bg-gradient-to-r from-[#6C63FF] to-[#FF6584]">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-white text-lg">‹</Text>
            </TouchableOpacity>
            <Text className="ml-2 text-white/80 text-sm">考试详情</Text>
          </View>
          
          <Text className="text-2xl font-bold text-white">{exam.examName}</Text>
          <View className="flex-row items-center mt-2">
            <View className="px-3 py-1 rounded-full mr-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Text className="text-white text-sm font-medium">CEFR {exam.cefrLevel}</Text>
            </View>
            <Text className="text-white/80 text-sm">{exam.targetAge}</Text>
          </View>
        </View>

        <View className="px-4 -mt-4">
          {/* Quick Stats */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex-row">
              <View className="flex-1 items-center py-3 border-r border-gray-100">
                <Text className="text-2xl font-bold text-[#6C63FF]">{exam.recommendedVocab}</Text>
                <Text className="text-xs text-gray-500 mt-1">推荐词汇量</Text>
              </View>
              <View className="flex-1 items-center py-3 border-r border-gray-100">
                <Text className="text-2xl font-bold text-[#6C63FF]">{exam.examStructure.totalDuration}</Text>
                <Text className="text-xs text-gray-500 mt-1">考试时长(分钟)</Text>
              </View>
              <View className="flex-1 items-center py-3">
                <Text className="text-2xl font-bold text-[#6C63FF]">{exam.examStructure.totalScore}</Text>
                <Text className="text-xs text-gray-500 mt-1">总分</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-base font-bold text-gray-800 mb-3">考试简介</Text>
            <Text className="text-sm text-gray-600 leading-6">{exam.description}</Text>
          </View>

          {/* Exam Structure */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-base font-bold text-gray-800 mb-4">考试结构</Text>
            
            {exam.examStructure.components.map((comp: any, idx: number) => (
              <View 
                key={idx}
                className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-gray-800">{comp.name}</Text>
                  <View className="flex-row items-center">
                    <View className="px-2 py-0.5 rounded-full bg-[#6C63FF]/10 mr-2">
                      <Text className="text-xs text-[#6C63FF]">{comp.duration}分钟</Text>
                    </View>
                    <Text className="text-sm text-gray-500">满分 {comp.score} 分</Text>
                  </View>
                </View>
                
                <Text className="text-sm text-gray-500 mb-2">{comp.format}</Text>
                
                {comp.parts && (
                  <View className="bg-gray-50 rounded-xl p-3">
                    {comp.parts.map((part: any, pIdx: number) => (
                      <View 
                        key={pIdx}
                        className="flex-row items-start py-1.5 border-b border-gray-200 last:border-0"
                      >
                        <View className="w-6 h-6 rounded-full bg-[#6C63FF] items-center justify-center mr-2">
                          <Text className="text-white text-xs font-bold">{part.partNumber}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-gray-700">{part.description}</Text>
                          <Text className="text-xs text-gray-400">{part.questionCount} 题</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Scoring Guide */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-base font-bold text-gray-800 mb-4">评分标准</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                <Text className="flex-1 text-sm text-gray-700">Pass with Distinction</Text>
                <Text className="text-sm font-medium text-green-600">卓越</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                <Text className="flex-1 text-sm text-gray-700">Pass with Merit</Text>
                <Text className="text-sm font-medium text-blue-600">优秀</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#6C63FF] mr-3" />
                <Text className="flex-1 text-sm text-gray-700">Pass</Text>
                <Text className="text-sm font-medium text-[#6C63FF]">通过</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
                <Text className="flex-1 text-sm text-gray-700">Level A1 / Narrow Pass</Text>
                <Text className="text-sm font-medium text-yellow-600">勉强通过</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-gray-400 mr-3" />
                <Text className="flex-1 text-sm text-gray-700">Fail</Text>
                <Text className="text-sm font-medium text-gray-500">未通过</Text>
              </View>
            </View>
          </View>

          {/* Certificate Info */}
          <View className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-4 border border-amber-200">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">🏆</Text>
              <Text className="font-bold text-amber-800">证书价值</Text>
            </View>
            <Text className="text-sm text-amber-700 leading-5">
              剑桥英语证书终身有效，全球超过20,000所院校和企业认可。可作为留学申请、英语能力证明的重要参考。
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="pb-8 space-y-3">
            <TouchableOpacity 
              className="p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF]"
              onPress={() => router.push('/exams/sessions', { examId: exam.examId, examName: exam.examName })}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white font-bold">查看考试场次</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="p-4 rounded-2xl bg-white border-2 border-[#6C63FF]"
              onPress={() => router.push('/exams/mock', { examType: exam.examType })}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-[#6C63FF] font-bold">全真模拟考试</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
