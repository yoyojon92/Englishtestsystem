/**
 * KET/PET 真题练习页面
 * 支持：选择试卷 → 答题 → 提交出成绩
 */

import React, { useState, useEffect, useCallback } from 'react';
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

interface ExamSet {
  exam_type: string;
  level: string;
  part: number;
  instruction: string;
}

interface Question {
  id: string;
  exam_type: string;
  level: string;
  part: number;
  question_type: string;
  instruction: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  notices: Notice[];
  knowledge_points: KnowledgePoint[];
}

interface Notice {
  id: string;
  notice_id: string;
  text: string;
  image?: string;
}

interface KnowledgePoint {
  id: string;
  tag: string;
  prepare_level?: string;
  prepare_unit?: string;
  prepare_section?: string;
  prepare_page?: number;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  correct: boolean;
}

export default function KetPracticeScreen() {
  const router = useSafeRouter();
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    correct: number;
    score: number;
    details: Answer[];
  } | null>(null);

  // 加载试卷列表
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/questions/sets?exam_type=KET`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExamSets(data.data);
        }
      })
      .catch(err => console.error('Failed to load exam sets:', err))
      .finally(() => setLoading(false));
  }, []);

  // 加载题目
  const loadQuestions = async (set: ExamSet) => {
    setSelectedSet(set);
    setLoadingQuestions(true);
    setQuestions([]);
    setAnswers(new Map());
    setSubmitted(false);
    setResults(null);
    setCurrentIndex(0);

    try {
      const res = await fetch(`${API_BASE}/api/v1/questions/${set.exam_type}/${set.part}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      Alert.alert('错误', '无法加载题目');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 选择答案
  const selectAnswer = (questionId: string, noticeId: string) => {
    if (submitted) return;
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, noticeId);
    setAnswers(newAnswers);
  };

  // 上一题/下一题
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // 提交答案
  const submitAnswers = () => {
    if (answers.size < questions.length) {
      Alert.alert('提示', `还有 ${questions.length - answers.size} 道题未作答，确定提交吗？`, [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: doSubmit },
      ]);
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    const details: Answer[] = [];
    let correct = 0;

    questions.forEach(q => {
      const selected = answers.get(q.id) || '';
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correct++;
      details.push({
        questionId: q.id,
        selectedAnswer: selected,
        correct: isCorrect,
      });
    });

    setSubmitted(true);
    setResults({
      total: questions.length,
      correct,
      score: Math.round((correct / questions.length) * 100),
      details,
    });
  };

  // 重新开始
  const restart = () => {
    setAnswers(new Map());
    setSubmitted(false);
    setResults(null);
    setCurrentIndex(0);
  };

  // 返回试卷列表
  const backToList = () => {
    setSelectedSet(null);
    setQuestions([]);
  };

  // 渲染试卷列表
  if (!selectedSet) {
    return (
      <Screen>
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            KET 真题练习
          </Text>

          {loading ? (
            <ActivityIndicator size="large" className="mt-20" />
          ) : examSets.length === 0 ? (
            <View className="mt-20 items-center">
              <Text className="text-gray-500">暂无试卷数据</Text>
            </View>
          ) : (
            <ScrollView>
              {examSets.map((set, index) => (
                <TouchableOpacity
                  key={`${set.exam_type}-${set.part}-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
                  onPress={() => loadQuestions(set)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                        {set.exam_type} Reading Part {set.part}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        难度: {set.level} | 题型: {set.instruction?.substring(0, 20)}...
                      </Text>
                    </View>
                    <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                      <Text className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                        开始练习
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Screen>
    );
  }

  // 渲染答题页面
  const currentQuestion = questions[currentIndex];

  if (loadingQuestions) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-gray-500">加载题目中...</Text>
        </View>
      </Screen>
    );
  }

  if (submitted && results) {
    return (
      <Screen>
        <ScrollView className="flex-1">
          {/* 成绩卡片 */}
          <View className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 m-4 rounded-3xl">
            <Text className="text-white text-center text-lg mb-2">练习结果</Text>
            <Text className="text-white text-center text-5xl font-bold">
              {results.score}%
            </Text>
            <Text className="text-white text-center text-lg mt-2">
              {results.correct}/{results.total} 题正确
            </Text>
            <View className="flex-row justify-center mt-4">
              <TouchableOpacity
                className="bg-white px-4 py-2 rounded-full mr-3"
                onPress={restart}
              >
                <Text className="text-blue-600 font-medium">重新练习</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white/20 px-4 py-2 rounded-full"
                onPress={backToList}
              >
                <Text className="text-white font-medium">返回列表</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 答案解析 */}
          <Text className="text-lg font-semibold text-gray-900 dark:text-white px-4 mb-3">
            答案解析
          </Text>
          {questions.map((q, idx) => {
            const answer = results.details.find(d => d.questionId === q.id);
            const selected = answer?.selectedAnswer || '';
            const isCorrect = answer?.correct;

            return (
              <View key={q.id} className="bg-white dark:bg-gray-800 mx-4 mb-3 rounded-2xl p-4">
                <View className="flex-row items-center mb-2">
                  <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
                    isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Text className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {isCorrect ? '✓ 正确' : '✗ 错误'}
                  </Text>
                </View>

                <Text className="text-gray-900 dark:text-white font-medium mb-2">
                  {q.question_text}
                </Text>

                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  正确答案: <Text className="font-bold text-green-600">{q.correct_answer}</Text>
                </Text>

                {!isCorrect && selected && (
                  <Text className="text-sm text-red-500 mb-2">
                    你的答案: {selected}
                  </Text>
                )}

                <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 mt-2">
                  <Text className="text-sm text-blue-800 dark:text-blue-300">
                    {q.explanation}
                  </Text>
                </View>

                {q.knowledge_points.length > 0 && (
                  <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Text className="text-xs text-gray-500 mb-1">知识点</Text>
                    {q.knowledge_points.map((kp, kpIdx) => (
                      <Text key={kpIdx} className="text-sm text-indigo-600 dark:text-indigo-400">
                        {kp.tag} | {kp.prepare_unit}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
          <View className="h-20" />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1">
        {/* 顶部信息 */}
        <View className="bg-blue-500 px-4 py-3">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={backToList}>
              <Text className="text-white text-lg">← 返回</Text>
            </TouchableOpacity>
            <Text className="text-white font-medium">
              {currentIndex + 1}/{questions.length}
            </Text>
            <Text className="text-white">
              {selectedSet.exam_type} Part {selectedSet.part}
            </Text>
          </View>
          {/* 进度条 */}
          <View className="h-1 bg-blue-400 mt-2 rounded-full">
            <View
              className="h-1 bg-white rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* 题目说明 */}
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 mb-4">
            <Text className="text-blue-800 dark:text-blue-300 text-sm">
              {currentQuestion.instruction}
            </Text>
          </View>

          {/* 题干 */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-start">
              <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">{currentIndex + 1}</Text>
              </View>
              <Text className="text-gray-900 dark:text-white text-lg flex-1">
                {currentQuestion.question_text}
              </Text>
            </View>
            <View className="mt-2 flex-row items-center">
              <View className={`px-2 py-0.5 rounded ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Text className={`text-xs ${
                  currentQuestion.difficulty === 'easy' ? 'text-green-600' :
                  currentQuestion.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentQuestion.difficulty}
                </Text>
              </View>
            </View>
          </View>

          {/* 选项 (Notices A-H) */}
          <View className="grid grid-cols-1 gap-3 mb-4">
            {currentQuestion.notices.map((notice) => {
              const isSelected = answers.get(currentQuestion.id) === notice.notice_id;
              return (
                <TouchableOpacity
                  key={notice.notice_id}
                  className={`p-4 rounded-xl border-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                  onPress={() => selectAnswer(currentQuestion.id, notice.notice_id)}
                >
                  <View className="flex-row items-center">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Text className={`font-bold ${
                        isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {notice.notice_id}
                      </Text>
                    </View>
                    <Text className="text-gray-900 dark:text-white flex-1">
                      {notice.text}
                    </Text>
                    {isSelected && (
                      <Text className="text-blue-500 text-lg">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* 底部导航 */}
        <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-row justify-between items-center">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              currentIndex === 0 ? 'bg-gray-200' : 'bg-gray-100'
            }`}
            onPress={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <Text className={`${currentIndex === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
              ← 上一题
            </Text>
          </TouchableOpacity>

          {currentIndex < questions.length - 1 ? (
            <TouchableOpacity
              className="px-6 py-2 bg-blue-500 rounded-full"
              onPress={() => goToQuestion(currentIndex + 1)}
            >
              <Text className="text-white font-medium">下一题 →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="px-6 py-2 bg-green-500 rounded-full"
              onPress={submitAnswers}
            >
              <Text className="text-white font-medium">提交答案</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Screen>
  );
}
