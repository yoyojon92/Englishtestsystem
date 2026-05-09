// 测试答题页面
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  BackHandler,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Question {
  index: number;
  questionId: string;
  type: string;
  content: string;
  options: any[];
  skill: string;
  difficulty: string;
}

interface Props {}

export default function TestPlaying({}: Props) {
  const router = useSafeRouter();
  const { sessionId, totalQuestions, totalTime } = useSafeSearchParams<{
    sessionId: string;
    totalQuestions: number;
    totalTime: number;
  }>();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, { answer: string; timeSpent: number }>>(new Map());
  const [remainingTime, setRemainingTime] = useState(parseInt(totalTime) || 900);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const startTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 加载题目
  useEffect(() => {
    loadQuestions();
    
    // 返回键处理
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });
    
    return () => {
      backHandler.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 倒计时
  useEffect(() => {
    if (!loading) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  const loadQuestions = async () => {
    try {
      // 从会话获取题目（实际应该从后端获取）
      const sessionData = await AsyncStorage.getItem('testSession');
      if (sessionData) {
        const { sessionId: sid } = JSON.parse(sessionData);
        
        const response = await fetch(`${API_BASE}/api/v1/test/session/${sid || sessionId}`);
        const result = await response.json();
        
        if (result.success && result.data.questions) {
          setQuestions(result.data.questions);
        } else {
          // 使用快速测试API获取题目
          const quickTestRes = await fetch(`${API_BASE}/api/v1/questions/quick-test`);
          const quickTestData = await quickTestRes.json();
          
          if (quickTestData.success) {
            const qs = quickTestData.data.map((q: any, i: number) => ({
              index: i + 1,
              questionId: q.question_id,
              type: q.question_type,
              content: q.question_text || q.question,
              options: q.options || q.notices || [],
              skill: q.skill,
              difficulty: q.difficulty,
            }));
            setQuestions(qs);
          }
        }
      }
    } catch (error) {
      console.error('Load questions error:', error);
      Alert.alert('错误', '加载题目失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 选择答案
  const handleSelectAnswer = async (answer: string) => {
    const question = questions[currentIndex];
    if (!question) return;
    
    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    
    // 保存答案
    const newAnswers = new Map(answers);
    newAnswers.set(question.questionId, { answer, timeSpent });
    setAnswers(newAnswers);
    setSelectedAnswer(answer);
    
    // 提交到后端
    try {
      await fetch(`${API_BASE}/api/v1/test/session/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.questionId,
          answer,
          timeSpent,
        }),
      });
    } catch (error) {
      console.error('Submit answer error:', error);
    }
  };

  // 上一题
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      questionStartTimeRef.current = Date.now();
      
      const question = questions[currentIndex - 1];
      const savedAnswer = answers.get(question.questionId);
      setSelectedAnswer(savedAnswer?.answer || null);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      questionStartTimeRef.current = Date.now();
      
      const question = questions[currentIndex + 1];
      const savedAnswer = answers.get(question.questionId);
      setSelectedAnswer(savedAnswer?.answer || null);
    }
  };

  // 退出确认
  const handleExit = () => {
    Alert.alert(
      '确认退出',
      '退出后将丢失未提交的答案，确定要退出吗？',
      [
        { text: '继续答题', style: 'cancel' },
        { 
          text: '退出', 
          style: 'destructive',
          onPress: () => router.back()
        },
      ]
    );
  };

  // 提交测试
  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && answers.size < questions.length) {
      Alert.alert(
        '提示',
        `您已完成 ${answers.size}/${questions.length} 题，确定要提交吗？`,
        [
          { text: '继续答题', style: 'cancel' },
          { text: '提交', onPress: doSubmit },
        ]
      );
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/test/session/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 跳转到报告页
        router.replace('/test/report', {
          sessionId,
          ...result.data,
        });
      } else {
        Alert.alert('提示', result.error || '提交失败');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Submit test error:', error);
      Alert.alert('提示', '提交失败，请重试');
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在加载题目...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.container}>
        {/* 顶部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <Text style={[
              styles.timer,
              remainingTime < 60 && styles.timerWarning
            ]}>
              {formatTime(remainingTime)}
            </Text>
          </View>
          
          <Text style={styles.progress}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* 进度条 */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* 题目内容 */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {currentQuestion && (
            <>
              {/* 题干 */}
              <View style={styles.questionCard}>
                <View style={styles.questionMeta}>
                  <Text style={styles.questionType}>
                    {currentQuestion.type === 'match_notice' ? '通知匹配' : '选择题'}
                  </Text>
                  <Text style={styles.questionSkill}>
                    {currentQuestion.skill === 'reading' ? '阅读' : 
                     currentQuestion.skill === 'listening' ? '听力' : 
                     currentQuestion.skill === 'writing' ? '写作' : '口语'}
                  </Text>
                </View>
                
                <Text style={styles.questionContent}>
                  {currentQuestion.content}
                </Text>
              </View>

              {/* 选项 */}
              <View style={styles.options}>
                {(Array.isArray(currentQuestion.options) ? currentQuestion.options : []).map((option: any, idx: number) => {
                  const optionKey = option.id || String.fromCharCode(65 + idx);
                  const optionText = option.text || option;
                  const isSelected = selectedAnswer === optionKey;
                  
                  return (
                    <TouchableOpacity
                      key={optionKey}
                      style={[
                        styles.optionItem,
                        isSelected && styles.optionItemSelected,
                      ]}
                      onPress={() => handleSelectAnswer(optionKey)}
                    >
                      <View style={[
                        styles.optionCircle,
                        isSelected && styles.optionCircleSelected,
                      ]}>
                        <Text style={[
                          styles.optionLetter,
                          isSelected && styles.optionLetterSelected,
                        ]}>
                          {optionKey}
                        </Text>
                      </View>
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                        {optionText}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        {/* 底部操作 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navBtnText}>上一题</Text>
          </TouchableOpacity>
          
          {currentIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleNext}
            >
              <Text style={styles.navBtnText}>下一题</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, styles.submitBtn]}
              onPress={() => handleSubmit()}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? '提交中...' : '提交测试'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#6B7280',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: '#EF4444',
  },
  progress: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    width: 60,
    textAlign: 'right',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  questionType: {
    fontSize: 12,
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionSkill: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionContent: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 26,
  },
  options: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionItemSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionCircleSelected: {
    backgroundColor: '#4F46E5',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionLetterSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
  },
  submitBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
