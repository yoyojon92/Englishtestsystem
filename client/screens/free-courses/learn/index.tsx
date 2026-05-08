import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'practice' | 'quiz';
  content: {
    videoUrl?: string;
    text?: string;
    image?: string;
    questions?: Question[];
  };
}

interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export default function FreeCourseLearn() {
  const router = useSafeRouter();
  const { courseId, lessonId } = useSafeSearchParams<{ courseId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fetchLesson = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/api/v1/free-courses/${courseId}/lessons/${lessonId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await response.json();
      if (data.success) {
        setLesson(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleCompleteLesson = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(
        `${API_BASE}/api/v1/free-courses/${courseId}/lessons/${lessonId}/complete`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      Alert.alert('恭喜！', '课时已完成，继续加油！', [
        { text: '返回课程', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    const questions = lesson?.content.questions || [];
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      handleCompleteLesson();
    }
  };

  const getProgress = () => {
    const questions = lesson?.content.questions || [];
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  if (!lesson) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      </Screen>
    );
  }

  // 视频课页面
  if (lesson.type === 'video') {
    return (
      <Screen>
        <View className="flex-1 bg-black">
          {/* 视频区域 */}
          <View className="h-64 bg-gray-900 relative">
            <View className="absolute inset-0 items-center justify-center">
              <TouchableOpacity className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="play" size={40} color="white" />
              </TouchableOpacity>
            </View>
            {/* 控制栏 */}
            <View className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <View className="h-full bg-indigo-500" style={{ width: '30%' }} />
            </View>
            {/* 返回按钮 */}
            <TouchableOpacity
              className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* 内容区域 */}
          <View className="flex-1 bg-white rounded-t-3xl -mt-6 p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">{lesson.title}</Text>

            {lesson.content.text && (
              <Text className="text-gray-600 leading-relaxed mb-6">
                {lesson.content.text}
              </Text>
            )}

            {/* 互动练习入口 */}
            <View className="bg-indigo-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-10 h-10 rounded-full bg-indigo-500 items-center justify-center">
                  <FontAwesome5 name="hand-pointing" size={18} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">巩固练习</Text>
                  <Text className="text-sm text-gray-500">学完视频后做个练习吧</Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-indigo-500 py-3 rounded-xl items-center mt-3"
                onPress={handleCompleteLesson}
              >
                <Text className="text-white font-bold">开始练习</Text>
              </TouchableOpacity>
            </View>

            {/* 完成按钮 */}
            <TouchableOpacity
              className="bg-green-500 py-4 rounded-xl items-center"
              onPress={handleCompleteLesson}
            >
              <Text className="text-white font-bold text-lg">完成学习</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  // 练习/测验页面
  return (
    <Screen>
      {/* 顶部进度 */}
      <View className="bg-white px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#374151" />
          </TouchableOpacity>
          <Text className="font-bold text-gray-900">
            {currentQuestion + 1} / {lesson.content.questions?.length || 0}
          </Text>
          <View className="w-7" />
        </View>
        <View className="h-2 bg-gray-200 rounded-full">
          <Animated.View
            className="h-full bg-indigo-500 rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
      </View>

      {/* 题目内容 */}
      <View className="flex-1 bg-gray-50 p-4">
        {showResult ? (
          // 结果页面
          <View className="flex-1 items-center justify-center p-6">
            <View className="w-32 h-32 rounded-full bg-green-100 items-center justify-center mb-6">
              <Ionicons name="trophy" size={64} color="#10B981" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {score} / {lesson.content.questions?.length || 0}
            </Text>
            <Text className="text-lg text-gray-600 mb-8">
              {score === (lesson.content.questions?.length || 0)
                ? '太棒了！全对！'
                : score >= (lesson.content.questions?.length || 0) / 2
                ? '做得不错！'
                : '继续加油！'}
            </Text>
            <TouchableOpacity
              className="bg-indigo-500 px-8 py-4 rounded-xl"
              onPress={() => router.back()}
            >
              <Text className="text-white font-bold text-lg">完成</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                {lesson.content.questions?.[currentQuestion]?.question}
              </Text>
            </View>

            {/* 选项 */}
            <View className="gap-3">
              {lesson.content.questions?.[currentQuestion]?.options?.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect =
                  index === lesson.content.questions?.[currentQuestion].correctAnswer;

                return (
                  <TouchableOpacity
                    key={index}
                    className={`bg-white rounded-xl p-4 flex-row items-center ${
                      isSelected ? 'border-2 border-indigo-500' : ''
                    }`}
                    onPress={() => handleAnswerSelect(index)}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isSelected ? 'bg-indigo-500' : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`font-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}
                      >
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text className="flex-1 text-gray-900">{option}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 下一题按钮 */}
            <View className="mt-auto">
              <TouchableOpacity
                className={`py-4 rounded-xl items-center ${
                  selectedAnswer !== null ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
                onPress={handleNextQuestion}
                disabled={selectedAnswer === null}
              >
                <Text className="text-white font-bold text-lg">
                  {currentQuestion < (lesson.content.questions?.length || 0) - 1
                    ? '下一题'
                    : '完成'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
