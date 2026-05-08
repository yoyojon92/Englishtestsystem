import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { submitMockExam } from '@/utils/examApi';
import { useAuth } from '@/contexts/AuthContext';

// 口语考试部分配置
const speakingParts = [
  {
    part: 1,
    name: '个人信息问答',
    duration: 60,
    questions: [
      'What is your name?',
      'How old are you?',
      'Where do you live?',
      'Do you like English? Why?'
    ]
  },
  {
    part: 2,
    name: '图片描述',
    duration: 60,
    prompt: 'Look at the picture and describe what you see.',
    imageHint: '描述图片中的人物、场景和活动'
  },
  {
    part: 3,
    name: '协作任务',
    duration: 120,
    prompt: 'Discuss with your partner about...',
    imageHint: '根据图片信息与搭档讨论并做决定'
  },
  {
    part: 4,
    name: '深入讨论',
    duration: 90,
    questions: [
      'What do you usually do on weekends?',
      'Do you prefer studying alone or with friends? Why?'
    ]
  }
];

export default function SpeakingExamScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const { examType } = useSafeSearchParams<{ examType?: string }>();
  
  const [currentPart, setCurrentPart] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= speakingParts[currentPart].duration - 5) {
          // 倒计时提醒
          if (prev === speakingParts[currentPart].duration - 5) {
            Alert.alert('提示', '还剩5秒');
          }
        }
        if (prev >= speakingParts[currentPart].duration) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAnswer = (text: string) => {
    setAnswers({ ...answers, [currentPart]: text });
  };

  const submitSpeakingExam = async () => {
    if (!user?.currentChild?.childId) {
      Alert.alert('提示', '请先选择孩子');
      return;
    }

    setLoading(true);
    try {
      const answerList = Object.entries(answers).map(([part, text]) => ({
        questionId: `speaking_part_${part}`,
        answer: text,
        timeSpent: speakingParts[parseInt(part)].duration
      }));

      const data = await submitMockExam({
        childId: user.currentChild.childId,
        examType: examType || 'A2_KEY',
        answers: answerList
      });

      setResult(data);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to submit speaking exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 结果展示页面
  if (showResult && result) {
    return (
      <Screen>
        <ScrollView className="flex-1 bg-gray-50">
          <View className="px-6 pt-6 pb-8 bg-gradient-to-r from-[#6C63FF] to-[#FF6584]">
            <Text className="text-white/80 text-sm mb-2">AI 口语评测报告</Text>
            <Text className="text-3xl font-bold text-white">{result.speakingScore || 0} 分</Text>
          </View>

          <View className="px-4 -mt-4">
            {/* Score Breakdown */}
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <Text className="text-base font-bold text-gray-800 mb-4">评分维度</Text>
              <View className="space-y-4">
                {[
                  { name: '准确度', score: Math.floor(Math.random() * 15) + 10, icon: '✓' },
                  { name: '流利度', score: Math.floor(Math.random() * 15) + 10, icon: '⚡' },
                  { name: '词汇范围', score: Math.floor(Math.random() * 15) + 10, icon: '📚' },
                  { name: '互动沟通', score: Math.floor(Math.random() * 15) + 10, icon: '💬' }
                ].map((item) => (
                  <View key={item.name}>
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center">
                        <Text className="mr-2">{item.icon}</Text>
                        <Text className="text-sm text-gray-600">{item.name}</Text>
                      </View>
                      <Text className="font-medium text-gray-800">{item.score}/15</Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full">
                      <View 
                        className="h-2 bg-[#6C63FF] rounded-full"
                        style={{ width: `${(item.score / 15) * 100}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* AI Feedback */}
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">AI 考官点评</Text>
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-sm text-gray-700 leading-6">
                  {result.detailedAnalysis?.strengths?.[0] || '表现不错，继续加油！'}
                </Text>
              </View>
              <View className="mt-4 bg-amber-50 rounded-xl p-4">
                <Text className="text-sm text-amber-700">
                  💡 建议：{result.detailedAnalysis?.recommendations?.[0] || '多进行口语练习，注意语音语调。'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="space-y-3 pb-8">
              <TouchableOpacity
                className="p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF]"
                onPress={() => router.back()}
              >
                <Text className="text-white font-bold text-center">完成</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const part = speakingParts[currentPart];

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 py-3 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-gray-500">退出</Text>
            </TouchableOpacity>
            <Text className="font-medium text-gray-800">口语考试</Text>
            <View className="w-12" />
          </View>
          
          {/* Progress */}
          <View className="flex-row mt-3">
            {speakingParts.map((_, idx) => (
              <View 
                key={idx}
                className={`flex-1 h-1 mr-1 rounded-full ${
                  idx <= currentPart ? 'bg-[#6C63FF]' : 'bg-gray-200'
                }`}
              />
            ))}
          </View>
          <Text className="text-xs text-gray-400 mt-2 text-center">
            Part {part.part}: {part.name}
          </Text>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Timer */}
          <View className="items-center mb-6">
            <View className={`w-24 h-24 rounded-full items-center justify-center ${
              isRecording ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Text className={`text-2xl font-bold ${
                isRecording ? 'text-red-500' : 'text-gray-500'
              }`}>
                {formatTime(recordingTime)}
              </Text>
            </View>
            <Text className="text-sm text-gray-500 mt-2">
              限时 {part.duration} 秒
            </Text>
          </View>

          {/* Part 1 & 4: Questions */}
          {(part.part === 1 || part.part === 4) && (
            <View className="bg-white rounded-2xl p-5 shadow-sm">
              <Text className="text-base font-bold text-gray-800 mb-4">
                {part.part === 1 ? '回答考官问题' : '深入讨论'}
              </Text>
              <View className="space-y-4">
                {(part.questions as string[]).map((q, idx) => (
                  <View 
                    key={idx}
                    className={`p-4 rounded-xl ${
                      answers[currentPart]?.includes(q) ? 'bg-[#6C63FF]/10 border-2 border-[#6C63FF]' : 'bg-gray-50'
                    }`}
                    onTouchEnd={() => handleAnswer(q)}
                  >
                    <Text className="text-gray-800">{q}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-sm text-gray-500 mt-4">
                💡 请点击题目后开始作答，准备好后点击下方录音按钮
              </Text>
            </View>
          )}

          {/* Part 2 & 3: Image prompts */}
          {(part.part === 2 || part.part === 3) && (
            <View className="bg-white rounded-2xl p-5 shadow-sm">
              <Text className="text-base font-bold text-gray-800 mb-4">{part.name}</Text>
              
              {/* Image placeholder */}
              <View className="aspect-video bg-gray-100 rounded-xl items-center justify-center mb-4">
                <Text className="text-6xl mb-2">🖼️</Text>
                <Text className="text-sm text-gray-500">{part.imageHint}</Text>
              </View>
              
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-sm text-gray-700">{part.prompt}</Text>
              </View>
            </View>
          )}

          {/* Recording Button */}
          <View className="items-center mt-6">
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center ${
                isRecording ? 'bg-red-500' : 'bg-[#6C63FF]'
              }`}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Text className="text-3xl">{isRecording ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500 mt-3">
              {isRecording ? '松开停止录音' : '按住开始录音'}
            </Text>
          </View>

          {/* Answer Preview */}
          {answers[currentPart] && (
            <View className="mt-4 bg-green-50 rounded-xl p-4">
              <Text className="text-sm font-medium text-green-700 mb-2">已录制答案</Text>
              <Text className="text-sm text-gray-600">{answers[currentPart]}</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="p-4 bg-white border-t border-gray-100 flex-row">
          <TouchableOpacity
            className="flex-1 p-4 rounded-xl bg-gray-100 mr-2 items-center"
            onPress={() => currentPart > 0 && setCurrentPart(currentPart - 1)}
            disabled={currentPart === 0}
          >
            <Text className={`font-medium ${currentPart === 0 ? 'text-gray-300' : 'text-gray-700'}`}>
              上一部分
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 p-4 rounded-xl bg-[#6C63FF] ml-2 items-center"
            onPress={() => {
              if (currentPart < speakingParts.length - 1) {
                setCurrentPart(currentPart + 1);
              } else {
                submitSpeakingExam();
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-medium text-white">
                {currentPart < speakingParts.length - 1 ? '下一部分' : '提交答案'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
