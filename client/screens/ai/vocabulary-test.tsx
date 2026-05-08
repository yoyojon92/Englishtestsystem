/**
 * AI 词汇量测试页面
 * 
 * 功能：
 * - 自适应词汇量测试
 * - CEFR 等级评估
 * - 词汇地图展示
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { estimateVocabulary } from '@/utils/aiApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 词汇测试题目（按难度分组）
const VOCABULARY_QUESTIONS = [
  // A1 级别 (500-1000词)
  { word: 'apple', options: ['苹果', '香蕉', '橙子', '葡萄'], correct: 0, level: 'A1' },
  { word: 'run', options: ['走', '跑', '跳', '飞'], correct: 1, level: 'A1' },
  { word: 'happy', options: ['悲伤', '生气', '开心', '惊讶'], correct: 2, level: 'A1' },
  { word: 'house', options: ['学校', '医院', '房子', '商店'], correct: 2, level: 'A1' },
  { word: 'book', options: ['书', '桌子', '椅子', '窗户'], correct: 0, level: 'A1' },
  
  // A2 级别 (1000-2500词)
  { word: 'achieve', options: ['失败', '尝试', '完成', '放弃'], correct: 2, level: 'A2' },
  { word: 'ancient', options: ['现代的', '古老的', '未来的', '短暂的'], correct: 1, level: 'A2' },
  { word: 'benefit', options: ['坏处', '好处', '开始', '结束'], correct: 1, level: 'A2' },
  { word: 'culture', options: ['自然', '文化', '科技', '经济'], correct: 1, level: 'A2' },
  { word: 'environment', options: ['环境', '家庭', '学校', '社会'], correct: 0, level: 'A2' },
  
  // B1 级别 (2500-5000词)
  { word: 'abundant', options: ['稀少的', '丰富的', '珍贵的', '普通的'], correct: 1, level: 'B1' },
  { word: 'acknowledge', options: ['否认', '承认', '怀疑', '忽略'], correct: 1, level: 'B1' },
  { word: 'alternative', options: ['相同的', '传统的', '替代的', '唯一的'], correct: 2, level: 'B1' },
  { word: 'sufficient', options: ['不足的', '过剩的', '充足的', '平等的'], correct: 2, level: 'B1' },
  { word: 'sustainable', options: ['不可持续的', '可持续的', '短暂的', '永久的'], correct: 1, level: 'B1' },
  
  // B2 级别 (5000-10000词)
  { word: 'ambiguous', options: ['明确的', '模糊的', '正确的', '错误的'], correct: 1, level: 'B2' },
  { word: 'comprehensive', options: ['有限的', '全面的', '部分的', '表面的'], correct: 1, level: 'B2' },
  { word: 'deprecated', options: ['推荐的', '新式的', '过时的', '创新的'], correct: 2, level: 'B2' },
  { word: 'hypothesis', options: ['事实', '假设', '理论', '定律'], correct: 1, level: 'B2' },
  { word: 'paradigm', options: ['案例', '范例', '规则', '例外'], correct: 1, level: 'B2' },
];

interface Question {
  word: string;
  options: string[];
  correct: number;
  level: string;
}

export default function AIVocabularyTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{
    estimatedVocabulary: number;
    cefrLevel: string;
    accuracy: number;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [levelSequence, setLevelSequence] = useState<('A1' | 'A2' | 'B1' | 'B2')[]>([]);
  const [levelCorrect, setLevelCorrect] = useState({ A1: 0, A2: 0, B1: 0, B2: 0 });
  const [levelTotal, setLevelTotal] = useState({ A1: 0, A2: 0, B1: 0, B2: 0 });

  // 初始化测试
  const initTest = () => {
    // 随机选择每级别5题
    const selectedQuestions: Question[] = [];
    const levels: ('A1' | 'A2' | 'B1' | 'B2')[] = ['A1', 'A2', 'B1', 'B2'];
    
    levels.forEach((level) => {
      const levelQuestions = VOCABULARY_QUESTIONS.filter((q) => q.level === level);
      const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5);
      selectedQuestions.push(...shuffled.slice(0, 5));
    });

    // 打乱顺序
    const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
    setLevelSequence(levels);
  };

  useEffect(() => {
    initTest();
  }, []);

  // 选择答案
  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setTotalQuestions((prev) => prev + 1);

    const currentQuestion = questions[currentIndex];
    if (index === currentQuestion.correct) {
      setCorrectCount((prev) => prev + 1);
      
      // 记录每级别正确数
      setLevelCorrect((prev) => ({
        ...prev,
        [currentQuestion.level]: prev[currentQuestion.level as keyof typeof prev] + 1,
      }));
    }

    // 记录每级别总数
    setLevelTotal((prev) => ({
      ...prev,
      [currentQuestion.level]: prev[currentQuestion.level as keyof typeof prev] + 1,
    }));

    // 更新当前测试级别
    setCurrentLevel(currentQuestion.level as 'A1' | 'A2' | 'B1' | 'B2');
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishTest();
    }
  };

  // 完成测试
  const finishTest = async () => {
    const response = await estimateVocabulary({
      correctCount,
      totalQuestions,
    });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      // 根据正确率计算结果
      const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      let estimatedVocabulary = 500;
      let cefrLevel = 'Pre-A1';

      // 根据每级别正确率估算
      const a1Accuracy = levelTotal.A1 > 0 ? levelCorrect.A1 / levelTotal.A1 : 0;
      const a2Accuracy = levelTotal.A2 > 0 ? levelCorrect.A2 / levelTotal.A2 : 0;
      const b1Accuracy = levelTotal.B1 > 0 ? levelCorrect.B1 / levelTotal.B1 : 0;
      const b2Accuracy = levelTotal.B2 > 0 ? levelCorrect.B2 / levelTotal.B2 : 0;

      if (b2Accuracy >= 0.6) {
        estimatedVocabulary = 6000 + Math.round(b2Accuracy * 4000);
        cefrLevel = 'B2';
      } else if (b1Accuracy >= 0.6) {
        estimatedVocabulary = 3000 + Math.round(b1Accuracy * 3000);
        cefrLevel = 'B1';
      } else if (a2Accuracy >= 0.6) {
        estimatedVocabulary = 1500 + Math.round(a2Accuracy * 1500);
        cefrLevel = 'A2';
      } else if (a1Accuracy >= 0.6) {
        estimatedVocabulary = 800 + Math.round(a1Accuracy * 700);
        cefrLevel = 'A1';
      }

      setResult({
        estimatedVocabulary,
        cefrLevel,
        accuracy,
        confidence: accuracy >= 80 ? 'high' : accuracy >= 60 ? 'medium' : 'low',
      });
    }

    setIsComplete(true);
  };

  // 重新开始
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setTotalQuestions(0);
    setIsComplete(false);
    setResult(null);
    setLevelCorrect({ A1: 0, A2: 0, B1: 0, B2: 0 });
    setLevelTotal({ A1: 0, A2: 0, B1: 0, B2: 0 });
    initTest();
  };

  // 获取 CEFR 等级描述
  const getCEFRDescription = (level: string) => {
    const descriptions: Record<string, string> = {
      'Pre-A1': '入门级 - 掌握最基础的词汇',
      'A1': '初级 - 能进行简单的日常交流',
      'A2': '基础中级 - 能处理日常事务',
      'B1': '中级 - 能独立使用英语',
      'B2': '中高级 - 能流利表达观点',
    };
    return descriptions[level] || descriptions['A1'];
  };

  // 获取词汇量范围描述
  const getVocabularyRange = (vocab: number) => {
    if (vocab >= 6000) return '高级水平，可应对学术和专业场景';
    if (vocab >= 3500) return '中级水平，可进行流利的日常交流';
    if (vocab >= 1500) return '基础水平，可处理简单日常事务';
    if (vocab >= 500) return '入门水平，需继续扩充词汇量';
    return '词汇量较少，建议从基础词汇开始学习';
  };

  if (questions.length === 0) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  if (isComplete && result) {
    return (
      <Screen>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>词汇量测试结果</Text>
          </View>

          {/* Main Result */}
          <View style={styles.resultCard}>
            <Text style={styles.vocabularyNumber}>{result.estimatedVocabulary}</Text>
            <Text style={styles.vocabularyLabel}>词汇量</Text>
            
            <View style={styles.cefrBadge}>
              <Text style={styles.cefrText}>CEFR {result.cefrLevel}</Text>
            </View>
            
            <Text style={styles.cefrDescription}>{getCEFRDescription(result.cefrLevel)}</Text>
          </View>

          {/* Accuracy */}
          <View style={styles.accuracyCard}>
            <Text style={styles.accuracyTitle}>测试准确率</Text>
            <View style={styles.accuracyBar}>
              <View
                style={[
                  styles.accuracyFill,
                  { width: `${result.accuracy}%` },
                ]}
              />
            </View>
            <Text style={styles.accuracyValue}>{result.accuracy.toFixed(1)}%</Text>
          </View>

          {/* Level Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>各级别正确率</Text>
            {(['A1', 'A2', 'B1', 'B2'] as const).map((level) => {
              const total = levelTotal[level];
              const correct = levelCorrect[level];
              const accuracy = total > 0 ? (correct / total) * 100 : 0;
              
              return (
                <View key={level} style={styles.levelRow}>
                  <Text style={styles.levelName}>{level}</Text>
                  <View style={styles.levelBar}>
                    <View
                      style={[
                        styles.levelFill,
                        { width: `${accuracy}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.levelScore}>
                    {correct}/{total}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>学习建议</Text>
            <Text style={styles.suggestionText}>
              {getVocabularyRange(result.estimatedVocabulary)}
            </Text>
            <Text style={styles.suggestionText}>
              建议每天学习 10-20 个新单词，配合阅读和听力练习效果更佳。
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.restartButtonText}>重新测试</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>

        {/* Level Indicator */}
        <View style={styles.levelIndicator}>
          <Text style={styles.levelIndicatorText}>当前级别: {currentLevel}</Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>以下哪个是 "{currentQuestion.word}" 的意思？</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct;
            const showResult = selectedAnswer !== null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionSelected,
                  showResult && isCorrect && styles.optionCorrect,
                  showResult && isSelected && !isCorrect && styles.optionWrong,
                ]}
                onPress={() => handleSelectAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
                {showResult && isCorrect && (
                  <Text style={styles.optionIcon}>✓</Text>
                )}
                {showResult && isSelected && !isCorrect && (
                  <Text style={styles.optionIconX}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {selectedAnswer !== null && (
          <View style={styles.feedbackSection}>
            <Text
              style={[
                styles.feedbackText,
                selectedAnswer === currentQuestion.correct
                  ? styles.feedbackCorrect
                  : styles.feedbackWrong,
              ]}
            >
              {selectedAnswer === currentQuestion.correct
                ? '回答正确！'
                : `回答错误，正确答案是：${currentQuestion.options[currentQuestion.correct]}`}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  levelIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  levelIndicatorText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  questionLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#EEF2FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  optionIcon: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '700',
  },
  optionIconX: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '700',
  },
  feedbackSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  feedbackCorrect: {
    color: '#10B981',
  },
  feedbackWrong: {
    color: '#EF4444',
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Result Styles
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  vocabularyNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#6C63FF',
  },
  vocabularyLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 4,
  },
  cefrBadge: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  cefrText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cefrDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 12,
    textAlign: 'center',
  },
  accuracyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  accuracyTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  accuracyBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 8,
    textAlign: 'center',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelName: {
    width: 32,
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  levelBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  levelScore: {
    width: 40,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  suggestionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
  },
  actions: {
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 24,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
