import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { getMockQuestions, submitMockExam, getExamList, getMockExamHistory, type MockExam } from '@/utils/examApi';
import { useAuth } from '@/contexts/AuthContext';

const examTypeNames: Record<string, string> = {
  'YLE_PRE_A1': 'Pre-A1 Starters',
  'YLE_A1': 'A1 Movers',
  'YLE_A2': 'A2 Flyers',
  'A2_KEY': 'A2 Key (KET)',
  'B1_PRE': 'B1 Preliminary (PET)',
  'B2_FIRST': 'B2 First (FCE)'
};

interface Question {
  questionId: string;
  examType: string;
  component: 'reading' | 'writing' | 'listening' | 'speaking';
  part: number;
  questionNumber: number;
  questionText: string;
  options?: Array<{ label: string; text: string }>;
  correctAnswer: string;
  difficulty: string;
}

export default function MockExamScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const { examType: initExamType } = useSafeSearchParams<{ examType?: string }>();
  
  const [examType, setExamType] = useState<string>(initExamType || 'A2_KEY');
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<MockExam[]>([]);
  const [component, setComponent] = useState<'reading' | 'writing' | 'listening' | 'speaking'>('reading');

  // 组件时间限制（分钟）
  const componentTimeLimits: Record<string, number> = {
    reading: 10,
    writing: 10,
    listening: 8,
    speaking: 5
  };

  useEffect(() => {
    loadExamTypes();
    loadHistory();
  }, []);

  const loadExamTypes = async () => {
    try {
      const data = await getExamList();
      setExamTypes(data);
    } catch (error) {
      console.error('Failed to load exam types:', error);
    }
  };

  const loadHistory = async () => {
    if (!user?.currentChild?.childId) return;
    try {
      const data = await getMockExamHistory({ childId: user.currentChild.childId });
      setHistory(data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const startExam = async () => {
    setLoading(true);
    try {
      const data = await getMockQuestions({ examType, component });
      setQuestions(data);
      setShowExam(true);
      setCurrentQuestion(0);
      setAnswers({});
      setTimeSpent({});
    } catch (error) {
      console.error('Failed to start exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
    setTimeSpent({ ...timeSpent, [questionId]: (timeSpent[questionId] || 0) + 1 });
  };

  const submitExam = async () => {
    if (!user?.currentChild?.childId) {
      Alert.alert('提示', '请先选择孩子');
      return;
    }

    setLoading(true);
    try {
      const answerList = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        timeSpent: timeSpent[questionId] || 0
      }));

      const data = await submitMockExam({
        childId: user.currentChild.childId,
        examType,
        answers: answerList
      });

      setResult(data);
      setShowExam(false);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to submit exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (pct: number) => {
    if (pct >= 85) return { bg: '#E8F5E9', text: '#2E7D32' };
    if (pct >= 60) return { bg: '#FFF3E0', text: '#E65100' };
    return { bg: '#FFEBEE', text: '#C62828' };
  };

  // 模拟考试主页面
  if (!showExam && !showResult) {
    return (
      <Screen>
        <ScrollView className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="px-6 pt-4 pb-6 bg-gradient-to-r from-[#6C63FF] to-[#FF6584]">
            <Text className="text-2xl font-bold text-white">全真模拟考试</Text>
            <Text className="mt-1 text-white/80 text-sm">严格按照剑桥官方考试结构</Text>
          </View>

          <View className="px-4 py-4">
            {/* Exam Type Selector */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">选择考试级别</Text>
              <View className="flex-row flex-wrap">
                {examTypes.map(exam => (
                  <TouchableOpacity
                    key={exam.examId}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      examType === exam.examId ? 'bg-[#6C63FF]' : 'bg-gray-100'
                    }`}
                    onPress={() => setExamType(exam.examId)}
                  >
                    <Text className={`text-sm ${examType === exam.examId ? 'text-white' : 'text-gray-600'}`}>
                      {examTypeNames[exam.examId] || exam.examName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Component Selector */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">选择考试模块</Text>
              <View className="flex-row flex-wrap">
                {[
                  { key: 'reading', label: '阅读', icon: '📖', time: 10 },
                  { key: 'writing', label: '写作', icon: '✍️', time: 10 },
                  { key: 'listening', label: '听力', icon: '🎧', time: 8 },
                  { key: 'speaking', label: '口语', icon: '🎤', time: 5 }
                ].map(comp => (
                  <TouchableOpacity
                    key={comp.key}
                    className={`flex-1 min-w-[45%] p-4 rounded-xl mr-2 mb-2 items-center ${
                      component === comp.key ? 'bg-[#6C63FF]' : 'bg-gray-100'
                    }`}
                    onPress={() => setComponent(comp.key as any)}
                  >
                    <Text className="text-2xl mb-1">{comp.icon}</Text>
                    <Text className={`font-medium ${component === comp.key ? 'text-white' : 'text-gray-700'}`}>
                      {comp.label}
                    </Text>
                    <Text className={`text-xs ${component === comp.key ? 'text-white/80' : 'text-gray-400'}`}>
                      {comp.time}分钟
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Exam Info */}
            <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-xl mr-2">📋</Text>
                <Text className="font-bold text-gray-800">考试说明</Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Text className="text-gray-400 mr-2">•</Text>
                  <Text className="text-sm text-gray-600">严格按正式考试时间限制</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 mr-2">•</Text>
                  <Text className="text-sm text-gray-600">提交后立即显示成绩分析</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 mr-2">•</Text>
                  <Text className="text-sm text-gray-600">生成个性化薄弱项报告</Text>
                </View>
              </View>
            </View>

            {/* Recent History */}
            {history.length > 0 && (
              <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <Text className="text-base font-bold text-gray-800 mb-3">最近成绩</Text>
                {history.map((exam, idx) => {
                  const colors = getConfidenceColor(exam.passConfidencePct);
                  return (
                    <TouchableOpacity
                      key={idx}
                      className="p-3 bg-gray-50 rounded-xl mb-2"
                      onPress={() => {
                        setResult(exam);
                        setShowResult(true);
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="font-medium text-gray-800">
                            {examTypeNames[exam.examType] || exam.examType}
                          </Text>
                          <Text className="text-xs text-gray-400 mt-1">
                            {new Date(exam.examDate).toLocaleDateString()}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="font-bold text-[#6C63FF]">{exam.totalScore}/{exam.totalMax}</Text>
                          <View className="mt-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.bg }}>
                            <Text className="text-xs font-medium" style={{ color: colors.text }}>
                              {exam.predictedGrade}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Start Button */}
            <TouchableOpacity
              className="p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF]"
              onPress={startExam}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="items-center">
                  <Text className="text-white font-bold text-lg">开始模拟考试</Text>
                  <Text className="text-white/80 text-sm mt-1">
                    {examTypeNames[examType]} · {component === 'reading' ? '阅读' : component === 'writing' ? '写作' : component === 'listening' ? '听力' : '口语'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // 考试进行中页面
  if (showExam) {
    const q = questions[currentQuestion];
    const timeLimit = componentTimeLimits[component] || 10;

    return (
      <Screen>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="px-4 py-3 bg-white border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowExam(false)}>
                <Text className="text-gray-500">取消</Text>
              </TouchableOpacity>
              <View className="items-center">
                <Text className="font-medium text-gray-800">
                  {component === 'reading' ? '阅读' : component === 'writing' ? '写作' : component === 'listening' ? '听力' : '口语'}
                </Text>
                <Text className="text-xs text-gray-400">
                  {currentQuestion + 1} / {questions.length}
                </Text>
              </View>
              <TouchableOpacity onPress={submitExam}>
                <Text className="text-[#6C63FF] font-medium">交卷</Text>
              </TouchableOpacity>
            </View>
            
            {/* Progress Bar */}
            <View className="mt-2 h-1 bg-gray-200 rounded-full">
              <View 
                className="h-1 bg-[#6C63FF] rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </View>
          </View>

          {/* Question */}
          <ScrollView className="flex-1 p-4">
            {q && (
              <>
                <Text className="text-sm text-gray-500 mb-2">
                  Part {q.part} · 第 {q.questionNumber} 题
                </Text>
                <Text className="text-base text-gray-800 leading-7 mb-6">
                  {q.questionText}
                </Text>

                {q.options && (
                  <View className="space-y-3">
                    {q.options.map((opt) => (
                      <TouchableOpacity
                        key={opt.label}
                        className={`p-4 rounded-xl border-2 ${
                          answers[q.questionId] === opt.label 
                            ? 'border-[#6C63FF] bg-[#6C63FF]/5' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onPress={() => handleAnswer(q.questionId, opt.label)}
                      >
                        <View className="flex-row items-center">
                          <View 
                            className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                              answers[q.questionId] === opt.label 
                                ? 'bg-[#6C63FF]' 
                                : 'border-2 border-gray-300'
                            }`}
                          >
                            {answers[q.questionId] === opt.label && (
                              <Text className="text-white text-sm font-bold">{opt.label}</Text>
                            )}
                          </View>
                          <Text className="flex-1 text-gray-700">{opt.text}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Writing input */}
                {component === 'writing' && (
                  <View className="mt-4">
                    <Text className="text-sm text-gray-500 mb-2">请在此作答：</Text>
                    <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <TextInput
                        className="text-gray-800 min-h-[150px]"
                        multiline
                        placeholder="在此输入你的答案..."
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Bottom Navigation */}
          <View className="p-4 bg-white border-t border-gray-100 flex-row">
            <TouchableOpacity
              className="flex-1 p-4 rounded-xl bg-gray-100 mr-2 items-center"
              onPress={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              <Text className={`font-medium ${currentQuestion === 0 ? 'text-gray-300' : 'text-gray-700'}`}>
                上一题
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 p-4 rounded-xl bg-[#6C63FF] ml-2 items-center"
              onPress={() => currentQuestion < questions.length - 1 && setCurrentQuestion(currentQuestion + 1)}
              disabled={currentQuestion === questions.length - 1}
            >
              <Text className="font-medium text-white">
                下一题
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  // 成绩展示页面
  if (showResult && result) {
    const colors = getConfidenceColor(result.passConfidencePct);
    
    return (
      <Screen>
        <ScrollView className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="px-6 pt-6 pb-8 bg-gradient-to-r from-[#6C63FF] to-[#FF6584]">
            <Text className="text-white/80 text-sm mb-2">模拟考试成绩</Text>
            <Text className="text-3xl font-bold text-white">
              {result.totalScore} / {result.totalMax}
            </Text>
            <View 
              className="mt-3 px-4 py-2 rounded-full inline-block"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-white font-medium">{result.predictedGrade}</Text>
            </View>
          </View>

          <View className="px-4 -mt-4">
            {/* Score Breakdown */}
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <Text className="text-base font-bold text-gray-800 mb-4">各项得分</Text>
              
              <View className="space-y-4">
                {[
                  { name: '阅读', score: result.readingScore, max: result.readingMax, color: '#4CAF50' },
                  { name: '写作', score: result.writingScore, max: result.writingMax, color: '#2196F3' },
                  { name: '听力', score: result.listeningScore, max: result.listeningMax, color: '#FF9800' },
                  { name: '口语', score: result.speakingScore, max: result.speakingMax, color: '#E91E63' }
                ].map((item) => (
                  <View key={item.name}>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm text-gray-600">{item.name}</Text>
                      <Text className="font-medium text-gray-800">{item.score} / {item.max}</Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full">
                      <View 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(item.score / item.max) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Pass Confidence */}
            <View 
              className="bg-white rounded-2xl p-5 shadow-sm mb-4"
              style={{ borderLeftWidth: 4, borderLeftColor: colors.text }}
            >
              <Text className="text-base font-bold text-gray-800 mb-2">通过信心指数</Text>
              <View className="flex-row items-center">
                <Text className="text-4xl font-bold mr-3" style={{ color: colors.text }}>
                  {result.passConfidencePct}%
                </Text>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600">
                    {result.passConfidencePct >= 85 
                      ? '预测通过率较高，可报名正式考试'
                      : result.passConfidencePct >= 60
                      ? '建议继续加强后报名'
                      : '建议先进行系统学习'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Analysis */}
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <Text className="text-base font-bold text-gray-800 mb-4">能力分析</Text>
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-green-600 mb-2">✅ 优势项</Text>
                {result.detailedAnalysis?.strengths?.map((s: string, idx: number) => (
                  <View key={idx} className="flex-row items-start mb-1">
                    <Text className="text-gray-400 mr-2">•</Text>
                    <Text className="text-sm text-gray-600 flex-1">{s}</Text>
                  </View>
                ))}
              </View>
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-red-500 mb-2">⚠️ 待提升</Text>
                {result.detailedAnalysis?.weaknesses?.map((w: string, idx: number) => (
                  <View key={idx} className="flex-row items-start mb-1">
                    <Text className="text-gray-400 mr-2">•</Text>
                    <Text className="text-sm text-gray-600 flex-1">{w}</Text>
                  </View>
                ))}
              </View>
              
              <View>
                <Text className="text-sm font-medium text-[#6C63FF] mb-2">💡 建议</Text>
                {result.detailedAnalysis?.recommendations?.map((r: string, idx: number) => (
                  <View key={idx} className="flex-row items-start mb-1">
                    <Text className="text-gray-400 mr-2">•</Text>
                    <Text className="text-sm text-gray-600 flex-1">{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View className="space-y-3 pb-8">
              <TouchableOpacity
                className="p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF]"
                onPress={() => {
                  setShowResult(false);
                  startExam();
                }}
              >
                <Text className="text-white font-bold text-center">再次模拟</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="p-4 rounded-2xl bg-white border-2 border-[#6C63FF]"
                onPress={() => router.push('/exams/plans')}
              >
                <Text className="text-[#6C63FF] font-bold text-center">制定备考计划</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return null;
}

function TextInput(props: any) {
  return (
    <View {...props}>
      <TextInput {...props} className={props.className} />
    </View>
  );
}
