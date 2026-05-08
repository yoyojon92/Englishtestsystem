/**
 * AI 对话练习页面
 * 
 * 功能：
 * - AI 外教对话
 * - 实时评分反馈
 * - 生成课后评估报告
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Screen } from '@/components/Screen';
import {
  startConversation,
  sendConversationResponse,
  getConversationReport,
} from '@/utils/aiApi';

interface Message {
  id: string;
  role: 'teacher' | 'student';
  content: string;
  scores?: {
    accuracy: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
  };
}

interface Props {
  route?: {
    params?: {
      childId?: string;
      type?: 'post_class' | 'exam_practice' | 'free_conversation';
      level?: 'A1' | 'A2' | 'B1' | 'B2';
    };
  };
}

export default function AIConversation({ route }: Props) {
  const childId = route?.params?.childId || 'demo-child';
  const type = route?.params?.type || 'free_conversation';
  const level = route?.params?.level || 'A2';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [report, setReport] = useState<any>(null);

  const scrollRef = useRef<ScrollView>(null);

  // 初始化会话
  const initSession = async () => {
    setIsLoading(true);
    try {
      const response = await startConversation({
        childId,
        type,
        level,
      });

      if (response.success && response.data) {
        setSessionId(response.data.sessionId);
        setIsSessionStarted(true);
        
        // 添加 AI 的开场白
        setMessages([
          {
            id: '1',
            role: 'teacher',
            content: response.data.question,
          },
        ]);
      } else {
        // 模拟数据
        setSessionId('demo-session-' + Date.now());
        setIsSessionStarted(true);
        setMessages([
          {
            id: '1',
            role: 'teacher',
            content: `Hello! I'm your AI English teacher. Today let's practice ${level} level English together. Can you tell me about yourself? What's your name and how old are you?`,
          },
        ]);
      }
    } catch (error) {
      // 模拟数据
      setSessionId('demo-session-' + Date.now());
      setIsSessionStarted(true);
      setMessages([
        {
          id: '1',
          role: 'teacher',
          content: `Hello! I'm your AI English teacher. Today let's practice ${level} level English together. Can you tell me about yourself? What's your name and how old are you?`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送回复
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'student',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);
    setQuestionCount((prev) => prev + 1);

    try {
      if (sessionId) {
        const response = await sendConversationResponse({
          sessionId,
          answer: currentInput,
          isLast: questionCount >= 4,
        });

        if (response.success && response.data) {
          // 添加 AI 回复
          const teacherMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'teacher',
            content: response.data.teacherResponse,
            scores: response.data.scores,
          };
          setMessages((prev) => [...prev, teacherMessage]);

          // 累加分数
          if (response.data.scores) {
            setTotalScore((prev) => prev + response.data.scores.overall);
          }

          // 检查是否完成
          if (response.data.isComplete && response.data.report) {
            setIsComplete(true);
            setReport(response.data.report);
          }
        } else {
          // 模拟回复
          addSimulatedResponse();
        }
      } else {
        addSimulatedResponse();
      }
    } catch (error) {
      addSimulatedResponse();
    } finally {
      setIsLoading(false);
    }
  };

  // 模拟回复
  const addSimulatedResponse = () => {
    const responses = [
      {
        content: "That's great! Now, can you tell me about your hobbies? What do you like to do in your free time?",
        scores: { accuracy: 75, fluency: 70, vocabulary: 72, grammar: 68 },
      },
      {
        content: "Wonderful! Let's talk about food. What's your favorite food? Can you describe it?",
        scores: { accuracy: 78, fluency: 74, vocabulary: 76, grammar: 72 },
      },
      {
        content: "Excellent! Now, imagine you're planning a trip. Where would you like to go and why?",
        scores: { accuracy: 80, fluency: 76, vocabulary: 78, grammar: 74 },
      },
      {
        content: "Very good! You've done a great job today. Let me give you some feedback on your performance.",
        scores: { accuracy: 82, fluency: 78, vocabulary: 80, grammar: 76 },
      },
    ];

    const responseIndex = Math.min(questionCount, responses.length - 1);
    const simulatedResponse = responses[responseIndex];

    const teacherMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'teacher',
      content: simulatedResponse.content,
      scores: simulatedResponse.scores,
    };

    setMessages((prev) => [...prev, teacherMessage]);
    setTotalScore((prev) => prev + simulatedResponse.scores.accuracy);

    if (questionCount >= 3) {
      setIsComplete(true);
      setReport({
        summary: "Great job in today's conversation practice! You've shown good communication skills.",
        strengths: ['Good pronunciation', 'Clear communication', 'Appropriate vocabulary use'],
        areasForImprovement: ['Complex sentence structures', 'Speaking speed'],
        recommendations: ['Practice daily conversation', 'Listen to native speakers'],
        overallScore: Math.round(totalScore / 4),
        cefrPrediction: level,
      });
    }
  };

  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // 渲染分数
  const renderScores = (scores: Message['scores']) => {
    if (!scores) return null;

    return (
      <View style={styles.scoresContainer}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>准确度</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(scores.accuracy) }]}>
            {scores.accuracy}
          </Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>流利度</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(scores.fluency) }]}>
            {scores.fluency}
          </Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>词汇</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(scores.vocabulary) }]}>
            {scores.vocabulary}
          </Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>语法</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(scores.grammar) }]}>
            {scores.grammar}
          </Text>
        </View>
      </View>
    );
  };

  // 渲染报告
  const renderReport = () => {
    if (!report) return null;

    return (
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>评估报告</Text>
        
        <View style={styles.reportScore}>
          <Text style={styles.reportScoreLabel}>综合得分</Text>
          <Text style={styles.reportScoreValue}>{report.overallScore}</Text>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>优点</Text>
          {report.strengths.map((item: string, index: number) => (
            <Text key={index} style={styles.reportItem}>• {item}</Text>
          ))}
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>需改进</Text>
          {report.areasForImprovement.map((item: string, index: number) => (
            <Text key={index} style={styles.reportItem}>• {item}</Text>
          ))}
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>建议</Text>
          {report.recommendations.map((item: string, index: number) => (
            <Text key={index} style={styles.reportItem}>• {item}</Text>
          ))}
        </View>

        <View style={styles.cefrPrediction}>
          <Text style={styles.cefrLabel}>CEFR 预测等级</Text>
          <Text style={styles.cefrValue}>{report.cefrPrediction}</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI 外教对话</Text>
            <Text style={styles.headerSubtitle}>
              Level: {level} • 问题 {questionCount}/5
            </Text>
          </View>
          {isComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>已完成</Text>
            </View>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'student' && styles.studentMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'student'
                    ? styles.studentBubble
                    : styles.teacherBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'student' && styles.studentText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
              {renderScores(message.scores)}
            </View>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>AI 正在回复...</Text>
              </View>
            </View>
          )}

          {isComplete && renderReport()}
        </ScrollView>

        {!isComplete && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="输入你的回答..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  completeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  studentMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  teacherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentBubble: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  studentText: {
    color: '#FFFFFF',
  },
  scoresContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 8,
  },
  typingIndicator: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  reportScore: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
  },
  reportScoreLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  reportScoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6C63FF',
    marginTop: 4,
  },
  reportSection: {
    marginBottom: 12,
  },
  reportSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reportItem: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  cefrPrediction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  cefrLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  cefrValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
