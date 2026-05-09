/**
 * 快速水平测试小程序
 * 5道题快速定位英语水平 → 自动诊断 → 服务推荐
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 快速测试题库（5道题覆盖听说读写）
const QUICK_TEST_QUESTIONS = [
  {
    id: 'q_reading_1',
    skill: 'reading',
    type: 'multiple_choice',
    instruction: 'Read the notice. Choose the correct answer.',
    question: 'SUMMER SALE - All items 50% OFF this week only!',
    options: ['A. Price increases', 'B. Half price sale', 'C. New items only', 'D. Week-long event'],
    correct_answer: 'B',
    explanation: '"50% OFF" means half price.',
  },
  {
    id: 'q_listening_1',
    skill: 'listening',
    type: 'multiple_choice',
    instruction: 'Listen and choose the correct response.',
    question: 'Woman: "Can I help you?" / Man: "Yes, I\'m looking for the toilet."',
    options: ['A. The man wants directions', 'B. The man works there', 'C. The man needs the bathroom', 'D. The man is lost'],
    correct_answer: 'C',
    explanation: '"Looking for the toilet" means needing the bathroom.',
  },
  {
    id: 'q_grammar_1',
    skill: 'writing',
    type: 'fill_blank',
    instruction: 'Choose the correct word to complete the sentence.',
    question: 'She ___ to school every day. (go)',
    options: ['A. go', 'B. goes', 'C. going', 'D. went'],
    correct_answer: 'B',
    explanation: '"She" takes the third person singular form "goes".',
  },
  {
    id: 'q_vocab_1',
    skill: 'vocabulary',
    type: 'multiple_choice',
    instruction: 'Choose the word that means the same.',
    question: 'What is another word for "happy"?',
    options: ['A. Sad', 'B. Angry', 'C. Glad', 'D. Tired'],
    correct_answer: 'C',
    explanation: '"Glad" means happy or pleased.',
  },
  {
    id: 'q_speaking_1',
    skill: 'speaking',
    type: 'pronunciation',
    instruction: 'Which word has a different sound?',
    question: '"book", "food", "good", "look"',
    options: ['A. book', 'B. food', 'C. good', 'D. look'],
    correct_answer: 'B',
    explanation: '"Food" has a long /u:/ sound, others have short /ʊ/ sound.',
  },
];

interface DiagnosisResult {
  cefr_overall: string;
  skills: Record<string, string>;
  vocabulary_size: number;
  weak_points: { area: string; specific: string; mastery: number }[];
  diagnosis_confidence: string;
}

interface ServiceRecommendation {
  type: 'online' | 'offline' | 'self_study';
  title: string;
  description: string;
  courses: { name: string; duration: string; price: string }[];
}

export default function QuickTestScreen() {
  const router = useSafeRouter();
  const [step, setStep] = useState<'intro' | 'testing' | 'submitting' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [recommendation, setRecommendation] = useState<ServiceRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('guest_' + Date.now());

  // 提交答案并自动诊断
  const submitAndDiagnose = async () => {
    setLoading(true);
    setStep('submitting');

    try {
      // 1. 记录答题（批量）
      const answersPayload = QUICK_TEST_QUESTIONS.map(q => ({
        question_id: q.id,
        type: q.type,
        skill: q.skill,
        answer_given: answers[q.id] || '',
        answer_correct: q.correct_answer,
        time_spent_seconds: 10, // 假设每题10秒
      }));

      await fetch(`${API_BASE}/api/v1/answers/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          questions: answersPayload,
        }),
      });

      // 2. 自动触发诊断
      const diagRes = await fetch(`${API_BASE}/api/v1/diagnosis/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          // 如果后端无法获取统计数据，手动传入
          answers_data: {
            skills: calculateSkillAccuracies(answers),
            knowledge_points: {},
            average_time: 10,
          },
        }),
      });

      const diagData = await diagRes.json();
      if (diagData.success) {
        setDiagnosis(diagData.data);
        // 3. 生成服务推荐
        setRecommendation(generateRecommendation(diagData.data));
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      // 使用前端计算结果作为兜底
      const fallbackDiagnosis = calculateFallbackDiagnosis();
      setDiagnosis(fallbackDiagnosis);
      setRecommendation(generateRecommendation(fallbackDiagnosis));
    } finally {
      setLoading(false);
      setStep('result');
    }
  };

  // 计算各项正确率
  const calculateSkillAccuracies = (userAnswers: Record<string, string>) => {
    const accuracies: Record<string, number> = {};
    const skillCounts: Record<string, { correct: number; total: number }> = {};

    QUICK_TEST_QUESTIONS.forEach(q => {
      if (!skillCounts[q.skill]) {
        skillCounts[q.skill] = { correct: 0, total: 0 };
      }
      skillCounts[q.skill].total++;
      if (userAnswers[q.id] === q.correct_answer) {
        skillCounts[q.skill].correct++;
      }
    });

    Object.entries(skillCounts).forEach(([skill, data]) => {
      accuracies[skill] = data.correct / data.total;
    });

    return accuracies;
  };

  // 前端兜底诊断
  const calculateFallbackDiagnosis = () => {
    const accuracies = calculateSkillAccuracies(answers);
    const totalCorrect = Object.values(answers).filter(
      (ans, idx) => ans === QUICK_TEST_QUESTIONS[idx].correct_answer
    ).length;
    const accuracy = totalCorrect / QUICK_TEST_QUESTIONS.length;

    let cefr = 'A1';
    if (accuracy >= 0.8) cefr = 'B1';
    else if (accuracy >= 0.6) cefr = 'A2';

    return {
      cefr_overall: cefr,
      skills: {
        reading: accuracy >= 0.8 ? 'B1' : accuracy >= 0.6 ? 'A2' : 'A1',
        listening: accuracy >= 0.8 ? 'A2' : 'A1',
        writing: accuracy >= 0.8 ? 'A2' : 'A1',
        vocabulary: accuracy >= 0.8 ? 'B1' : accuracy >= 0.6 ? 'A2' : 'A1',
      },
      vocabulary_size: accuracy >= 0.8 ? 2000 : accuracy >= 0.6 ? 1500 : 800,
      weak_points: accuracy < 0.6 ? [
        { area: 'grammar', specific: '基础语法', mastery: 0.3 },
      ] : [],
      diagnosis_confidence: 'medium',
    };
  };

  // 生成服务推荐
  const generateRecommendation = (diag: DiagnosisResult): ServiceRecommendation => {
    const cefr = diag.cefr_overall;
    const weakCount = diag.weak_points?.length || 0;

    // A1级别 → 线上启蒙课或线下小班
    if (cefr === 'A1' || cefr === 'Pre-A1') {
      return {
        type: 'offline',
        title: '推荐：线下小班启蒙课',
        description: 'CEFR A1 阶段建议从线下小班开始，系统学习音标和基础对话。',
        courses: [
          { name: '剑桥少儿英语启蒙班', duration: '3个月', price: '¥4,800' },
          { name: '外教口语入门班', duration: '2个月', price: '¥3,200' },
        ],
      };
    }

    // A2级别 → 线上+线下混合
    if (cefr === 'A2') {
      if (weakCount > 2) {
        return {
          type: 'offline',
          title: '推荐：线下强化班',
          description: '存在多个薄弱项，建议线下老师面对面指导。',
          courses: [
            { name: 'KET备考冲刺班', duration: '3个月', price: '¥8,800' },
            { name: '一对一VIP辅导', duration: '定制', price: '¥300/课时' },
          ],
        };
      }
      return {
        type: 'online',
        title: '推荐：线上系统课',
        description: 'A2水平适合线上系统学习，灵活高效。',
        courses: [
          { name: 'KET线上系统课', duration: '4个月', price: '¥3,800' },
          { name: '每日口语打卡营', duration: '1个月', price: '¥299' },
        ],
      };
    }

    // B1及以上 → 自学为主+冲刺班
    return {
      type: 'self_study',
      title: '推荐：自学+冲刺班',
      description: '基础扎实，可通过真题练习和考前冲刺快速提升。',
      courses: [
        { name: 'PET真题精讲班', duration: '2个月', price: '¥2,800' },
        { name: '在线题库会员', duration: '1年', price: '¥599' },
      ],
    };
  };

  const currentQuestion = QUICK_TEST_QUESTIONS[currentQ];

  // ========== 渲染 ==========

  // 介绍页
  if (step === 'intro') {
    return (
      <Screen>
        <View className="flex-1 p-6">
          <View className="flex-1 items-center justify-center">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Text className="text-5xl">🎯</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              英语水平快速测试
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              5道题 · 约1分钟 · 立即获得水平报告
            </Text>

            <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 w-full mb-6">
              <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                测试内容
              </Text>
              <View className="space-y-2">
                {['阅读理解', '听力理解', '语法基础', '词汇运用', '发音辨析'].map((item, i) => (
                  <View key={i} className="flex-row items-center">
                    <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-blue-600 text-xs">{i + 1}</Text>
                    </View>
                    <Text className="text-gray-600 dark:text-gray-400">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 w-full">
              <Text className="text-green-700 dark:text-green-400 text-sm">
                测试后自动获得：CEFR等级 · 服务推荐 · 学习建议
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-500 rounded-2xl py-4 items-center"
            onPress={() => setStep('testing')}
          >
            <Text className="text-white text-lg font-semibold">开始测试</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // 提交中
  if (step === 'submitting') {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-900 dark:text-white text-xl font-semibold mt-4">
            分析中...
          </Text>
          <Text className="text-gray-500 mt-2">
            正在生成您的专属报告
          </Text>
        </View>
      </Screen>
    );
  }

  // 结果页
  if (step === 'result' && diagnosis && recommendation) {
    return (
      <Screen>
        <ScrollView className="flex-1">
          {/* 顶部等级展示 */}
          <View className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 items-center">
            <Text className="text-white/80 text-sm mb-2">您的英语水平</Text>
            <Text className="text-white text-6xl font-bold">{diagnosis.cefr_overall}</Text>
            <Text className="text-white/80 mt-2">
              预估词汇量: {diagnosis.vocabulary_size} 词
            </Text>
            <View className="flex-row mt-4">
              {Object.entries(diagnosis.skills).slice(0, 4).map(([skill, level]) => (
                <View key={skill} className="bg-white/20 px-3 py-1 rounded-full mx-1">
                  <Text className="text-white text-sm">{skill}: {level}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="p-4">
            {/* 薄弱项提示 */}
            {diagnosis.weak_points.length > 0 && (
              <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-4">
                <Text className="font-semibold text-red-700 dark:text-red-400 mb-2">
                  ⚠️ 需要加强的领域
                </Text>
                {diagnosis.weak_points.map((wp, idx) => (
                  <View key={idx} className="flex-row items-center mb-1">
                    <Text className="text-red-600 dark:text-red-300">• {wp.area}: {wp.specific}</Text>
                    <Text className="text-gray-400 ml-2">({Math.round(wp.mastery * 100)}%)</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 服务推荐 */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
              <View className="flex-row items-center mb-3">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                  recommendation.type === 'offline' ? 'bg-purple-100' :
                  recommendation.type === 'online' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <Text className="text-xl">{
                    recommendation.type === 'offline' ? '🏫' :
                    recommendation.type === 'online' ? '💻' : '📚'
                  }</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {recommendation.title}
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 mb-4">
                {recommendation.description}
              </Text>

              {/* 推荐课程 */}
              <Text className="font-semibold text-gray-900 dark:text-white mb-2">
                推荐课程
              </Text>
              {recommendation.courses.map((course, idx) => (
                <TouchableOpacity
                  key={idx}
                  className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-2"
                  onPress={() => {
                    if (course.name.includes('线上') || course.name.includes('打卡')) {
                      router.push('/courses');
                    } else {
                      router.push('/contact');
                    }
                  }}
                >
                  <View>
                    <Text className="text-gray-900 dark:text-white font-medium">{course.name}</Text>
                    <Text className="text-gray-500 text-sm">{course.duration}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-blue-600 font-semibold">{course.price}</Text>
                    <Text className="text-gray-400 ml-2">→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 学习建议 */}
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
              <Text className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                💡 学习建议
              </Text>
              <Text className="text-blue-800 dark:text-blue-300 text-sm leading-6">
                {diagnosis.cefr_overall === 'A1' 
                  ? '建议从基础发音和日常用语开始，每天坚持15分钟听力输入，3个月后可达到A2水平。'
                  : diagnosis.cefr_overall === 'A2'
                  ? '可开始系统学习KET内容，重点突破薄弱项，每天1小时，6个月可达PET水平。'
                  : '建议通过真题练习保持状态，可报名PET考试进行实战检验。'}
              </Text>
            </View>

            {/* 操作按钮 */}
            <View className="flex-row space-x-3 mb-4">
              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                onPress={() => router.push('/assessment-start')}
              >
                <Text className="text-white font-semibold">完整能力测评</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 border border-blue-500 rounded-xl py-3 items-center"
                onPress={() => router.push('/ket-practice')}
              >
                <Text className="text-blue-500 font-semibold">开始练习</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="items-center py-3"
              onPress={() => {
                setStep('intro');
                setAnswers({});
                setCurrentQ(0);
                setDiagnosis(null);
              }}
            >
              <Text className="text-gray-500">重新测试</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // 答题页面
  const question = QUICK_TEST_QUESTIONS[currentQ];
  const selectedAnswer = answers[question.id];

  return (
    <Screen>
      <View className="flex-1">
        {/* 顶部进度 */}
        <View className="bg-blue-500 px-4 py-3">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => setStep('intro')}>
              <Text className="text-white">← 返回</Text>
            </TouchableOpacity>
            <Text className="text-white font-medium">
              {currentQ + 1}/{QUICK_TEST_QUESTIONS.length}
            </Text>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-sm capitalize">{question.skill}</Text>
            </View>
          </View>
          <View className="h-1 bg-blue-400 mt-2 rounded-full">
            <View
              className="h-1 bg-white rounded-full transition-all"
              style={{ width: `${((currentQ + 1) / QUICK_TEST_QUESTIONS.length) * 100}%` }}
            />
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* 题目说明 */}
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 mb-4">
            <Text className="text-blue-700 dark:text-blue-300 text-sm">
              {question.instruction}
            </Text>
          </View>

          {/* 题干 */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-900 dark:text-white text-lg leading-relaxed">
              {question.question}
            </Text>
          </View>

          {/* 选项 */}
          <View className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === String.fromCharCode(65 + idx);
              return (
                <TouchableOpacity
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                  onPress={() => {
                    setAnswers({ ...answers, [question.id]: String.fromCharCode(65 + idx) });
                  }}
                >
                  <View className="flex-row items-center">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Text className={`font-bold ${
                        isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text className="text-gray-900 dark:text-white flex-1">
                      {option}
                    </Text>
                    {isSelected && (
                      <Text className="text-blue-500 text-xl">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* 底部导航 */}
        <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                currentQ === 0 ? 'bg-gray-200' : 'bg-gray-100'
              }`}
              onPress={() => setCurrentQ(currentQ - 1)}
              disabled={currentQ === 0}
            >
              <Text className={currentQ === 0 ? 'text-gray-400' : 'text-gray-700'}>
                ← 上题
              </Text>
            </TouchableOpacity>

            {currentQ < QUICK_TEST_QUESTIONS.length - 1 ? (
              <TouchableOpacity
                className={`px-6 py-2 rounded-full ${
                  selectedAnswer ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onPress={() => setCurrentQ(currentQ + 1)}
                disabled={!selectedAnswer}
              >
                <Text className={selectedAnswer ? 'text-white' : 'text-gray-400'}>
                  下题 →
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="px-6 py-2 bg-green-500 rounded-full"
                onPress={submitAndDiagnose}
                disabled={Object.keys(answers).length < QUICK_TEST_QUESTIONS.length}
              >
                <Text className="text-white font-semibold">
                  提交测试
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 未作答提示 */}
          {currentQ === QUICK_TEST_QUESTIONS.length - 1 && 
           Object.keys(answers).length < QUICK_TEST_QUESTIONS.length && (
            <Text className="text-center text-gray-400 text-sm mt-2">
              请完成所有题目后再提交
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}
