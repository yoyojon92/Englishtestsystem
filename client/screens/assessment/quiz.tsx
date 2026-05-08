import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { assessmentApi } from '@/utils/assessmentApi';
import { Screen } from '@/components/Screen';

interface Question {
  id: string;
  category: 'listening' | 'reading' | 'writing' | 'speaking';
  difficulty: number;
  question: string;
  options?: string[];
}

export default function AssessmentQuizScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const { assessmentId } = useSafeSearchParams<{ assessmentId: string }>();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assessmentId && token) {
      loadQuestions();
    }
  }, [assessmentId, token]);

  const loadQuestions = async () => {
    try {
      const data = await assessmentApi.getAssessmentQuestions(token!, assessmentId!);
      setQuestions(data.questions || []);
    } catch (error: any) {
      Alert.alert('错误', '加载题目失败');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert(
        '提示',
        `还有 ${unanswered.length} 道题未作答，确定要提交吗？`,
        [
          { text: '继续答题', style: 'cancel' },
          { text: '确认提交', onPress: doSubmit },
        ]
      );
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await assessmentApi.submitAssessment(token!, assessmentId!, answers);
      router.replace('/assessment-result', {
        assessmentId,
        score: data.score.toString(),
        reportId: data.report.id,
      });
    } catch (error: any) {
      Alert.alert('错误', error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      listening: '#2196F3',
      reading: '#4CAF50',
      writing: '#FF9800',
      speaking: '#9C27B0',
    };
    return colors[category] || '#6C63FF';
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      listening: '听力',
      reading: '阅读',
      writing: '写作',
      speaking: '口语',
    };
    return names[category] || category;
  };

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
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#6C63FF', '#896BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      {/* Question Content */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${getCategoryColor(currentQuestion?.category)}20` },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(currentQuestion?.category) },
              ]}
            >
              {getCategoryName(currentQuestion?.category)}
            </Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion?.question}</Text>
        </View>

        {/* Options */}
        {currentQuestion?.options && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => handleSelectAnswer(currentQuestion.id, option)}
                >
                  <View
                    style={[
                      styles.optionLetter,
                      isSelected && styles.optionLetterSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLetterText,
                        isSelected && styles.optionLetterTextSelected,
                      ]}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Writing Question Input */}
        {!currentQuestion?.options && (
          <View style={styles.writingContainer}>
            <View style={styles.textInputContainer}>
              {/* Placeholder for writing input */}
              <Text style={styles.writingHint}>请输入你的答案</Text>
            </View>
          </View>
        )}

        {/* Question Navigator */}
        <View style={styles.navigatorContainer}>
          <Text style={styles.navigatorTitle}>题目导航</Text>
          <View style={styles.navigatorGrid}>
            {questions.map((q, index) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = index === currentIndex;
              
              return (
                <TouchableOpacity
                  key={q.id}
                  style={[
                    styles.navDot,
                    isAnswered && styles.navDotAnswered,
                    isCurrent && styles.navDotCurrent,
                  ]}
                  onPress={() => setCurrentIndex(index)}
                >
                  <Text
                    style={[
                      styles.navDotText,
                      isAnswered && styles.navDotTextAnswered,
                      isCurrent && styles.navDotTextCurrent,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotAnswered]} />
              <Text style={styles.legendText}>已答</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotCurrent]} />
              <Text style={styles.legendText}>当前</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotUnanswered]} />
              <Text style={styles.legendText}>未答</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            上一题
          </Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <LinearGradient
              colors={submitting ? ['#B2BEC3', '#B2BEC3'] : ['#6C63FF', '#896BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? '提交中...' : '提交答案'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>下一题</Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
  },
  progressHeader: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8E8EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionCardSelected: {
    borderColor: '#6C63FF',
    backgroundColor: 'rgba(108,99,255,0.05)',
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterSelected: {
    backgroundColor: '#6C63FF',
  },
  optionLetterText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#636E72',
  },
  optionLetterTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  writingContainer: {
    marginBottom: 24,
  },
  textInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 150,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  writingHint: {
    fontSize: 14,
    color: '#B2BEC3',
    textAlign: 'center',
  },
  navigatorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  navigatorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  navigatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navDotAnswered: {
    backgroundColor: '#6C63FF',
  },
  navDotCurrent: {
    backgroundColor: '#FF6584',
  },
  navDotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  navDotTextAnswered: {
    color: '#FFFFFF',
  },
  navDotTextCurrent: {
    color: '#FFFFFF',
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendDotAnswered: {
    backgroundColor: '#6C63FF',
  },
  legendDotCurrent: {
    backgroundColor: '#FF6584',
  },
  legendDotUnanswered: {
    backgroundColor: '#E8E8EB',
  },
  legendText: {
    fontSize: 12,
    color: '#636E72',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#E8E8EB',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  navButtonTextDisabled: {
    color: '#B2BEC3',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
